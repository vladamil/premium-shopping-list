import { Link } from 'react-router';

// Shown for any URL that doesn't match a route (e.g. a typo or an old link).
export function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Go to your lists</Link>
    </main>
  );
}
