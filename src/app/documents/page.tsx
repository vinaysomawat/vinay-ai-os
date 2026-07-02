import DocumentsView from '@/features/documents/components/DocumentsView'
import { getDocuments } from '@/features/documents/actions'

export default async function DocumentsPage() {
  const documents = await getDocuments()
  return <DocumentsView initialDocuments={documents} />
}
