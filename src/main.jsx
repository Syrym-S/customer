import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './shared/config/leaflet-icons.js';
import App from './App.jsx';
import './index.css';

function mount() {
   createRoot(document.getElementById('root')).render(
      <StrictMode>
         <App />
      </StrictMode>,
   );
}

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', mount);
} else {
   mount();
}
