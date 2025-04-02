import React from 'react';

function SimpleTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'blue', fontSize: '24px' }}>Simple Test Component</h1>
      <p>This is a minimal test component without any Tailwind dependencies.</p>
      <button 
        style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
}

export default SimpleTest;
