import type { Level } from '../../data/mock'

const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function LevelBadge({ level }: { level: Level }) {
  return <span className={`badge badge-${level}`}>{LEVEL_LABEL[level]}</span>
}
