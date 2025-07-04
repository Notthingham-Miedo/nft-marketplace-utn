import { useState, useEffect } from 'react';

function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    setEnvVars({
      PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY || 'No configurado',
      PINATA_SECRET_KEY: import.meta.env.VITE_PINATA_SECRET_KEY ? 'Configurado' : 'No configurado',
      PINATA_JWT: import.meta.env.VITE_PINATA_JWT || 'No configurado',
      NODE_ENV: import.meta.env.MODE,
    });
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        🐛
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        zIndex: 1000,
        maxWidth: '300px',
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4>🐛 Debug Panel</h4>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div>
        <h5>Variables de entorno:</h5>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '5px' }}>
            <strong>{key}:</strong> 
            <span style={{ 
              color: value.includes('No configurado') ? 'red' : 'green',
              marginLeft: '5px' 
            }}>
              {key.includes('SECRET') || key.includes('JWT') ? 
                (value === 'No configurado' ? value : '***hidden***') : 
                value
              }
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <small>
          💡 Si las credenciales no están configuradas, se usarán placeholders para testing.
        </small>
      </div>
    </div>
  );
}

export default DebugPanel;
