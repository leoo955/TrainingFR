import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import type { WikiResource, Block } from '../../types';
import './WikiPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const WikiView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<WikiResource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/wiki/${id}`);
        setResource(response.data);
      } catch (err) {
        console.error('Failed to fetch resource:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) return <div>EXTRACTING_DATA_FROM_VAULT...</div>;
  if (!resource) return <div>RESOURCE_NOT_FOUND</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button className="btn btn-small mb-8" onClick={() => navigate('/wiki')}>
        <ArrowLeft size={14} style={{ marginRight: '8px' }} /> RETOUR
      </button>

      <h1 className="page-title text-5xl mb-12">{resource.title.toUpperCase()}</h1>

      <div className="wiki-content space-y-10 pb-20">
        {resource.content?.map((block: Block) => (
          <div key={block.id}>
            {block.type === 'text' && (
              <p className="text-lg leading-relaxed opacity-80 whitespace-pre-wrap">{block.content}</p>
            )}

            {block.type === 'code' && (
              <div className="card" style={{ backgroundColor: '#000', fontFamily: 'monospace', overflowX: 'auto' }}>
                <pre className="text-brand"><code>{block.content}</code></pre>
              </div>
            )}

            {block.type === 'alert' && (
              <div className="card" style={{ borderLeft: '10px solid var(--red)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                <div className="stat-label text-error mb-2">CRITICAL_NOTICE</div>
                <div className="font-bold">{block.content}</div>
              </div>
            )}

            {block.type === 'video' && (
              <div className="card p-0 overflow-hidden brutalist-border">
                <iframe 
                  width="100%" 
                  height="450" 
                  src={`https://www.youtube.com/embed/${block.content}`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WikiView;
