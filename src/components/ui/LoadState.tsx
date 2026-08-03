import Icon from '../icons/Icon'

/* Quiet placeholder while a page's data loads. */
export function PageLoading() {
  return (
    <main>
      <div className="container section">
        <p className="small muted" role="status">
          Loading…
        </p>
      </div>
    </main>
  )
}

/* Error state reusing the design system's .empty card. */
export function PageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="card empty">
            <div className="empty-icon">
              <Icon name="info" />
            </div>
            <h2 style={{ fontSize: 20 }}>Something went wrong</h2>
            <p className="small" style={{ marginTop: 8, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
              We couldn't load this page. Check your connection and try again.
            </p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={onRetry}>
              Try again
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
