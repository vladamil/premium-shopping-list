import { useState } from 'react';
import { useLists } from './context/ListContext';
import Dashboard from './components/Dashboard';
import ListForm from './components/ListForm';
import ShoppingView from './components/ShoppingView';
import Archive from './components/Archive';

function App() {
   // Core View State: 'dashboard', 'form', 'shopping' or 'archive'
   const [currentView, setCurrentView] = useState('dashboard');
   // State to hold template items when cloning an archived list
   const [cloneTemplate, setCloneTemplate] = useState(null);

   const { activeListId, setActiveListId } = useLists();

   // Helper navigation functions

   const navigateToDashboard = () => {
      setActiveListId(null);
      setCloneTemplate(null);
      setCurrentView('dashboard');
   };

   const navigateToCreateForm = () => {
      setActiveListId(null);
      setCloneTemplate(null);
      setCurrentView('form');
   };

   const navigateToEditForm = (listId) => {
      setActiveListId(listId);
      setCloneTemplate(null);
      setCurrentView('form');
   };

   const navigateToShopping = (listId) => {
      setActiveListId(listId);
      setCloneTemplate(null);
      setCurrentView('shopping');
   };

   const navigateToArchive = () => {
      setActiveListId(null);
      setCloneTemplate(null);
      setCurrentView('archive');
   };

   const navigateToClone = (archivedList) => {
      // Transform historical list into a clean template draft
      setCloneTemplate({
         title: `${archivedList.title} (Copy)`,
         isCompleted: false, // <-- Restoring it back to an active list state!
         completedAt: null, // <-- Clearing out the old date timestamp!
         items: archivedList.items.map((item) => ({
            ...item,
            id: crypto.randomUUID(), // Prevent ID collision with original list items
            isBought: false, // Reset items back to unchecked status
         })),
      });

      setActiveListId(null);
      setCurrentView('form');
   };

   // Conditional Rendering State
   return (
      <>
         {currentView === 'dashboard' && (
            <Dashboard
               onCreateList={navigateToCreateForm}
               onSelectList={navigateToShopping}
               onArchive={navigateToArchive}
            />
         )}

         {currentView === 'form' && <ListForm onBack={navigateToDashboard} />}

         {currentView === 'shopping' && (
            <ShoppingView
               onBack={navigateToDashboard}
               onEdit={navigateToEditForm}
            />
         )}

         {currentView === 'archive' && (
            <Archive
               onBack={navigateToDashboard}
               onCloneClick={navigateToClone}
            />
         )}
      </>
   );
}

export default App;
