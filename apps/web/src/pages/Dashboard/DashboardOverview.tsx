import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { User, FTData, Session } from '../../types';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface DashboardStats {
  students: number;
  successRate: number;
}

const DashboardOverview: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ftData, setFtData] = useState<FTData | null>(user.ftData || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = user?.id || 'dev-id'; 
        const statsResponse = await axios.get(`${API_URL}/stats/${id}`);
        const sessionsData: Session[] = statsResponse.data;
        setSessions(sessionsData);

        // Calcul simple des stats pour l'exemple
        setStats({
          students: new Set(sessionsData.map((s) => s.studentId)).size,
          successRate: 94 // À calculer dynamiquement plus tard
        });

        // Fetch FT Data if not already in user object
        if (user?.minecraftName && !user.ftData) {
          const ftResponse = await axios.get(`${API_URL}/lookup/${user.minecraftName}`);
          if (ftResponse.data && ftResponse.data.pseudo) {
            setFtData(ftResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.minecraftName, user.ftData]);

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('VOULEZ-VOUS VRAIMENT SUPPRIMER CETTE SESSION ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('ERREUR_LORS_DE_LA_SUPPRESSION');
    }
  };

  if (loading) return <div>CHARGEMENT_DES_DONNÉES...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="profile-header">
        <img 
          src={`https://vzge.me/bust/256/${user?.minecraftName || 'Steve'}`} 
          className="skin-render" 
          alt="Trainer" 
        />
        <div>
          <h1 className="welcome-text">Bonjour, {user?.minecraftName?.toUpperCase() || 'COACH'}</h1>
          <p className="role-text">{user.role}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Élèves Actifs</div>
          <div className="stat-value">{stats?.students || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sessions Totales</div>
          <div className="stat-value accent">{sessions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rang FranceTiers</div>
          <div className="stat-value">#{ftData?.global_rank || '---'}</div>
        </div>
      </div>

      <div className="grid-2-cols">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">DEMANDES D'ENTRAÎNEMENT</h2>
          </div>
          {sessions.filter(s => s?.status === 'PENDING').length > 0 ? (
            sessions.filter(s => s?.status === 'PENDING').map(session => (
              <div key={session.id} className="session-row">
                <div>
                  <div className="session-name" style={{ color: 'var(--accent)' }}>{session.mode?.toUpperCase()} REQUEST</div>
                  <div className="session-meta">
                    Par @{session.student?.username || 'Inconnu'}
                  </div>
                </div>
                <button className="btn btn-small">ACCEPTER</button>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '20px' }}>AUCUNE DEMANDE EN ATTENTE</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">HISTORIQUE RÉCENT</h2>
            <button className="btn btn-small" onClick={() => navigate('/dashboard/create-session')}>+ CRÉER UNE SESSION</button>
          </div>
          {sessions.filter(s => s && s.status !== 'PENDING').length > 0 ? (
            sessions.filter(s => s && s.status !== 'PENDING').map(session => (
              <div key={session.id} className="session-item-container" style={{ marginBottom: '15px' }}>
                <div className="session-row" style={{ borderBottom: session?.details ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <div className="session-name">{session?.type} - {session?.mode}</div>
                    <div className="session-meta">
                      {session?.date ? new Date(session.date).toLocaleDateString() : 'Date inconnue'} - Avec @{session?.student?.username || 'Inconnu'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-small" 
                      onClick={() => handleDeleteSession(session.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    >
                      SUPPRIMER
                    </button>
                  </div>
                </div>
                {session?.details && (
                  <div style={{ 
                    padding: '10px 15px', 
                    fontSize: '12px', 
                    opacity: 0.7, 
                    background: 'rgba(255,255,255,0.02)',
                    borderBottomLeftRadius: '4px',
                    borderBottomRightRadius: '4px',
                    fontStyle: 'italic'
                  }}>
                    {session.details}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '20px' }}>AUCUNE SESSION ENREGISTRÉE</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2 className="card-title">MES PALIERS ACTUELS</h2>
        <div className="tier-grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {ftData ? Object.entries(ftData.tiers)
            .filter(([, val]) => val.tier !== 'N/A')
            .map(([key, val]) => (
            <div key={key} className="session-row" style={{ borderBottom: 'none', background: 'rgba(255,255,255,0.02)', padding: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>{key.toUpperCase()}</span>
              <span className="tier-tag">{val.tier}</span>
            </div>
          )) : (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>DONNÉES NON DISPONIBLES</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2 className="card-title" style={{ marginBottom: '20px' }}>ACTIONS RAPIDES</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn" onClick={() => navigate('/wiki/editor')} style={{ flex: 1, fontSize: '12px' }}>CRÉER UNE PAGE WIKI</button>
          <button className="btn btn-discord" onClick={() => navigate('/dashboard/roster')} style={{ flex: 1, fontSize: '12px' }}>GÉRER LE ROSTER</button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
