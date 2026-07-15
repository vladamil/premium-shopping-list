import { createContext, useContext, useState, useEffect } from 'react';

const ListContext = createContext(null);

export function ListProvider({ children }) {
   // Initialize state directly from LocalStorage on mount
   const [lists, setLists] = useState(() => {
      const saved = localStorage.getItem('grocery_lists');
      return saved ? JSON.parse(saved) : [];
   });

   const [activeListId, setActiveListId] = useState(null);

   // Sync state changes to LocalStorage automatically
   useEffect(() => {
      localStorage.setItem('grocery_lists', JSON.stringify(lists));
   }, [lists]);

   // Centralized Save Handler (Handles both Create and Edit operations)
   const saveList = (formData, shouldClearActiveId = true) => {
      setLists((prevLists) => {
         if (activeListId) {
            // SCENARIO A: Update existing list
            return prevLists.map((list) =>
               list.id === activeListId
                  ? { ...list, title: formData.title, items: formData.items }
                  : list,
            );
         } else {
            // SCENARIO B: Create a brand new list
            const newList = {
               id: crypto.randomUUID(),
               title: formData.title,
               items: formData.items,
               createdAt: new Date().toISOString(),
               isCompleted: false,
            };
            return [newList, ...prevLists];
         }
      });

      // Reset list id
      if (shouldClearActiveId) {
         setActiveListId(null);
      }
   };

   // Delete list handler
   const deleteList = (id) => {
      setLists((prevLists) => prevLists.filter((list) => list.id !== id));
      if (activeListId === id) setActiveListId(null);
   };

   return (
      <ListContext.Provider
         value={{
            lists,
            activeListId,
            setActiveListId,
            saveList,
            deleteList,
         }}
      >
         {children}
      </ListContext.Provider>
   );
}

export function useLists() {
   const context = useContext(ListContext);
   if (!context) {
      throw new Error(
         'useLists must be utilized within a ListProvider wrapper',
      );
   }
   return context;
}
