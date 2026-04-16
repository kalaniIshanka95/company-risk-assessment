export default function Sev({ level }: { level: string }) {
  return <span className={`sev sev-${level}`}>{level}</span>
}
