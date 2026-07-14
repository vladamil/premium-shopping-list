import styles from './ListCard.module.css';

export default function ListCard({ list, onSelectList }) {
   const calculateTotal = (items) => {
      return items
         .reduce((sum, item) => sum + item.price * item.quantity, 0)
         .toFixed(2);
   };

   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
      });
   };

   return (
      <div className={styles.card} onClick={() => onSelectList(list.id)}>
         <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{list.title}</h3>
            <div className={styles.cardMetaRow}>
               <span>{formatDate(list.createdAt)}</span>
               <span className={styles.metaDivider}>•</span>
               <span>{list.items.length} items</span>
            </div>
            <div className={styles.priceRow}>
               Total: {calculateTotal(list.items)}
            </div>
         </div>

         <div className={styles.chevronAction}>
            <svg
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            >
               <polyline points="9 18 15 12 9 6" />
            </svg>
         </div>
      </div>
   );
}
