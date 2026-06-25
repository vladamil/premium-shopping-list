import { useLists } from '../context/ListContext';
import styles from './Dashboard.module.css';

export default function Dashboard({ onCreateList, onSelectList }) {
   const { lists } = useLists();
   // const lists = [];
   const hasLists = lists.length > 0;

   return (
      <div className={styles.container}>
         <header className={styles.header}>
            <h1>Lists</h1>
            <p>Your premium organized shopping hub.</p>
         </header>

         {hasLists ? (
            <div className={styles.listGrid}>
               {lists.map((list) => (
                  <div
                     key={list.id}
                     className={styles.card}
                     onClick={() => onSelectList(list.id)}
                  >
                     <div className={styles.cardInfo}>
                        <strong>{list.title}</strong>
                        <span className={styles.itemCount}>
                           {list.items.length} items
                        </span>
                     </div>
                     <button className={styles.shopButton}>Shop 🛒</button>
                  </div>
               ))}
            </div>
         ) : (
            /* Beautiful Inline Custom SVG Empty State */
            <div className={styles.emptyState}>
               <svg
                  className={styles.emptySvg}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
               </svg>
               <h3>No shopping lists yet</h3>
               <p>
                  Create your first premium list to simplify your next store
                  run.
               </p>
            </div>
         )}

         <button className={styles.createButton} onClick={onCreateList}>
            ➕ Create New List
         </button>
      </div>
   );
}
