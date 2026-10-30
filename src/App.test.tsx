import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Item, ShoppingList } from './domain/schemas';
import { renderApp } from './test/renderApp';

// Component tests: draw the app, act like a user, check the screen.
// Every test has the same 3 steps: 1. RENDER  2. ACT  3. CHECK

/** A fixed date, so test results never depend on the clock. */
const NOW = '2026-10-30T12:00:00.000Z';

/** Builds a fresh, valid item. Pass only what the test cares about. */
let nextId = 1;
function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: `item-${nextId++}`,
    name: 'Milk',
    quantity: 1,
    unitPrice: 12_000, // cents → RSD 120.00
    isBought: false,
    ...overrides,
  };
}

/** Builds a fresh, valid active list. Pass only what the test cares about. */
function makeList(overrides: Partial<ShoppingList> = {}): ShoppingList {
  return {
    id: `list-${nextId++}`,
    title: 'Weekly groceries',
    items: [makeItem()],
    budget: null,
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } as ShoppingList;
}

describe('Shopping a list', () => {
  it('ticks an item when you tap it', async () => {
    // 1. RENDER: open a list that has "Milk", not ticked yet
    const list = makeList({ items: [makeItem({ name: 'Milk' })] });
    renderApp({ url: `/lists/${list.id}`, lists: [list] });

    // 2. ACT: tap the Milk row, like a finger would.
    //    { name: /^Milk/ } = "the button whose name STARTS with Milk"
    //    (the ✎ button is called "Edit Milk", so it doesn't match).
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^Milk/ }));

    // 3. CHECK: the row now says "ticked" (aria-pressed="true")
    expect(screen.getByRole('button', { name: /^Milk/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('New list', () => {
  it('creating a list opens it with its name on screen', async () => {
    // 1. RENDER
    renderApp({ url: `/new` });

    // 2. ACT
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('List name'), 'Sunday BBQ');
    await user.type(screen.getByLabelText('Item name'), 'Bread{Enter}'); // ← {Enter} adds it
    await user.click(screen.getByRole('button', { name: 'Create list' }));

    // 3. CHECK
    expect(
      screen.getByRole('heading', { name: 'Sunday BBQ' }),
    ).toBeInTheDocument();
  });
});

describe('Finishing a trip', () => {
  it('moves the list to History', async () => {
    // 1. RENDER
    const list = makeList({
      items: [makeItem({ name: 'Milk' })],
      title: 'Party',
    });
    renderApp({ url: `/lists/${list.id}`, lists: [list] });

    // 2. ACT
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await user.click(
      screen.getByRole('button', { name: 'Finish and save to History' }),
    );

    // 3. CHECK: we are on History (its heading), and "Party" is listed there.
    //    The heading check matters: the Shopping page ALSO shows "Party",
    //    so checking the title alone would pass even if nothing happened.
    expect(
      screen.getByRole('heading', { name: 'History' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Party')).toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('choosing EUR shows prices in euros', async () => {
    // 1. RENDER: open Settings, with one saved list (Milk, RSD 120.00)
    renderApp({ url: '/settings', lists: [makeList()] });

    // 2. ACT: choose EUR, then go to the Lists tab
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'EUR' }));
    await user.click(screen.getByRole('link', { name: 'Lists' }));

    // 3. CHECK: the list card shows its price with a € sign.
    //    /€/ = "any text that CONTAINS €" (the full text is "€120.00").
    expect(screen.getByText(/€/)).toBeInTheDocument();
  });
});
