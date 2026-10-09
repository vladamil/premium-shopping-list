import { Outlet } from 'react-router';
import { TabBar } from './TabBar';
import styles from './TabLayout.module.css';

// The frame for pages that have the tab bar.
// <Outlet /> is where React Router draws the current page (Lists, History or Settings).
export function TabLayout() {
  return (
    <>
      <div className={styles.content}>
        <Outlet />
      </div>
      <TabBar />
    </>
  );
}
