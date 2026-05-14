import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WikiPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface WikiResource {
  id: string;
  title: string;
  updatedAt: string;
}

const WikiPage: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<WikiResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        const response = await axios.get(`${API_URL}/wiki`);
        setResources(response.data);
      } catch (err) {
        console.error('Failed to fetch wiki:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWiki();
  }, []);

  const canEdit = userRole === 'OWNER' || userRole === 'TRAINER';

  if (loading) return <div>INITIALIZING_WIKI_PROTOCOL...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="wiki-header">
        <h1 className="page-title">WIKI_KNOWLEDGE_BASE</h1>
        {canEdit && (
          <button className="btn" onClick={() => navigate('/wiki/editor')}>+ NOUVELLE PAGE</button>
        )}
      </div>

      <div className="wiki-grid">
        {resources.length > 0 ? (
          resources.map(res => (
            <div key={res.id} className="card wiki-card" onClick={() => navigate(`/wiki/${res.id}`)}>
              <div className="wiki-card-title">{res.title.toUpperCase()}</div>
              <div className="wiki-card-meta">Dernière mise à jour : {new Date(res.updatedAt).toLocaleDateString()}</div>
              {canEdit && (
                <button 
                  className="btn btn-small mt-4" 
                  onClick={(e) => { e.stopPropagation(); navigate(`/wiki/editor/${res.id}`); }}
                >
                  MODIFIER
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5 }}>
            AUCUNE_DONNÉE_TROUVÉE_DANS_L_ARCHIVE
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WikiPage;
