import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './shared/config/leaflet-icons.js';
import './shared/i18n';
import App from './App.jsx';
import './index.css';
import { hydrateSession } from './shared/model/session.store';

function mount() {
   createRoot(document.getElementById('root')).render(
      <StrictMode>
         <App />
      </StrictMode>,
   );
}

async function bootstrap() {
   await hydrateSession();

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);

      return;
   }

   mount();
}

void bootstrap();
