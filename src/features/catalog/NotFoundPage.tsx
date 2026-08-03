import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useDocTitle } from '../../lib/useDocTitle'

/* Not-found state — reuses the prototype's .empty card pattern. Rendered by
   the catch-all route and by detail pages whose slug resolves to nothing. */
export default function NotFoundPage() {
  useDocTitle('Page not found — Primer')
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="card empty">
            <div className="empty-icon">
              <Icon name="search" />
            </div>
            <h2 style={{ fontSize: 20 }}>We can't find that page</h2>
            <p className="small" style={{ marginTop: 8, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
              The link may be out of date, or the content may have been moved or unpublished. Try browsing from a category instead.
            </p>
            <div className="flex gap-3" style={{ justifyContent: 'center', marginTop: 20 }}>
              <Link className="btn btn-primary" to="/categories">
                Browse categories
              </Link>
              <Link className="btn btn-secondary" to="/">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
