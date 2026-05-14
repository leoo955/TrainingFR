import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="logo"
      >
        <span style={{color: 'var(--blue)'}}>TRAIN</span>ING <span style={{color: 'var(--red)'}}>FR</span>
      </motion.div>

      <main className="hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1>DEVIENS PLUS.<br/><span style={{color: 'var(--accent)'}}>FORT.</span></h1>
          <p>
            Training FR est un serveur dédié à l'entraînement PvP de Minecraft. 
          </p>
          
          <div className="actions">
            <button className="btn" onClick={() => navigate('/login')}>SE CONNECTER</button>
            <a href="https://dc.gg/pvptraining" className="btn btn-discord">REJOINDRE LE DISCORD</a>
          </div>
        </motion.div>
      </main>

      <footer>
        © 2026 TRAINING FR 
      </footer>
    </div>
  );
};

export default LandingPage;
