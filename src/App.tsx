import { Route, Routes } from 'react-router';
import { TabLayout } from './components/TabLayout';
import { HistoryPage } from './pages/HistoryPage';
import { ListsPage } from './pages/ListsPage';
import { NewListPage } from './pages/NewListPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShoppingPage } from './pages/ShoppingPage';

// Which page to show for which URL.
function App() {
  return (
    <Routes>
      {/* Pages with the tab bar at the bottom */}
      <Route element={<TabLayout />}>
        <Route path="/" element={<ListsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Pages without the tab bar (they have their own bottom bars) */}
      <Route path="/new" element={<NewListPage />} />
      <Route path="/lists/:id" element={<ShoppingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
