import React from 'react';
import { ResponsiveProvider } from './utils/responsive';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CreateRoom from './components/CreateRoom';
import ChatRoom from './components/ChatRoom';
import RoomFull from './components/RoomStates/RoomFull';
import RoomExpired from './components/RoomStates/RoomExpired';
import EmptyRoom from './components/RoomStates/EmptyRoom';
import NotFound from './components/NotFound';
import './styles/main.scss';
import './styles/responsive.scss';

const App = () => {
  return (
    <ResponsiveProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/room/:roomId" element={<ChatRoom />} />
        <Route path="/room-full" element={<RoomFull />} />
        <Route path="/room-expired" element={<RoomExpired />} />
        <Route path="/empty-room" element={<EmptyRoom />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ResponsiveProvider>
  );
};

export default App;
