import React from 'react';

interface DevToolProps {
  currentRole: string;
  onRoleChange: (role: 'OWNER' | 'TRAINER' | 'STUDENT') => void;
}

const DevTool: React.FC<DevToolProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#111',
      border: '1px solid var(--accent)',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 9999,
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
      fontSize: '10px',
      fontFamily: 'monospace'
    }}>
      <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
        DEV_SYSTEM // ROLE_SWITCH
      </div>
      {(['OWNER', 'TRAINER', 'STUDENT'] as const).map(role => (
        <button
          key={role}
          onClick={() => onRoleChange(role)}
          style={{
            background: currentRole === role ? 'var(--accent)' : 'transparent',
            color: currentRole === role ? '#000' : '#fff',
            border: '1px solid ' + (currentRole === role ? 'var(--accent)' : '#333'),
            padding: '5px 10px',
            cursor: 'pointer',
            textAlign: 'left',
            fontWeight: 'bold',
            transition: '0.2s'
          }}
        >
          {role} {currentRole === role ? '●' : ''}
        </button>
      ))}
      <div style={{ fontSize: '8px', opacity: 0.4, marginTop: '5px' }}>
        DEV_MODE: ACTIVE
      </div>
    </div>
  );
};

export default DevTool;
