import { useState } from 'react';
import { useLists } from '../context/ListContext';
import NavButton from './ui/NavButton';
import styles from './Archive.module.css';

export default function Archive({ onBack, onCloneClick }) {
   const { lists, deleteList } = useLists();

   // Track which list IDs are expanded in our accordion format
   const [expandedListIds, setExpandedListIds] = useState([]);

   // Filter out ONLY completed lists and order them newest-completed on top
   const archivedLists = lists
      .filter((list) => list.isCompleted)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

   const toggleExpand = (listId) => {
      setExpandedListIds((prev) =>
         prev.includes(listId)
            ? prev.filter((id) => id !== listId)
            : [...prev, listId],
      );
   };

   const formatDate = (isoString) => {
      if (!isoString) return 'Past Trip';
      const date = new Date(isoString);
      // Formats cleanly like: "Jul 17, 2026"
      return date.toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric',
      });
   };

   return (
      <div className={styles.container}>
         <header className={styles.header}>
            <NavButton onClick={onBack} className={styles.backButton}>
               ← Dashboard
            </NavButton>
            <h1 className={styles.title}>Shopping History</h1>
         </header>

         {archivedLists.length === 0 ? (
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
                  <polyline points="21 8 21 21 3 21 3 8" />

                  <rect x="1" y="3" width="22" height="5" />

                  <line x1="10" y1="12" x2="14" y2="12" />
               </svg>
               <h3>Your Archive is Empty</h3>
               <p>
                  Completed lists will automatically move here once you finish
                  shopping.
               </p>
            </div>
         ) : (
            <div className={styles.archiveList}>
               {archivedLists.map((list) => {
                  const isExpanded = expandedListIds.includes(list.id);
                  const listTotal = list.items.reduce(
                     (sum, item) => sum + item.price * item.quantity,
                     0,
                  );

                  return (
                     <div key={list.id} className={styles.card}>
                        {/* Main clickable info area */}
                        <div
                           className={styles.cardMain}
                           onClick={() => toggleExpand(list.id)}
                        >
                           <div className={styles.cardHeader}>
                              <span className={styles.dateBadge}>
                                 {formatDate(list.completedAt)}
                              </span>
                              <span className={styles.chevron}>
                                 {isExpanded ? '▲' : '▼'}
                              </span>
                           </div>
                           <h2 className={styles.listTitle}>{list.title}</h2>
                           <div className={styles.cardSummary}>
                              <span>{list.items.length} items bought</span>
                              <span className={styles.totalPrice}>
                                 {listTotal.toFixed(2)}
                              </span>
                           </div>
                        </div>

                        {/* Inline Accordion Expanded Items (Read-Only) */}
                        {isExpanded && (
                           <div className={styles.accordionContent}>
                              <div className={styles.itemsHeader}>
                                 Items Purchased:
                              </div>
                              <ul className={styles.itemsList}>
                                 {list.items.map((item) => (
                                    <li
                                       key={item.id}
                                       className={styles.itemRow}
                                    >
                                       <span className={styles.itemName}>
                                          ✓ {item.name}{' '}
                                          {item.quantity > 1 &&
                                             `(${item.quantity})`}
                                       </span>
                                       <span className={styles.itemCost}>
                                          {(item.price * item.quantity).toFixed(
                                             2,
                                          )}
                                       </span>
                                    </li>
                                 ))}
                              </ul>

                              {/* Action Bar inside expanded zone */}
                              <div className={styles.actionsBar}>
                                 <button
                                    className={styles.deleteBtn}
                                    onClick={() => {
                                       if (
                                          window.confirm(
                                             'Delete this history permanently?',
                                          )
                                       ) {
                                          deleteList(list.id);
                                       }
                                    }}
                                 >
                                    Delete
                                 </button>
                                 <button
                                    className={styles.cloneBtn}
                                    onClick={() => onCloneClick(list)}
                                 >
                                    Use as Template
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
