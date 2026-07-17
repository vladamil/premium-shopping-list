import { useLists } from '../context/ListContext';
import ShoppingItemRow from './ShoppingItemRow';
import styles from './ShoppingView.module.css';

export default function ShoppingView({ onBack, onEdit }) {
   const { activeListId, lists, saveList } = useLists();

   // Find the list we are currently shopping for
   const currentList = lists.find((list) => list.id === activeListId);

   // Create a shallow copy of items and sort them: unbought items (false) come before bought items (true)
   const sortedItems = [...currentList.items].sort(
      (a, b) => a.isBought - b.isBought,
   );

   // List Total Cost
   const totalCost = currentList.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
   );

   // In Cart Total (Only items marked as isBought)
   const cartCost = currentList.items
      .filter((item) => item.isBought)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

   // Toggle shopping item isBought
   const handleToggleBought = (itemId) => {
      const updatedItems = currentList.items.map((item) => {
         if (item.id === itemId) {
            return { ...item, isBought: !item.isBought };
         }
         return item;
      });

      // Pass false to saveList so it preserves activeListId in Context during shopping
      saveList(
         {
            title: currentList.title,
            items: updatedItems,
         },
         false,
      );
   };

   // Handle Completing & Archiving the Shopping Trip
   const handleFinishShopping = () => {
      // Make a window prompt
      const isConfirmed = window.confirm(
         'Are you sure you want to finish shopping? This will archive the list and remove it from your active dashboard.',
      );

      if (!isConfirmed) return;

      // Save the changes to LocalStorage via Context
      saveList({
         isCompleted: true,
         title: currentList.title,
         items: currentList.items,
      });

      // Go back to the dashboard
      onBack();
   };

   // Fallback screen if a list is missing or deleted
   if (!currentList) {
      return (
         <div className={styles.errorContainer}>
            <div className={styles.errorCard}>
               <svg
                  className={styles.errorIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
               </svg>
               <h3>Oops! List Not Found</h3>
               <p>This list may have been deleted or is no longer available.</p>
               <button onClick={onBack} className={styles.errorButton}>
                  ← Return to Dashboard
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.container}>
         <header className={styles.header}>
            <button
               type="button"
               className={styles.backButton}
               onClick={onBack}
            >
               ← Dashboard
            </button>
            <button
               type="button"
               className={styles.editButton}
               onClick={() => onEdit(activeListId)}
            >
               Edit List
            </button>
         </header>

         <div className={styles.titleArea}>
            <h1>{currentList.title}</h1>
            <p className={styles.subtitle}>( Tap items to check them off )</p>
         </div>

         {/* Checklist Grid with bottom margin to protect items from footer overlap */}
         <div className={styles.checklist}>
            {sortedItems.map((item) => (
               <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggleBought}
               />
            ))}
         </div>

         <footer className={styles.footer}>
            <div className={styles.statsGrid}>
               <div className={styles.statBox}>
                  <span className={styles.statLabel}>In Cart</span>
                  <span className={styles.statVal}>{cartCost.toFixed(2)}</span>
               </div>
               <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total Cost</span>
                  <span className={styles.statVal}>{totalCost.toFixed(2)}</span>
               </div>
            </div>

            <button
               className={styles.finishButton}
               onClick={handleFinishShopping}
            >
               Finish & Archive List
            </button>
         </footer>
      </div>
   );
}
