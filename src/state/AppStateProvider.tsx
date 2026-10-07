import { useEffect, useReducer, useState, type ReactNode } from 'react';
import { loadAppData, saveAppData } from '../storage/storage';
import { AppStateContext } from './AppStateContext';
import { appReducer } from './reducer';

/** Wraps the whole app: loads the data once, keeps it in a reducer, saves every change. */
export function AppStateProvider({ children }: { children: ReactNode }) {
  // 1. Load once, when the app starts. (The function inside useState runs only the first time.)
  const [loaded] = useState(() => loadAppData());
  const initialState = loaded.data;

  // 2. Keep the data in the reducer. Screens change it with dispatch(action).
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 3. Save after every change.
  useEffect(() => {
    saveAppData(state);
  }, [state]);

  return (
    <AppStateContext.Provider
      value={{ state, dispatch, skippedLists: loaded.skippedLists }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
