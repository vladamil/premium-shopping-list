import type { AppData } from '../domain/schemas';
import type { AppAction } from './actions';

/**
 * Takes the current data and one action, and returns the NEW data.
 * It never changes the old data — it always builds new arrays and objects.
 */
export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'createList':
      // New lists go on top.
      return { ...state, lists: [action.payload.list, ...state.lists] };

    case 'updateList': {
      const { listId, changes, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, ...changes, updatedAt: now } : list,
        ),
      };
    }

    case 'deleteList':
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== action.payload.listId),
      };
  }
}
