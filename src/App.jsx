import { useState } from 'react';
import { useLists } from './context/ListContext';
import Dashboard from './components/Dashboard';
import ListForm from './components/ListForm';
import ShoppingView from './components/ShoppingView';

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
            <ShoppingView
               onBack={navigateToDashboard}
               onEdit={navigateToEditForm}
            />
         )}
      </>
   );
}

export default App;
