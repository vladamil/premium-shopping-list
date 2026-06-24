import { useState } from 'react';

function App() {
   // 1. Core View State: 'dashboard', 'form', or 'shopping'
   const [currentView, setCurrentView] = useState('dashboard');

   // 2. Tracks which list is open (null means creating a new list)
   const [activeListId, setActiveListId] = useState(null);

   // Helper functions
   const navigateToDashboard = () => {
      setActiveListId(null);
      setCurrentView('dashboard');
   };

   const navigateToCreateForm = () => {
      setActiveListId(null); // No ID means "New List"
      setCurrentView('form');
   };

   const navigateToEditForm = (id) => {
      setActiveListId(id);
      setCurrentView('form');
   };

   const navigateToShopping = (id) => {
      setActiveListId(id);
      setCurrentView('shopping');
   };

   // 3. Conditional Rendering State
   return (
      <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
         {currentView === 'dashboard' && (
            <div
               style={{
                  background: 'var(--bg-surface)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-md)',
               }}
            >
               <h2>📋 Dashboard View</h2>
               <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
                  This will list all your shopping lists.
               </p>

               <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button
                     onClick={navigateToCreateForm}
                     style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                     }}
                  >
                     ➕ Create New List
                  </button>
                  <button
                     onClick={() => navigateToShopping('mock-id-123')}
                     style={{
                        background: 'var(--accent-success)',
                        color: '#fff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                     }}
                  >
                     🛒 Test Shopping Mode (Mock)
                  </button>
               </div>
            </div>
         )}

         {currentView === 'form' && (
            <div
               style={{
                  background: 'var(--bg-surface)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-md)',
               }}
            >
               <h2>✍️ List Form View</h2>
               <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
                  {activeListId
                     ? `Editing List ID: ${activeListId}`
                     : 'Creating a brand new list...'}
               </p>

               <button
                  onClick={navigateToDashboard}
                  style={{
                     color: 'var(--accent)',
                     textDecoration: 'underline',
                     cursor: 'pointer',
                     marginTop: '2rem',
                  }}
               >
                  ← Back to Dashboard
               </button>
            </div>
         )}

         {currentView === 'shopping' && (
            <div
               style={{
                  background: 'var(--bg-surface)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-md)',
               }}
            >
               <h2>🛒 Active Shopping Mode</h2>
               <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
                  Focus layout for List ID: {activeListId}
               </p>

               <button
                  onClick={navigateToDashboard}
                  style={{
                     color: 'var(--accent)',
                     textDecoration: 'underline',
                     cursor: 'pointer',
                     marginTop: '2rem',
                  }}
               >
                  ← Finish Shopping / Go Back
               </button>
            </div>
         )}
      </main>
   );
}

export default App;
