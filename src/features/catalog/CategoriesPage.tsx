import Crumbs from '../../components/layout/Crumbs'
import CategoryCard from './CategoryCard'
import { useDocTitle } from '../../lib/useDocTitle'
import { CATEGORIES } from '../../data/mock'

export default function CategoriesPage() {
  useDocTitle('All categories — Primer')
  return (
    <main>
      <div className="container page-head">
        <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />
        <div className="ph-row">
          <div>
            <h1 style={{ marginTop: 6 }}>All categories</h1>
            <p className="ph-desc">Every subject on Primer, each organized into subcategories and sequenced topics. Pick one to drill down.</p>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="grid grid-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
