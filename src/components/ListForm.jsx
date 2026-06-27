/* src/components/ListForm.jsx - Layout Foundations Only */
import styles from './ListForm.module.css';

export default function ListForm({ onBack }) {
   // Temporary hardcoded mockup list to inspect the 2-row layout look and feel
   const mockItems = [
      {
         id: '1',
         name: 'Čokolada 200g Milka noisette',
         quantity: 2,
         price: 240.0,
      },
      { id: '2', name: 'Plazma keks mlevena 300g', quantity: 1, price: 310.0 },
   ];

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
                  defaultValue=""
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
            />
            <div className={styles.creatorSubRow}>
               <input
                  type="number"
                  className={styles.inputField}
                  placeholder="Price"
                  step="0.01"
               />
               <button className={styles.addButton} type="button">
                  Add
               </button>
            </div>
         </div>

         {/* RENDERED ITEMS LIST ROWS */}
         <div className={styles.ledgerList}>
            {mockItems.map((item) => (
               <div key={item.id} className={styles.ledgerRow}>
                  {/* Row 1: Full Width Item Name */}
                  <div className={styles.ledgerRowTop}>
                     <input
                        type="text"
                        className={styles.inlineNameInput}
                        defaultValue={item.name}
                     />
                  </div>

                  {/* Row 2: Secondary Controls Cluster */}
                  <div className={styles.ledgerRowBottom}>
                     <div className={styles.controlsLeft}>
                        {/* Stepper Shell */}
                        <div className={styles.stepper}>
                           <button type="button" className={styles.stepBtn}>
                              −
                           </button>
                           <span className={styles.stepCount}>
                              {item.quantity}
                           </span>
                           <button type="button" className={styles.stepBtn}>
                              ＋
                           </button>
                        </div>

                        {/* Price Display Field */}
                        <div className={styles.priceWrapper}>
                           {(item.price * item.quantity).toFixed(2)}
                        </div>
                     </div>

                     {/* Red Delete Button */}
                     <button type="button" className={styles.deleteBtn}>
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
               <span className={styles.runningTotalAmount}>790.00</span>
            </div>
            <button className={styles.saveButton} type="button">
               Save Entire List
            </button>
         </div>
      </div>
   );
}
