import Crumbs from '../../components/layout/Crumbs'
import CategoryCard from './CategoryCard'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useDocTitle } from '../../lib/useDocTitle'
import { useCatalog } from '../../data/catalog'

export default function CategoriesPage() {
  useDocTitle('All categories — Primer')
  const { catalog, isLoading, isError, refetch } = useCatalog()
  if (isLoading) return <PageLoading />
  if (isError || !catalog) return <PageError onRetry={() => void refetch()} />
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
            {catalog.categories.map((cat) => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
