import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit3 } from 'lucide-react';
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

  useEffect(() => {
    fetchWiki();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la page "${title}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/wiki/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list
      fetchWiki();
    } catch (err) {
      console.error('Failed to delete wiki:', err);
      alert('Erreur lors de la suppression.');
    }
  };

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
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="btn btn-small flex items-center gap-2" 
                    onClick={() => navigate(`/wiki/editor/${res.id}`)}
                    style={{ flex: 1 }}
                  >
                    <Edit3 size={14} /> MODIFIER
                  </button>
                  <button 
                    className="btn btn-small flex items-center gap-2" 
                    onClick={() => handleDelete(res.id, res.title)}
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
