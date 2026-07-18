import { useLists } from '../context/ListContext';
import ListCard from './ListCard';
import styles from './Dashboard.module.css';

export default function Dashboard({ onCreateList, onSelectList, onArchive }) {
   const { lists } = useLists();

   // FILTER: Only show active lists
   const activeLists = lists.filter((list) => !list.isCompleted);
   const hasActiveLists = activeLists.length > 0;

   return (
      <div className={styles.container}>
         <header className={styles.header}>
            <div className={styles.headerTop}>
               <div className={styles.brandBadge}>
                  <svg
                     className={styles.logoIcon}
                     viewBox="0 0 24 24"
                     fill="none"
                     strokeWidth="2.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                     <path d="M3 6h18" />
                     <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span className={styles.brandName}>Shopping List App</span>
               </div>

               {/* Archive Button */}
               <button className={styles.archiveNavButton} onClick={onArchive}>
                  Archive →
               </button>
            </div>

            <p className={styles.tagline}>
               Intelligent, low-fatigue grocery planning designed for the aisle.
            </p>
         </header>

         {hasActiveLists ? (
            <div className={styles.listGrid}>
               {activeLists.map((list) => (
                  <ListCard
                     key={list.id}
                     list={list}
                     onSelectList={onSelectList}
                  />
               ))}
            </div>
         ) : (
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
            Create New List
         </button>
      </div>
   );
}
