# Zumra Chat Platform - Self-Deployment Guide

This guide provides detailed instructions for deploying the Zumra chat platform on your own domain through GoDaddy or similar hosting services.

## Table of Contents
1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Domain Setup](#domain-setup)
4. [VPS Deployment (Recommended)](#vps-deployment-recommended)
5. [Shared Hosting Deployment](#shared-hosting-deployment)
6. [Monitoring and Analytics](#monitoring-and-analytics)
7. [Ad Revenue Integration](#ad-revenue-integration)
8. [Troubleshooting](#troubleshooting)

## Overview

Zumra is a lightweight, mobile-optimized chat platform designed to handle up to 1000 concurrent users. The platform features:

- Instant chat rooms without registration
- Mobile-responsive design optimized for phone users
- Room capacity management
- Real-time messaging
- Analytics dashboard
- Ad monetization options

## Deployment Options

There are two main deployment options:

1. **VPS Deployment (Recommended)**: For full functionality and 1000 concurrent user support
2. **Shared Hosting Deployment**: For smaller deployments with fewer concurrent users

## Domain Setup

Before deployment, you'll need to set up your domain:

1. Log in to your GoDaddy (or other domain provider) account
2. Navigate to the DNS Management section
3. Add the appropriate DNS records based on your deployment option:
   - For VPS: Add an A record pointing to your server's IP address
   - For shared hosting: Use the CNAME or A records provided by your hosting service

## VPS Deployment (Recommended)

### Prerequisites
- A VPS with at least 2GB RAM, 2 CPU cores, and 50GB storage
- Ubuntu 20.04 or later
- Domain name pointing to your server's IP address

### Step 1: Server Setup
```bash
# Update system
apt update && apt upgrade -y

# Install Docker and Docker Compose
apt install -y docker.io docker-compose

# Start and enable Docker
systemctl start docker
systemctl enable docker
```

### Step 2: Deploy Zumra
```bash
# Create directory for Zumra
mkdir -p /opt/zumra && cd /opt/zumra

# Extract the deployment package
unzip /path/to/zumra-chat-deployment.zip -d .

# Update configuration
# Replace "zumra.com" with your actual domain in nginx/conf.d/default.conf
sed -i 's/zumra.com/yourdomain.com/g' nginx/conf.d/default.conf

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/your_jwt_secret_key_here/$JWT_SECRET/g" .env.production

# Set up SSL certificates
mkdir -p nginx/ssl
```

### Step 3: SSL Certificate Setup
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to Nginx directory
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/zumra.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/zumra.key
```

### Step 4: Start the Application
```bash
# Start the application
docker-compose up -d

# Check if all services are running
docker-compose ps
```

### Step 5: Set Up Auto-Renewal for SSL Certificates
```bash
# Create renewal script
cat > /opt/zumra/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/zumra/nginx/ssl/zumra.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/zumra/nginx/ssl/zumra.key
docker-compose restart nginx
EOF

# Make script executable
chmod +x /opt/zumra/renew-ssl.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/zumra/renew-ssl.sh") | crontab -
```

## Shared Hosting Deployment

### Prerequisites
- Shared hosting account with PHP and Node.js support
- Domain name configured with your hosting provider

### Step 1: Upload Frontend Files
1. Extract the deployment package on your local machine
2. Build the frontend: `npm install && npm run build`
3. Upload the contents of the `dist` folder to your hosting's public directory (usually `public_html` or `www`)

### Step 2: Set Up Backend
For shared hosting with Node.js support:

1. Upload the `backend` folder to your hosting account
2. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=8080
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zumra
   JWT_SECRET=your_secure_random_string
   JWT_EXPIRE=30d
   ```
3. Configure your hosting provider to run `node backend/index.js`

For shared hosting without Node.js support:

1. Sign up for a Node.js hosting service like Heroku, Render, or Railway
2. Deploy the backend following their deployment instructions
3. Update the API URL in your frontend configuration to point to your backend service

### Step 3: Set Up MongoDB
1. Sign up for MongoDB Atlas (free tier)
2. Create a new cluster
3. Set up a database user and get your connection string
4. Update the `MONGO_URI` in your backend configuration

## Monitoring and Analytics

### Admin Dashboard
Access your admin dashboard at `https://yourdomain.com/admin` with the default credentials:
- Username: admin
- Password: admin

**Important**: Change the default password immediately after your first login.

### Google Analytics Integration
1. Create a Google Analytics account if you don't have one
2. Create a new property for your Zumra chat platform
3. Get your tracking ID (format: UA-XXXXXXXX-X or G-XXXXXXXXXX)
4. Add your tracking ID to the admin dashboard in the "Settings" section

### Custom Analytics
The platform includes a built-in analytics system that tracks:
- Room usage statistics
- User engagement metrics
- Peak concurrent users
- Message volume

Access these analytics from the admin dashboard under "Analytics".

## Ad Revenue Integration

### Google AdSense
1. Create a Google AdSense account
2. Get your AdSense publisher ID
3. Add your publisher ID to the admin dashboard in the "Monetization" section
4. Configure ad placements through the dashboard

### Custom Ad Integration
You can also integrate custom ad networks:
1. Go to "Monetization" > "Custom Ads" in the admin dashboard
2. Add your custom ad code
3. Select placement options

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check Docker logs
docker-compose logs

# Check specific service logs
docker-compose logs app
docker-compose logs nginx
docker-compose logs mongodb
```

#### Database Connection Issues
1. Verify your MongoDB connection string
2. Check if MongoDB is running: `docker-compose ps mongodb`
3. Check MongoDB logs: `docker-compose logs mongodb`

#### SSL Certificate Issues
1. Verify certificate files exist in `nginx/ssl/`
2. Check Nginx logs: `docker-compose logs nginx`
3. Try renewing certificates: `/opt/zumra/renew-ssl.sh`

#### Performance Issues
If you're experiencing performance issues with 1000 concurrent users:
1. Increase server resources (RAM, CPU)
2. Scale horizontally by deploying multiple instances behind a load balancer
3. Optimize MongoDB with proper indexes (already configured in the deployment)
4. Enable Redis caching for improved performance

For additional support, please refer to the documentation or contact our support team.
