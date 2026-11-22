// Used for empty dataset, no matches, empty plan and not-found situations.
export default function EmptyState({ title, children, actions, headingLevel = 'h2' }) {
  const Heading = headingLevel;
  return (
    <div className="empty-state">
      <Heading className="empty-state__title">{title}</Heading>
      <div className="empty-state__body">{children}</div>
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  );
}
