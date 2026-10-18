import { useEffect } from 'react'
import { profile } from '../content/profile'

const DEFAULT_DESCRIPTION =
  'Portfolio of Yra Climaco: product analytics and data science for consumer tech, including gaming, streaming, and entertainment.'

export function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    document.title = title ? `${title} | ${profile.name}` : `${profile.name} | Product Analytics & Data Science`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }, [title, description])
}
