import { Link, useParams } from 'react-router';

// Temporary shell. The real "Shopping a list" screen comes in chunk 7.
export function ShoppingPage() {
  // The ":id" part of the URL /lists/:id
  const { id } = useParams();

  return (
    <main>
      <Link to="/">Back to lists</Link>
      <h1>Shopping a list</h1>
      <p>List id from the URL: {id}</p>
    </main>
  );
}
