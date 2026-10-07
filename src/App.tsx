import { createList } from './state/actions';
import { useAppContext } from './state/AppStateContext';

// Temporary page to prove the state works. It will be replaced by the real screens.
function App() {
  const { state, dispatch } = useAppContext();

  function addTestList() {
    dispatch(
      createList(
        'Test list',
        [{ name: 'Milk', quantity: 1, unitPrice: 15_900 }],
        null,
      ),
    );
  }

  return (
    <main>
      <h1>Cart-o-grapher</h1>
      <p>Version 2 is under construction.</p>
      <p>Saved lists: {state.lists.length}</p>
      <button type="button" onClick={addTestList}>
        Add a test list
      </button>
    </main>
  );
}

export default App;
