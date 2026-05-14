import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { User, Application } from '../../types';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface AdminStats {
  totalUsers: number;
  totalTrainers: number;
  totalSessions: number;
  systemStatus: string;
  recentApplications: Application[];
}

const OwnerOverview: React.FC<{ user: User }> = ({ user }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <div>CHARGEMENT_ADMIN_PANEL...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="profile-header">
        <img 
          src={`https://mc-heads.net/body/${user?.minecraftName || 'Steve'}/right`} 
          className="skin-render" 
          alt="Owner" 
        />
        <div>
          <h1 className="welcome-text">Bonjour, {user?.minecraftName?.toUpperCase() || 'OWNER'}</h1>
          <p className="role-text">{user.role}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">UTILISATEURS TOTAUX</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FORMATEURS ACTIFS</div>
          <div className="stat-value accent">{stats?.totalTrainers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SESSIONS ENREGISTRÉES</div>
          <div className="stat-value">{stats?.totalSessions || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SYSTEM_STATUS</div>
          <div className="stat-value success" style={{ fontSize: '14px' }}>{stats?.systemStatus || 'OFFLINE'}</div>
        </div>
      </div>

      <div className="grid-2-cols">
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '25px' }}>CANDIDATURES RÉCENTES</h2>
          {stats?.recentApplications && stats.recentApplications.length > 0 ? (
            stats.recentApplications.map((app: Application) => (
              <div key={app.id} className="session-row">
                <div>
                  <div className="session-name">Candidature de @{app.discordId}</div>
                  <div className="session-meta">{new Date(app.createdAt).toLocaleDateString()} - Status: {app.status}</div>
                </div>
                <button className="btn btn-small">VOIR</button>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '20px' }}>AUCUNE CANDIDATURE EN ATTENTE</div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '25px' }}>ACTIONS RAPIDES</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button className="btn" style={{ width: '100%', fontSize: '10px' }}>GÉRER LES UTILISATEURS</button>
            <button className="btn btn-discord" style={{ width: '100%', fontSize: '10px' }}>MODIFIER LE WIKI</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OwnerOverview;
