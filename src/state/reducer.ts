import type { AppData } from '../domain/schemas';
import type { AppAction } from './actions';

/**
 * Takes the current data and one action, and returns the NEW data.
 * It never changes the old data — it always builds new arrays and objects.
 *
 * Most cases follow the same recipe:
 * go through all lists → the one with the matching id gets a new version → all others stay the same.
 */
export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    // ----- Lists -----

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

    // ----- Items -----

    case 'addItem': {
      const { listId, item, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: [item, ...list.items], // new items go on top
                updatedAt: now,
              }
            : list,
        ),
      };
    }

    case 'updateItem': {
      const { listId, itemId, changes, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? { ...item, ...changes } : item,
                ),
                updatedAt: now,
              }
            : list,
        ),
      };
    }

    case 'removeItem': {
      const { listId, itemId, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id !== listId) {
            return list;
          }
          // A list can never be empty. The screen asks "delete the whole list?" instead.
          if (list.items.length <= 1) {
            return list;
          }
          return {
            ...list,
            items: list.items.filter((item) => item.id !== itemId),
            updatedAt: now,
          };
        }),
      };
    }

    case 'toggleItem': {
      const { listId, itemId, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId
                    ? { ...item, isBought: !item.isBought }
                    : item,
                ),
                updatedAt: now,
              }
            : list,
        ),
      };
    }

    // ----- Trip -----

    case 'finishList': {
      const { listId, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                // Items stay exactly as they are: unticked ones = "skipped".
                status: 'completed',
                completedAt: now,
                updatedAt: now,
              }
            : list,
        ),
      };
    }

    case 'restoreList': {
      const { listId, now } = action.payload;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                // Written out field by field, so completedAt is left out.
                id: list.id,
                title: list.title,
                items: list.items,
                budget: list.budget,
                createdAt: list.createdAt,
                status: 'active',
                updatedAt: now,
              }
            : list,
        ),
      };
    }

    case 'shopAgain':
      // The action already contains the new copied list. New lists go on top.
      return { ...state, lists: [action.payload.list, ...state.lists] };

    // ----- Settings -----

    case 'updateSettings':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload.changes },
      };
  }
}
