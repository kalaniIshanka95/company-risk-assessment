export default function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-title">
        {title}
        {aside && <span className="section-title-badge">{aside}</span>}
      </div>
      {children}
    </div>
  )
}
