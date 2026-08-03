import { useEffect } from 'react'

/* Mirrors the prototype's per-page document.title values. */
export function useDocTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
