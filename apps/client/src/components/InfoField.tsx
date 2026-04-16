export default function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="info-field-label">{label}</div>
      <div className="info-field-value">{value}</div>
    </div>
  )
}
