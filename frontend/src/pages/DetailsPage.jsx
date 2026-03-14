import { useParams } from 'react-router-dom'

export default function DetailsPage() {
  const { id } = useParams()
  return <div className="text-slate-100">Details Page for id: {id}</div>
}