import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // On réutilise le style brutalisme

const API_URL = import.meta.env.VITE_API_URL || '';

const OnboardingPage: React.FC<{ onComplete: (name: string) => void }> = ({ onComplete }) => {
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/profile/setup`, { minecraftName: pseudo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onComplete(pseudo);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : 'Erreur lors de la configuration';
      setError(errorMsg || 'Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="logo"
      >
        <span style={{color: 'var(--blue)'}}>TRAIN</span>ING <span style={{color: 'var(--red)'}}>FR</span>
      </motion.div>

      <main>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>PRESQUE<br/><span style={{color: 'var(--accent)'}}>PRÊT.</span></h1>
          <p>
            Entre ton pseudo Minecraft pour lier tes stats FranceTiers à ton compte.
          </p>
          
          <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input 
              className="input" 
              placeholder="Pseudo Minecraft..." 
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
              autoFocus
            />
            {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '15px' }}>{error}</p>}
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'SYNCHRONISATION...' : 'FINALISER'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default OnboardingPage;
