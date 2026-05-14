import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { Session } from '../../types';
import './ElevesPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface StudentInList {
  id: string;
  username: string;
  minecraftName: string | null;
  progress: string;
  tiers: Record<string, string>;
}

const ElevesPage: React.FC<{ userId?: string }> = ({ userId }) => {
  const [students, setStudents] = useState<StudentInList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEleves = async () => {
      try {
        const id = userId || 'dev-id';
        const response = await axios.get(`${API_URL}/stats/${id}`);
        const sessions: Session[] = response.data;
        
        // Extraire les élèves uniques des sessions
        const uniqueStudentsMap = new Map<string, StudentInList>();
        sessions.forEach((session) => {
          if (session.student && !uniqueStudentsMap.has(session.studentId)) {
            uniqueStudentsMap.set(session.studentId, {
              id: session.studentId,
              username: session.student.username,
              minecraftName: session.student.minecraftName,
              progress: '+0%', // À calculer via une autre API plus tard
              tiers: { sword: 'N/A', axe: 'N/A', crystal: 'N/A', uhc: 'N/A', pot: 'N/A' }
            });
          }
        });
        
        setStudents(Array.from(uniqueStudentsMap.values()));
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, [userId]);

  if (loading) return <div>CHARGEMENT_ELEVES...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="page-title">ÉLÈVES</h1>
      <div className="card">
        <input className="input" placeholder="Rechercher un élève..." />
        <div className="students-list">
          {students.length > 0 ? (
            students.map(s => (
              <div key={s.id} className="student-item">
                <img src={`https://vzge.me/bust/128/${s.minecraftName || 'Steve'}`} className="student-avatar" alt={s.minecraftName || s.username} />
                <div className="student-info">
                  <div className="student-name">{(s.minecraftName || s.username).toUpperCase()}</div>
                  <div className="tier-mini-grid">
                    {Object.entries(s.tiers).map(([key, val]) => (
                      <div key={key} className="tier-mini-badge">
                        {key.toUpperCase()}: {val}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="student-progress-section">
                  <div className="progress-value">{s.progress}</div>
                  <div className="progress-label">Progression</div>
                  <button className="btn btn-small">DÉTAILS</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.3, textAlign: 'center', padding: '20px' }}>AUCUN ÉLÈVE TROUVÉ</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ElevesPage;
