export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{text}</span>
    </div>
  );
}
