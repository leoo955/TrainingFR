import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  role?: 'OWNER' | 'TRAINER' | 'STUDENT';
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role = 'TRAINER', onLogout }) => {
  return (
    <div className="sidebar">
      <div className="logo">
        <span style={{color: 'var(--blue)'}}>TRAIN</span>ING <span style={{color: 'var(--red)'}}>FR</span>
      </div>
      <nav>
        {role === 'OWNER' && (
          <>
            <div className="section-label">Administration</div>
            <ul>
              <li>
                <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
                  DASHBOARD
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/users" className={({ isActive }) => isActive ? 'active' : ''}>
                  UTILISATEURS
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/audit" className={({ isActive }) => isActive ? 'active' : ''}>
                  AUDIT
                </NavLink>
              </li>
            </ul>
          </>
        )}

        {(role === 'OWNER' || role === 'TRAINER') && (
          <>
            <div className="section-label">Coaching</div>
            <ul>
              {role === 'TRAINER' && (
                <li>
                  <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
                    DASHBOARD
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/dashboard/roster" className={({ isActive }) => isActive ? 'active' : ''}>
                  ÉLÈVES
                </NavLink>
              </li>
            </ul>
          </>
        )}

        {role === 'STUDENT' && (
          <ul>
            <li>
              <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
                DASHBOARD
              </NavLink>
            </li>
          </ul>
        )}

        <div className="section-label">Outils</div>
        <ul>
          <li>
            <NavLink to="/wiki" className={({ isActive }) => isActive ? 'active' : ''}>
              WIKI
            </NavLink>
          </li>
          <li>
            <NavLink to="/lookup" className={({ isActive }) => isActive ? 'active' : ''}>
              LOOKUP
            </NavLink>
          </li>
        </ul>

        <div className="section-label">Session</div>
        <ul>
          <li onClick={onLogout} className="logout-btn">
            DÉCONNEXION
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        TRAINING FR<br/>
        ROLE: {role}
      </div>
    </div>
  );
};

export default Sidebar;
