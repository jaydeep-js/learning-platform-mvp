import { Fragment } from 'react'
import { Link } from 'react-router'

export interface Crumb {
  label: string
  href?: string
}

/* Breadcrumb trail — last item is the current page. */
export default function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={i}>
            {i > 0 ? (
              <span className="sep" aria-hidden="true">
                /
              </span>
            ) : null}
            {last || !it.href ? (
              <span className="here" aria-current="page">
                {it.label}
              </span>
            ) : (
              <Link to={it.href}>{it.label}</Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
