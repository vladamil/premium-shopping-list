import styles from './Button.module.css';

export default function Button({
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
