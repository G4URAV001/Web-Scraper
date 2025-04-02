import React from 'react';
import { createRoot } from 'react-dom/client';

function MinimalApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Minimal React App</h1>
      <p>This is a minimal React application without any dependencies.</p>
      <button onClick={() => alert('It works!')}>Click Me</button>
    </div>
  );
}

// Create root element if it doesn't exist
let rootElement = document.getElementById('root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

createRoot(rootElement).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>
);
