import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ListProvider } from './context/ListContext.jsx';
import './global.css';

createRoot(document.getElementById('root')).render(
   <StrictMode>
      <ListProvider>
         <App />
      </ListProvider>
   </StrictMode>,
);
// Register the Service Worker
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
      navigator.serviceWorker
         .register('/sw.js')
         .then((reg) =>
            console.log('Service Worker registered successfully!', reg.scope),
         )
         .catch((err) =>
            console.log('Service Worker registration failed:', err),
         );
   });
}
