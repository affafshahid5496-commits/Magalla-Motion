import { Link, useLocation } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  useDocumentTitle('Page not found');
  return (
    <EmptyState
      headingLevel="h1"
      title="This page does not exist"
      actions={
        <>
          <Link className="btn btn--primary" to="/">
            Browse classes
          </Link>
          <Link className="btn btn--secondary" to="/plan">
            View my plan
          </Link>
        </>
      }
    >
      <p>There is nothing at “{pathname}”. Check the address, or head back to the timetable.</p>
    </EmptyState>
  );
}
