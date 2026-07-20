import { useState, useEffect } from 'react';
import { useLists } from '../context/ListContext';
import Button from './ui/Button';
import NavButton from './ui/NavButton';
import styles from './ListForm.module.css';

export default function ListForm({ onBack, cloneTemplate }) {
   // Pull data directly from Lists context
   const { activeListId, saveList, lists } = useLists();
   const currentList = lists.find((list) => list.id === activeListId);

   const [newItemName, setNewItemName] = useState('');
   const [newItemPrice, setNewItemPrice] = useState('');

   const [error, setError] = useState('');

   // Initialize Title State
   const [title, setTitle] = useState(() => {
      if (activeListId && currentList) return currentList.title; //  Editing
      if (cloneTemplate) return cloneTemplate.title; //  Cloning template
      return ''; //  Fresh new list
   });

   // Initialize Items State
   const [items, setItems] = useState(() => {
      if (activeListId && currentList) return currentList.items; // Editing
      if (cloneTemplate) return cloneTemplate.items; // Cloning template
      return []; // Fresh new list
   });

   // Live dynamic math tracking total cost
   const currentRunningTotal = items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

   // APPEND A NEW ITEM TO THE LIST
   const handleAddItem = (e) => {
      if (e) e.preventDefault();
      setError(''); // Clear past errors

      const cleanName = newItemName.trim();

      // ❌ Guard: Empty check
      if (!cleanName) {
         setError('Item name cannot be empty.');
         return;
      }

      // ❌ Guard: Item character limit (keeps layouts clean)
      if (cleanName.length > 45 || cleanName.length < 2) {
         setError('Item name must be between 2 and 45 characters.');
         return;
      }

      const parsedPrice = parseFloat(newItemPrice) || 0.0;

      // ❌ Guard: Limit individual item price to a realistic maximum
      if (parsedPrice < 0 || parsedPrice > 100000) {
         setError('Please enter a realistic price (up to 100.000 per item).');
         return;
      }

      const committedItem = {
         id: crypto.randomUUID(),
         name: cleanName,
         quantity: 1, // Freshly created items default to 1 count
         price: parsedPrice,
         isBought: false,
      };

      setItems([committedItem, ...items]);

      // Reset input fields
      setNewItemName('');
      setNewItemPrice('');
   };

   // UPDATE A SPECIFIC VALUE INLINE (name, price or qty)
   const updateLedgerItem = (id, field, value) => {
      setError('');
      setItems(
         items.map((item) => {
            if (item.id === id) {
               return { ...item, [field]: value };
            }
            return item;
         }),
      );
   };

   // SUBMIT LIST
   const handleSubmitForm = (e) => {
      e.preventDefault();
      setError('');

      const cleanTitle = title.trim();
      // ❌ Guard: Prevent completely blank or space-only titles
      if (!cleanTitle) {
         setError('Please provide a title for this list.');
         return;
      }

      // ❌ Guard: Limit list title length for dashboard scannability
      if (cleanTitle.length > 30) {
         setError('List title is too long (maximum 30 characters).');
         return;
      }

      // ❌ Guard: Logic check—prevent saving an entirely empty dashboard ledger
      if (items.length === 0) {
         setError('Your shopping list needs at least one item before saving!');
         return;
      }

      // Check updated items validity before submit
      for (const item of items) {
         if (item.name.trim().length > 35 || item.name.trim().length < 2) {
            setError('Item name must be between 2 and 45 characters');
            return;
         }

         if (+item.price < 0 || +item.price > 100000) {
            setError('Please enter a valid price between 0 and 100.000.');
            return;
         }
      }

      // Send payload straight to context database layer
      saveList({ title: cleanTitle, items });

      // Smooth navigation callback to push user back to dashboard
      onBack();
   };

   return (
      <div className={styles.container}>
         {/* Header Container */}
         <header className={styles.header}>
            <NavButton onClick={onBack}>← Back</NavButton>
            <div className={styles.titleInputWrapper}>
               <input
                  type="text"
                  className={styles.titleInput}
                  placeholder="Name your list..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
               />
            </div>
         </header>
         {/* Display our custom error message if one exists */}
         {error && <div className={styles.error}>⚠️ {error}</div>}

         {/* ITEM CREATION CARD CONTAINER */}
         <div className={styles.creatorCard}>
            <input
               type="text"
               className={styles.creatorInputFull}
               placeholder="Item name (e.g., Čokolada 200g Milka)"
               value={newItemName}
               onChange={(e) => {
                  setNewItemName(e.target.value);
               }}
            />
            <div className={styles.creatorSubRow}>
               <input
                  type="number"
                  className={styles.inputField}
                  placeholder="Price"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
               />
               <button
                  className={styles.addButton}
                  type="button"
                  onClick={handleAddItem}
               >
                  Add
               </button>
            </div>
         </div>

         {/* RENDER LIST ITEMS ROWS */}
         <div className={styles.ledgerList}>
            {items.map((item) => (
               <div key={item.id} className={styles.ledgerRow}>
                  {/* Row 1: Full Width Item Name */}
                  <div className={styles.ledgerRowTop}>
                     <input
                        type="text"
                        maxLength="45"
                        className={styles.inlineNameInput}
                        value={item.name}
                        onChange={(e) =>
                           updateLedgerItem(item.id, 'name', e.target.value)
                        }
                     />
                  </div>

                  {/* Row 2: Secondary Controls Cluster */}
                  <div className={styles.ledgerRowBottom}>
                     <div className={styles.controlsLeft}>
                        {/* Stepper Shell */}
                        <div className={styles.stepper}>
                           <button
                              type="button"
                              className={styles.stepBtn}
                              onClick={() =>
                                 updateLedgerItem(
                                    item.id,
                                    'quantity',
                                    Math.max(1, item.quantity - 1),
                                 )
                              }
                           >
                              −
                           </button>
                           <span className={styles.stepCount}>
                              {item.quantity}
                           </span>
                           <button
                              type="button"
                              className={styles.stepBtn}
                              onClick={() =>
                                 updateLedgerItem(
                                    item.id,
                                    'quantity',
                                    item.quantity + 1,
                                 )
                              }
                           >
                              ＋
                           </button>
                        </div>

                        {/* Price Display Field */}
                        <input
                           type="number"
                           min="0"
                           max="100000"
                           step="0.5"
                           className={styles.inlinePriceInput}
                           value={item.price.toFixed(2)}
                           placeholder="0.00"
                           onChange={(e) =>
                              updateLedgerItem(
                                 item.id,
                                 'price',
                                 Number(e.target.value),
                              )
                           }
                        />
                     </div>

                     {/* Delete Button */}
                     <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() =>
                           setItems(items.filter((i) => i.id !== item.id))
                        }
                     >
                        <svg
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2.5"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        >
                           <line x1="18" y1="6" x2="6" y2="18"></line>
                           <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {/* BOTTOM SUMMARY FOOTER PANEL */}
         <div className={styles.footerArea}>
            <div className={styles.runningTotalRow}>
               <span className={styles.runningTotalLabel}>Current Total:</span>
               <span className={styles.runningTotalAmount}>
                  {currentRunningTotal}
               </span>
            </div>
            <Button type="button" onClick={handleSubmitForm}>
               Save Entire List
            </Button>
         </div>
      </div>
   );
}
