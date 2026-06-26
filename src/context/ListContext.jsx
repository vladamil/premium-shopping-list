import { createContext, useState, useContext } from 'react';

const ListContext = createContext();

// Create the Provider Component
export function ListProvider({ children }) {
   // Central state initialized with our mock data
   const [lists, setLists] = useState([
      {
         id: 'list-1',
         title: 'Lidl Weekly Shopping',
         createdAt: '2026-06-24',
         items: [
            {
               id: 'i1',
               name: 'Milk',
               price: 100.2,
               quantity: 2,
               isChecked: true,
            },
            {
               id: 'i2',
               name: 'Eggs',
               price: 237.5,
               quantity: 1,
               isChecked: false,
            },
            {
               id: 'i3',
               name: 'Bread',
               price: 1800.8,
               quantity: 1,
               isChecked: false,
            },
         ],
      },
      {
         id: 'list-2',
         title: 'Weekend BBQ Party',
         createdAt: '2026-5-25',
         items: [
            {
               id: 'i4',
               name: 'Charcoal',
               price: 255.0,
               quantity: 1,
               isChecked: false,
            },
            {
               id: 'i5',
               name: 'Burgers',
               price: 127.5,
               quantity: 2,
               isChecked: false,
            },
         ],
      },
   ]);

   const value = {
      lists,
      setLists,
   };

   return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

// Create a clean Custom Hook for consuming the context
export function useLists() {
   const context = useContext(ListContext);
   if (!context) {
      throw new Error('useLists must be used within a ListProvider');
   }
   return context;
}
