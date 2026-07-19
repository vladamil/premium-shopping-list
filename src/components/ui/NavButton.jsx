import styles from './NavButton.module.css';

export default function NavButton({
   children,
   type = 'button',
   className = '',
   onClick,
   ...props
}) {
   // Combine core styles and any external overrides cleanly
   const combinedClasses = `${styles.btn} ${className}`;

   return (
      <button
         type={type}
         onClick={onClick}
         className={combinedClasses}
         {...props}
      >
         {children}
      </button>
   );
}
