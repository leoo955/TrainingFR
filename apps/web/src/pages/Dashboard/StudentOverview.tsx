import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { User, FTData } from '../../types';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const StudentOverview: React.FC<{ user: User }> = ({ user }) => {
  const [ftData, setFtData] = useState<FTData | null>(user.ftData || null);
  const [requestMode, setRequestMode] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFTStats = async () => {
      if (!user?.minecraftName || user.ftData) return;
      try {
        const response = await axios.get(`${API_URL}/api/lookup/${user.minecraftName}`);
        const data = response.data;
        if (data && data.pseudo) {
          setFtData(data);
        }
      } catch (err) {
        console.error('Failed to fetch FranceTiers stats:', err);
      }
    };
    fetchFTStats();
  }, [user?.minecraftName, user.ftData]);

  const handleRequestTraining = async () => {
    if (!requestMode) return;
    setRequesting(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/sessions/request`, {
        mode: requestMode,
        type: 'Train'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('DEMANDE_ENVOYÉE_AVEC_SUCCÈS');
      setRequestMode('');
    } catch (err) {
      console.error('Failed to request training:', err);
      setMessage('ERREUR_LORS_DE_LA_DEMANDE');
    } finally {
      setRequesting(false);
    }
  };

  const modes = ['Crystal', 'Sword', 'UHC', 'Pot', 'NethPot', 'SMP', 'Axe', 'DiaSMP', 'Mace'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="profile-header">
        <img 
          src={ftData?.avatar_url || `https://render.crafty.gg/3d/bust/${user?.minecraftName || 'Steve'}`} 
          className="skin-render" 
          alt="Skin" 
        />
        <div>
          <h1 className="welcome-text">Bonjour, {user?.minecraftName?.toUpperCase() || 'PLAYER'}</h1>
          <p className="role-text">{user.role}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Points Totaux</div>
          <div className="stat-value">{ftData?.total_points || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rang Global</div>
          <div className="stat-value">#{ftData?.global_rank || '0'}</div>
        </div>
      </div>

      <div className="grid-2-cols">
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '25px' }}>DEMANDER UN ENTRAÎNEMENT</h2>
          <p style={{ opacity: 0.5, fontSize: '12px', marginBottom: '20px' }}>
            SÉLECTIONNEZ UN MODE POUR ENVOYER UNE DEMANDE AUX COACHS.
          </p>
          
          <select 
            style={{ display: 'none' }} // Hidden input for accessibility/form context if needed, but we use the grid
            value={requestMode}
            disabled
          />
          <div className="mode-selection-grid" style={{ marginBottom: '20px' }}>
            {modes.map(m => (
              <div 
                key={m} 
                className={`mode-card ${requestMode === m ? 'selected' : ''}`}
                onClick={() => setRequestMode(m)}
              >
                {m.toUpperCase()}
              </div>
            ))}
          </div>

          <button 
            className="btn" 
            onClick={handleRequestTraining} 
            disabled={!requestMode || requesting}
            style={{ width: '100%' }}
          >
            {requesting ? 'ENVOI...' : 'DEMANDER_TRAINING'}
          </button>

          {message && (
            <div style={{ 
              marginTop: '15px', 
              fontSize: '11px', 
              color: message.includes('SUCCÈS') ? '#22c55e' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '25px' }}>MES PALIERS ACTUELS</h2>
          <div className="tier-grid-dashboard">
            {ftData ? Object.entries(ftData.tiers)
              .filter(([, val]) => val.tier !== 'N/A')
              .map(([key, val]) => (
              <div key={key} className="session-row">
                <span>{key}</span>
                <span className="tier-tag">{val.tier}</span>
              </div>
            )) : (
              <div style={{ opacity: 0.3, textAlign: 'center' }}>CHARGEMENT DES PALIERS...</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentOverview;
