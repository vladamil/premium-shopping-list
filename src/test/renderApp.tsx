import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../App';
import type { ShoppingList } from '../domain/schemas';
import { AppStateProvider } from '../state/AppStateProvider';
import { createEmptyAppData } from '../storage/parseAppData';
import { STORAGE_KEY } from '../storage/storage';

type RenderAppOptions = {
  /** The page to open, e.g. '/', '/settings', '/lists/list-1'. */
  url: string;
  /** Lists that are "already saved" when the app starts. */
  lists?: ShoppingList[];
};

/**
 * Draws the WHOLE app at one URL, the same way main.tsx does,
 * with some lists already saved. Tests then click around like a user.
 */
export function renderApp({ url, lists = [] }: RenderAppOptions) {
  // 1. Save the lists where the app looks on start (the fake browser's localStorage).
  const data = { ...createEmptyAppData(), lists };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // 2. Draw the app. MemoryRouter = a router that starts at `url` without a
  //    real address bar (BrowserRouter needs one, the fake browser has none
  //    we can set easily).
  render(
    <MemoryRouter initialEntries={[url]}>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </MemoryRouter>,
  );
}
