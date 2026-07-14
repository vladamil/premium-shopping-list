import { useState } from 'react';
import { useLists } from './context/ListContext';
import Dashboard from './components/Dashboard';
import ListForm from './components/ListForm';

function App() {
   // Core View State: 'dashboard', 'form', or 'shopping'
   const [currentView, setCurrentView] = useState('dashboard');

   const { activeListId, setActiveListId } = useLists();

   // Helper functions
   const navigateToDashboard = () => {
      setCurrentView('dashboard');
   };

   const navigateToCreateForm = () => {
      setActiveListId(null);
      setCurrentView('form');
   };

   const navigateToEditForm = (listId) => {
      setActiveListId(listId);
      setCurrentView('form');
   };

   const navigateToShopping = (listId) => {
      setActiveListId(listId);
      setCurrentView('shopping');
   };

   // Conditional Rendering State
   return (
      <>
         {currentView === 'dashboard' && (
            <Dashboard
               onCreateList={navigateToCreateForm}
               onSelectList={navigateToShopping}
            />
         )}

         {currentView === 'form' && <ListForm onBack={navigateToDashboard} />}

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
      </>
   );
}

export default App;
