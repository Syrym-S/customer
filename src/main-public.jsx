import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './shared/config/leaflet-icons.js';
import PublicApp from './PublicApp.jsx';
import './index.css';

// Standalone entry for the public, unauthenticated shared-lead page only
// (see vite.config.public.js). Deliberately doesn't import App.jsx/router.jsx
// — pulling those in would drag the whole authenticated app (Dashboard,
// Leads, Tenders, Factorings, Forwarders, Profile, Notifications, ...) into
// a bundle meant for anonymous visitors following a share link.
createRoot(document.getElementById('root')).render(
   <StrictMode>
      <PublicApp />
   </StrictMode>,
);
