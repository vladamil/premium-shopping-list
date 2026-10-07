import { createContext, useContext, type Dispatch } from 'react';
import type { AppData } from '../domain/schemas';
import type { AppAction } from './actions';

/** What every screen can get from useAppContext(). */
export type AppStateValue = {
  /** All the app's data (lists + settings). */
  state: AppData;
  /** Sends an action to the reducer, e.g. dispatch(toggleItem(listId, itemId)). */
  dispatch: Dispatch<AppAction>;
  /** How many saved lists couldn't be loaded at start (for a one-time message). */
  skippedLists: number;
};

export const AppStateContext = createContext<AppStateValue | null>(null);

/** Use this in any screen to read the data and send actions. */
export function useAppContext(): AppStateValue {
  const value = useContext(AppStateContext);
  if (value === null) {
    throw new Error('useAppContext must be used inside <AppStateProvider>');
  }
  return value;
}
