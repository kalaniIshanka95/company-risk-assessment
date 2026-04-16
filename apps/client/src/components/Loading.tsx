export default function Loading() {
  return (
    <p className="empty" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="spinner" />
      Loading…
    </p>
  )
}
