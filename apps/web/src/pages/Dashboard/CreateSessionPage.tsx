import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Student {
  id: string;
  username: string;
  minecraftName: string | null;
}

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [mode, setMode] = useState('');
  const [type] = useState('Train'); // Train or Queue
  const [sessionKind, setSessionKind] = useState<'SOLO' | 'GROUP'>('SOLO');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const modes = ['Crystal', 'Sword', 'UHC', 'Pot', 'NethPot', 'SMP', 'Axe', 'DiaSMP', 'Mace'];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(response.data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !mode) return;

    setSubmitting(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/sessions/create`, {
        studentIds: selectedStudentIds,
        mode,
        type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('SESSION_CRÉÉE_AVEC_SUCCÈS');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Failed to create session:', err);
      setMessage('ERREUR_LORS_DE_LA_CRÉATION');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudent = (id: string) => {
    if (sessionKind === 'SOLO') {
      setSelectedStudentIds([id]);
    } else {
      setSelectedStudentIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  if (loading) return <div>INITIALIZING_CREATION_MODULE...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="page-title">CRÉER UNE SESSION</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid-2-cols">
            <div>
              <label className="stat-label">TYPE DE SESSION</label>
              <div className="flex gap-4 mt-2">
                <button 
                  type="button"
                  className={`btn btn-small ${sessionKind === 'SOLO' ? 'active' : ''}`}
                  onClick={() => { setSessionKind('SOLO'); setSelectedStudentIds([]); }}
                  style={{ flex: 1, background: sessionKind === 'SOLO' ? 'var(--accent)' : '' }}
                >
                  SOLO
                </button>
                <button 
                  type="button"
                  className={`btn btn-small ${sessionKind === 'GROUP' ? 'active' : ''}`}
                  onClick={() => setSessionKind('GROUP')}
                  style={{ flex: 1, background: sessionKind === 'GROUP' ? 'var(--accent)' : '' }}
                >
                  GROUPE
                </button>
              </div>
            </div>

            <div>
              <label className="stat-label">MODE DE COMBAT</label>
              <div className="mode-selection-grid">
                {modes.map(m => (
                  <div 
                    key={m} 
                    className={`mode-card ${mode === m ? 'selected' : ''}`}
                    onClick={() => setMode(m)}
                  >
                    {m.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="stat-label">SÉLECTIONNER LES ÉLÈVES ({selectedStudentIds.length})</label>
            <div className="students-selection-grid mt-4" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '10px',
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '10px',
              border: '1px solid #222'
            }}>
              {students.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => toggleStudent(s.id)}
                  className={`student-select-card ${selectedStudentIds.includes(s.id) ? 'selected' : ''}`}
                  style={{
                    padding: '15px',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    background: selectedStudentIds.includes(s.id) ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                    borderColor: selectedStudentIds.includes(s.id) ? 'var(--accent)' : '#333'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{(s.minecraftName || s.username).toUpperCase()}</div>
                  <div style={{ fontSize: '10px', opacity: 0.5 }}>@{s.username}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <button 
              type="button" 
              className="btn btn-discord" 
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              ANNULER
            </button>
            <button 
              type="submit" 
              className="btn" 
              disabled={submitting || selectedStudentIds.length === 0 || !mode}
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {submitting ? 'CRÉATION...' : 'VALIDER LA SESSION'}
            </button>
          </div>

          {message && (
            <div style={{ 
              textAlign: 'center', 
              fontSize: '12px', 
              color: message.includes('SUCCÈS') ? '#22c55e' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default CreateSessionPage;

