import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './shared/config/leaflet-icons.js';
import PublicApp from './PublicApp.jsx';
import './index.css';

function mount() {
   createRoot(document.getElementById('root')).render(
      <StrictMode>
         <PublicApp />
      </StrictMode>,
   );
}

// The WordPress template that embeds this bundle sometimes emits the
// `<div id="root">`/`<script>` pair before the inline `window.APP_DATA`
// assignment (order differs between environments). Waiting for
// DOMContentLoaded guarantees the whole document — including that inline
// script, wherever it sits — has already run before we read APP_DATA.
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', mount);
} else {
   mount();
}
