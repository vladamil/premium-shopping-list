import type { Item, Money, ShoppingList } from '../domain/schemas';

/** What the user types for a new item. The id and isBought are added for them. */
export type NewItem = Pick<Item, 'name' | 'quantity' | 'unitPrice'>;

/** Every change the app can make: a name (`type`) and its details (`payload`). */
export type AppAction =
  | { type: 'createList'; payload: { list: ShoppingList } }
  | {
      type: 'updateList';
      payload: {
        listId: string;
        changes: { title?: string; budget?: Money | null };
        now: string;
      };
    }
  | { type: 'deleteList'; payload: { listId: string } };

// ---------------------------------------------------------------------------
// Helpers that build the actions (Action creators). They create ids and read the clock,
// so the reducer itself never has to.
// ---------------------------------------------------------------------------

export function createList(
  title: string,
  newItems: NewItem[],
  budget: Money | null,
): AppAction {
  const now = new Date().toISOString();
  return {
    type: 'createList',
    payload: {
      list: {
        id: crypto.randomUUID(),
        title,
        items: newItems.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          isBought: false,
        })),
        budget,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    },
  };
}

export function updateList(
  listId: string,
  changes: { title?: string; budget?: Money | null },
): AppAction {
  return {
    type: 'updateList',
    payload: { listId, changes, now: new Date().toISOString() },
  };
}

export function deleteList(listId: string): AppAction {
  return { type: 'deleteList', payload: { listId } };
}
