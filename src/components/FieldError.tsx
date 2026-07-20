export default function FieldError({ show, message = 'Required' }: { show: boolean; message?: string }) {
  if (!show) return null
  return <p className="text-xs text-red-400 mt-1">{message}</p>
}
