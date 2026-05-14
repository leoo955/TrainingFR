import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  role?: 'OWNER' | 'TRAINER' | 'STUDENT';
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ role, onLogout }) => {
  return (
    <div className="app-layout">
      <Sidebar role={role} onLogout={onLogout} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
