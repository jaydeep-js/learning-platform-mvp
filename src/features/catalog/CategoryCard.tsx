import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import { catHref } from '../../lib/routes'
import { useCatalog } from '../../data/catalog'
import type { Category } from '../../data/mock'

/* Port of catCardHTML in app.js. */
export default function CategoryCard({ cat }: { cat: Category }) {
  const { catalog } = useCatalog()
  const counts = catalog?.topicCounts(cat.slug) ?? { topics: 0, mins: 0 }
  return (
    <Link className="card card-hover cat-card" to={catHref(cat.slug)}>
      <div className="cat-icon" style={{ background: cat.tint, color: cat.tintInk }}>
        <Icon name={cat.icon} />
      </div>
      <h3>{cat.name}</h3>
      <p className="small" style={{ color: 'var(--body)' }}>
        {cat.desc}
      </p>
      <div className="cat-count small muted">
        <span className="mono">{cat.subs.length}</span> subcategories · <span className="mono">{counts.topics}</span> topics
      </div>
    </Link>
  )
}
