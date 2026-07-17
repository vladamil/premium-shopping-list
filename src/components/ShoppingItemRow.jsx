import styles from './ShoppingView.module.css';

export default function ShoppingItemRow({ item, onToggle }) {
   // Check if quantity is greater than 1 to conditionally render it
   const hasMultiple = item.quantity > 1;

   return (
      <div
         className={`${styles.row} ${item.isBought ? styles.boughtRow : ''}`}
         onClick={() => onToggle(item.id)}
      >
         <div className={styles.checkboxWrapper}>
            <div
               className={`${styles.checkbox} ${item.isBought ? styles.checked : ''}`}
            >
               {item.isBought && (
                  <svg
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="3.5"
                  >
                     <polyline points="20 6 9 17 4 12" />
                  </svg>
               )}
            </div>
         </div>

         <div className={styles.itemInfo}>
            <span className={styles.itemName}>
               {item.name}
               {hasMultiple && (
                  <span className={styles.qtyBadge}>({item.quantity})</span>
               )}
            </span>
            <span className={styles.itemMeta}>
               {item.quantity} x {item.price.toFixed(2)}
            </span>
         </div>

         <div className={styles.itemTotal}>
            {(item.price * item.quantity).toFixed(2)}
         </div>
      </div>
   );
}
