# Zumra Chat Platform - Self-Deployment Guide

This guide will help you deploy the Zumra chat platform on your own domain using GoDaddy or similar hosting services, and set up analytics to monitor user interactions and ad revenue.

## Deployment Options

### Option 1: Shared Hosting (GoDaddy, Bluehost, etc.)

1. **Prerequisites**:
   - A domain name (e.g., yourdomain.com)
   - Shared hosting plan with Node.js support
   - FTP access or hosting control panel

2. **Deployment Steps**:
   - Upload the `dist` folder contents to your web hosting's public directory (usually `public_html` or `www`)
   - Set up Node.js environment (if supported by your hosting provider)
   - Configure the backend server to run as a service

3. **Limitations**:
   - Many shared hosting providers have limited Node.js support
   - WebSocket connections might be restricted
   - Scaling to 1000 concurrent users may be challenging

### Option 2: VPS or Dedicated Server (Recommended)

1. **Prerequisites**:
   - A domain name (e.g., yourdomain.com)
   - VPS or dedicated server (DigitalOcean, Linode, AWS EC2, etc.)
   - SSH access to the server

2. **Deployment Steps**:
   - Set up a server with Ubuntu 20.04 or later
   - Install Docker and Docker Compose
   - Upload the entire project folder to the server
   - Configure DNS to point your domain to the server
   - Run `docker-compose up -d` to start the application

3. **Advantages**:
   - Full control over the environment
   - Better performance and scalability
   - Support for WebSockets and 1000+ concurrent users

### Option 3: Cloud Platform Services

1. **Prerequisites**:
   - A domain name (e.g., yourdomain.com)
   - Account with a cloud provider (AWS, Google Cloud, Azure)
   - Basic knowledge of cloud services

2. **Deployment Options**:
   - AWS: Elastic Beanstalk or ECS with Fargate
   - Google Cloud: Cloud Run or GKE
   - Azure: App Service or AKS

3. **Advantages**:
   - Managed infrastructure
   - Built-in scaling capabilities
   - High availability

## Domain Configuration

1. **DNS Setup**:
   - Log in to your domain registrar (GoDaddy, Namecheap, etc.)
   - Navigate to the DNS management section
   - Add an A record pointing to your server's IP address:
     ```
     Type: A
     Name: @
     Value: YOUR_SERVER_IP
     TTL: 3600
     ```
   - Add a CNAME record for the www subdomain:
     ```
     Type: CNAME
     Name: www
     Value: @
     TTL: 3600
     ```

2. **SSL Certificate**:
   - For shared hosting: Use the hosting provider's SSL options
   - For VPS/dedicated: Use Let's Encrypt with Certbot as configured in the Docker setup
   - For cloud platforms: Use the platform's SSL certificate management

## Monitoring User Interactions

### Google Analytics Integration

1. **Setup**:
   - Create a Google Analytics account at https://analytics.google.com/
   - Set up a new property for your website
   - Get your tracking ID (format: UA-XXXXXXXX-X or G-XXXXXXXX)

2. **Implementation**:
   - Open `/src/index.js`
   - Add the Google Analytics tracking code:
     ```javascript
     // Add this near the top of the file
     import ReactGA from 'react-ga';
     
     // Initialize GA
     ReactGA.initialize('YOUR_TRACKING_ID');
     
     // Track page views
     const history = createBrowserHistory();
     history.listen((location) => {
       ReactGA.set({ page: location.pathname });
       ReactGA.pageview(location.pathname);
     });
     ```
   - Install the required package: `npm install react-ga`
   - Rebuild the application: `npm run build`

3. **Custom Events**:
   - Track room creation:
     ```javascript
     ReactGA.event({
       category: 'Room',
       action: 'Created',
       label: roomType // 'video', 'audio', or 'chat'
     });
     ```
   - Track room joining:
     ```javascript
     ReactGA.event({
       category: 'Room',
       action: 'Joined',
       label: roomId
     });
     ```
   - Track messages sent:
     ```javascript
     ReactGA.event({
       category: 'Message',
       action: 'Sent',
       value: messageLength
     });
     ```

### Custom Analytics Dashboard

The application includes a built-in analytics system that stores data in MongoDB. To access it:

1. **Admin Dashboard**:
   - Access `/admin` route with your admin credentials
   - View real-time statistics on:
     - Active rooms and participants
     - Message volume
     - User retention
     - Device and browser statistics

2. **API Endpoints**:
   - `/api/analytics/rooms`: Room creation and usage statistics
   - `/api/analytics/users`: User engagement metrics
   - `/api/analytics/messages`: Message volume and patterns

## Ad Revenue Tracking

### Google AdSense Integration

1. **Setup**:
   - Create a Google AdSense account at https://www.google.com/adsense/
   - Add your website and get approval
   - Get your AdSense publisher ID

2. **Implementation**:
   - Open `/src/components/AdInterstitial.js`
   - Update the AdSense code with your publisher ID:
     ```javascript
     <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
     <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="YOUR_PUBLISHER_ID"
          data-ad-slot="YOUR_AD_SLOT"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
     <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
     </script>
     ```
   - Rebuild the application: `npm run build`

3. **Revenue Tracking**:
   - Monitor ad performance in your AdSense dashboard
   - The application's analytics system also tracks ad impressions and clicks

### Custom Ad Integration

For direct ad deals or custom ad networks:

1. **Ad Placement**:
   - The application has designated ad slots in:
     - Homepage (banner)
     - Room creation page (sidebar)
     - Chat rooms (interstitial before joining)
     - Room expiry page (full-page ad)

2. **Ad Server Integration**:
   - Update `/src/utils/adManager.js` with your ad server endpoints
   - Configure frequency and targeting in `/backend/routes/ads.js`

3. **Revenue Tracking**:
   - Implement tracking pixels or callbacks to your ad server
   - Use the built-in analytics system to correlate ad views with user behavior

## Scaling for 1000+ Concurrent Users

The application is designed to handle 1000 concurrent users with the following architecture:

1. **Horizontal Scaling**:
   - The Docker Compose setup can be extended to run multiple backend instances
   - Update the Nginx configuration to load balance across these instances

2. **Database Scaling**:
   - For higher loads, consider using MongoDB Atlas or a similar managed service
   - Update the connection string in `.env.production`

3. **WebSocket Optimization**:
   - The Socket.io configuration is already optimized for high concurrency
   - For extreme scaling, consider using Redis adapter for Socket.io

## Maintenance and Updates

1. **Monitoring**:
   - Set up server monitoring with tools like Prometheus and Grafana
   - Configure alerts for high CPU/memory usage or error rates

2. **Backups**:
   - Regularly backup the MongoDB database
   - For Docker volumes: `docker run --rm -v zumra_mongodb_data:/data -v /backup:/backup ubuntu tar cvf /backup/mongodb_backup.tar /data`

3. **Updates**:
   - Pull the latest code from the repository
   - Run `npm install` to update dependencies
   - Rebuild with `npm run build`
   - Restart the containers with `docker-compose down && docker-compose up -d`

## Troubleshooting

1. **WebSocket Connection Issues**:
   - Ensure your hosting provider allows WebSocket connections
   - Check Nginx configuration for proper WebSocket proxy settings
   - Verify firewall rules allow WebSocket traffic (port 443)

2. **Database Connection Problems**:
   - Check MongoDB connection string in `.env.production`
   - Verify network connectivity between application and database
   - Check MongoDB logs for authentication or permission issues

3. **Performance Issues**:
   - Monitor server resources (CPU, memory, network)
   - Check application logs for slow queries or operations
   - Consider scaling up resources or optimizing database queries

## Support and Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Nginx Documentation: https://nginx.org/en/docs/
- Docker Documentation: https://docs.docker.com/
- Socket.io Documentation: https://socket.io/docs/
