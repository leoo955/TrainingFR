import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, MoveUp, MoveDown, Save, ArrowLeft } from 'lucide-react';
import './WikiPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type BlockType = 'text' | 'code' | 'alert' | 'video';

interface Block {
  id: string;
  type: BlockType;
  content: string;
}

const WikiEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchResource = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/wiki/${id}`);
          setTitle(response.data.title);
          setBlocks(response.data.content || []);
        } catch (err) {
          console.error('Failed to fetch resource:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchResource();
    }
  }, [id]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, content: string) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, content } : b));
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/wiki/save`, {
        id,
        title,
        content: blocks,
        published: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('PAGE_ENREGISTRÉE_AVEC_SUCCÈS');
      setTimeout(() => navigate('/wiki'), 1500);
    } catch (err) {
      console.error('Save error:', err);
      setMessage('ERREUR_LORS_DE_L_ENREGISTREMENT');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>ACCESSING_CORE_DATABASE...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="wiki-header">
        <button className="btn btn-small" onClick={() => navigate('/wiki')}>
          <ArrowLeft size={14} style={{ marginRight: '8px' }} /> RETOUR
        </button>
        <h1 className="page-title">{id ? 'EDIT_RESOURCE' : 'CREATE_RESOURCE'}</h1>
        <button className="btn" onClick={handleSave} disabled={saving || !title}>
          <Save size={14} style={{ marginRight: '8px' }} /> {saving ? 'SAVING...' : 'ENREGISTRER'}
        </button>
      </div>

      <div className="card">
        <label className="stat-label">TITRE DE LA PAGE</label>
        <input 
          className="input mt-2" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Entrez le titre..."
        />
      </div>

      <div className="editor-blocks mt-8 space-y-6">
        {blocks.map((block, index) => (
          <div key={block.id} className="block-container card">
            <div className="block-controls flex justify-between mb-4 opacity-50 hover:opacity-100">
              <span className="text-[10px] font-bold">BLOC_{block.type.toUpperCase()}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0}><MoveUp size={14}/></button>
                <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}><MoveDown size={14}/></button>
                <button type="button" onClick={() => removeBlock(block.id)} style={{ color: 'var(--red)' }}><Trash2 size={14}/></button>
              </div>
            </div>

            {block.type === 'text' && (
              <textarea 
                className="input" 
                rows={4} 
                value={block.content} 
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Écrivez votre texte ici..."
              />
            )}

            {block.type === 'code' && (
              <textarea 
                className="input" 
                style={{ fontFamily: 'monospace', backgroundColor: '#000' }}
                rows={4} 
                value={block.content} 
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Collez votre code ici..."
              />
            )}

            {block.type === 'alert' && (
              <input 
                className="input" 
                style={{ borderColor: 'var(--red)' }}
                value={block.content} 
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Message d'alerte..."
              />
            )}

            {block.type === 'video' && (
              <input 
                className="input" 
                value={block.content} 
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="ID de la vidéo YouTube..."
              />
            )}
          </div>
        ))}
      </div>

      <div className="add-block-section mt-12 mb-20 p-8 border-3 border-dashed border-zinc-800 text-center">
        <div className="stat-label mb-6">AJOUTER UN MODULE DE CONTENU</div>
        <div className="flex justify-center gap-4">
          <button className="btn btn-small" onClick={() => addBlock('text')}><Plus size={14}/> TEXTE</button>
          <button className="btn btn-small" onClick={() => addBlock('code')}><Plus size={14}/> CODE</button>
          <button className="btn btn-small" onClick={() => addBlock('alert')}><Plus size={14}/> ALERTE</button>
          <button className="btn btn-small" onClick={() => addBlock('video')}><Plus size={14}/> VIDÉO</button>
        </div>
      </div>

      {message && (
        <div className="fixed bottom-10 right-10 card" style={{ 
          borderColor: message.includes('SUCCÈS') ? '#22c55e' : '#ef4444',
          zIndex: 100
        }}>
          {message}
        </div>
      )}
    </motion.div>
  );
};

export default WikiEditor;
