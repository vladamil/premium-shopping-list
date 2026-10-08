import { Link } from 'react-router';
import { useAppContext } from '../state/AppStateContext';

// Temporary shell. The real Lists screen comes in chunk 7.
export function ListsPage() {
  const { state } = useAppContext();

  return (
    <main>
      <h1>Shopping lists</h1>
      <p>Saved lists: {state.lists.length}</p>
      <Link to="/new">New list</Link>
    </main>
  );
}
