import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/layout/Layout';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import OnboardingPage from './pages/Login/OnboardingPage';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import StudentOverview from './pages/Dashboard/StudentOverview';
import OwnerOverview from './pages/Dashboard/OwnerOverview';
import ElevesPage from './pages/Dashboard/ElevesPage';
import CreateSessionPage from './pages/Dashboard/CreateSessionPage';
import LookupPage from './pages/Lookup/LookupPage';
import WikiPage from './pages/Wiki/WikiPage';
import WikiEditor from './pages/Wiki/WikiEditor';
import WikiView from './pages/Wiki/WikiView';
import DevTool from './components/DevTool';
import type { User, Role } from './types';
import './styles/globals.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    if (DEV_MODE) {
      const initialRole = (import.meta.env.VITE_DEV_ROLE as Role) || 'TRAINER';
      const devPseudo = import.meta.env.VITE_DEV_MINECRAFT_NAME || null;
      return { id: 'dev-id', username: 'DevUser', role: initialRole, minecraftName: devPseudo };
    }
    return null;
  });
  const [loading, setLoading] = useState(!DEV_MODE);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      localStorage.setItem('token', token);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (DEV_MODE) return;

    const token = localStorage.getItem('token');
    
    // Check if there is a token in the URL (coming back from login)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      void Promise.resolve().then(() => fetchProfile(urlToken));
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token) {
      void Promise.resolve().then(() => fetchProfile(token));
    } else {
      void Promise.resolve().then(() => setLoading(false));
    }
  }, []);

  const handleRoleChange = (role: Role) => {
    setUser((prev) => prev ? ({ ...prev, role }) : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return <div className="loading">INITIALIZING_SYSTEM...</div>;

  return (
    <Router>
      {DEV_MODE && user && (
        <DevTool currentRole={user.role} onRoleChange={handleRoleChange} />
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user && user.minecraftName ? <Navigate to="/dashboard" /> : <LoginPage />} />
        
        {/* Onboarding */}
        <Route path="/onboarding" element={
          user && !user.minecraftName ? 
          <OnboardingPage onComplete={(name) => setUser(prev => prev ? ({ ...prev, minecraftName: name }) : null)} /> : 
          <Navigate to="/dashboard" />
        } />

        {/* Dashboard Routes (Protected) */}
        <Route element={
          user ? (
            !user.minecraftName && !DEV_MODE ? 
            <Navigate to="/onboarding" /> : 
            <Layout role={user.role} onLogout={logout} />
          ) : <Navigate to="/login" />
        }>
          <Route path="/dashboard" element={
            user?.role === 'OWNER' ? <OwnerOverview user={user} /> :
            user?.role === 'STUDENT' ? <StudentOverview user={user} /> :
            user ? <DashboardOverview user={user} /> : <Navigate to="/login" />
          } />
          <Route path="/dashboard/roster" element={<ElevesPage userId={user?.id} />} />
          <Route path="/dashboard/create-session" element={<CreateSessionPage />} />
          <Route path="/lookup" element={<LookupPage />} />
          <Route path="/wiki" element={<WikiPage userRole={user?.role} />} />
          <Route path="/wiki/:id" element={<WikiView />} />
          <Route path="/wiki/editor" element={<WikiEditor />} />
          <Route path="/wiki/editor/:id" element={<WikiEditor />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
