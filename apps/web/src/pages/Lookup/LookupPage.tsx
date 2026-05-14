import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { FTData } from '../../types';
import './LookupPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface LookupResult {
  pseudo: string;
  status: string;
  tier: string;
  server: string;
  points: number;
  avatarUrl: string;
  stats: Record<string, string>;
  error?: boolean;
}

const LookupPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.get(`${API_URL}/lookup/${query}`);
      const data: FTData = response.data;
      
      if (data && data.pseudo) {
        setResult({
          pseudo: data.pseudo,
          status: 'ANALYSÉ // France Tiers connected',
          tier: `RANK #${data.global_rank || '?'}`,
          server: 'EU',
          points: data.total_points,
          avatarUrl: data.avatar_url,
          stats: {
            crystal: data.tiers?.Crystal?.tier || 'N/A',
            sword: data.tiers?.Sword?.tier || 'N/A',
            uhc: data.tiers?.UHC?.tier || 'N/A',
            pot: data.tiers?.Pot?.tier || 'N/A',
            nethpot: data.tiers?.NethPot?.tier || 'N/A',
            smp: data.tiers?.SMP?.tier || 'N/A',
            axe: data.tiers?.Axe?.tier || 'N/A',
            diasmp: data.tiers?.DiaSMP?.tier || 'N/A',
            mace: data.tiers?.Mace?.tier || 'N/A'
          }
        });
      } else {
        throw new Error('Joueur non trouvé');
      }
    } catch (error) {
      console.error('Search error:', error);
      setResult({
        pseudo: query,
        status: 'NON TROUVÉ // DATA_MISSING',
        tier: '?',
        server: '?',
        points: 0,
        avatarUrl: '',
        stats: {},
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="page-title">Lookup</h1>
      
      <div className="card search-card">
        <input 
          className="input" 
          placeholder="Pseudo Minecraft..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'RECHERCHE...' : 'RECHERCHER'}
        </button>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="card result-card"
        >
          <div className="skin-container">
            <img 
              src={`https://vzge.me/bust/256/${result.pseudo || query}`} 
              alt="Skin Preview"
              className="skin-preview"
            />
          </div>
          <div className="result-info">
            <h3 className="result-name">{(result.pseudo || query).toUpperCase()}</h3>
            <p className="result-status">Statut : {result.status || 'ANALYSÉ // MCTIERS_CONNECTED'}</p>
            <div className="result-badges">
              <span className="badge">TIER: {result.tier || 'HT3'}</span>
              <span className="badge">SERVER: {result.server || 'EU'}</span>
            </div>
            
            {result.stats && Object.keys(result.stats).length > 0 && (
              <div className="mini-stats">
                {Object.entries(result.stats).map(([key, val]) => (
                  <div key={key} className="mini-stat-item">
                    <span className="mini-stat-label">{key.toUpperCase()}</span>
                    <span className="mini-stat-value">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LookupPage;
