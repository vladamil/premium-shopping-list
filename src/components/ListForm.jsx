import { useState } from 'react';
import styles from './ListForm.module.css';

export default function ListForm({ onBack, onSave, activeListId }) {
   const [title, setTitle] = useState('');

   const [newItemName, setNewItemName] = useState('');
   const [newItemPrice, setNewItemPrice] = useState('');

   const [items, setItems] = useState([]);

   // Live dynamic math tracking total cost
   const currentRunningTotal = items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

   // Appends a new item into the list
   const handleAddItem = (e) => {
      if (e) e.preventDefault();
      if (!newItemName.trim()) return;

      const parsedPrice = parseFloat(newItemPrice) || 0.0;

      const committedItem = {
         id: crypto.randomUUID(),
         name: newItemName.trim(),
         quantity: 1, // Freshly created items default to 1 count
         price: parsedPrice,
      };

      setItems([...items, committedItem]);

      // Reset input fields
      setNewItemName('');
      setNewItemPrice('');
   };

   // Updates a specific value inline (name or qty)
   const updateLedgerItem = (id, field, value) => {
      setItems(
         items.map((item) => {
            if (item.id === id) {
               return { ...item, [field]: value };
            }
            return item;
         }),
      );
   };

   // Save list data (title + items list)
   const handleSubmitForm = (e) => {
      e.preventDefault();
      if (!title.trim()) return;

      onSave({
         title: title.trim(),
         items: items,
      });
   };

   return (
      <div className={styles.container}>
         {/* Header Container */}
         <header className={styles.header}>
            <button className={styles.backButton} onClick={onBack}>
               ← Back
            </button>
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
                        <div className={styles.priceWrapper}>
                           {(item.price * item.quantity).toFixed(2)}
                        </div>
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
            <button
               className={styles.saveButton}
               type="button"
               onClick={handleSubmitForm}
            >
               Save Entire List
            </button>
         </div>
      </div>
   );
}
