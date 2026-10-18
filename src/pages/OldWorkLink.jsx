import { Navigate, useParams } from 'react-router-dom'

// Earlier links used /work; send them to the same place under /projects.
export default function OldWorkLink() {
  const { slug } = useParams()
  return <Navigate to={slug ? `/projects/${slug}` : '/projects'} replace />
}
