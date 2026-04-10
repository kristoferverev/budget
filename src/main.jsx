import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: white; background: #991b1b; border-radius: 8px; margin: 20px;">
      <h2>Viga rakenduse käivitamisel</h2>
      <pre>${error.message}</pre>
    </div>
  `;
}
