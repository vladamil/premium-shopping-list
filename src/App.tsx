import { Route, Routes } from 'react-router';
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
      <Route path="/" element={<ListsPage />} />
      <Route path="/new" element={<NewListPage />} />
      <Route path="/lists/:id" element={<ShoppingPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
