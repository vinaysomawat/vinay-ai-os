import CodingView from '@/features/coding/components/CodingView'
import { getProjects } from '@/features/coding/actions'

export default async function CodingPage() {
  const projects = await getProjects()
  return <CodingView initialProjects={projects} />
}
