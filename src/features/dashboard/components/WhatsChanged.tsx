import Link from 'next/link'
import Card from '@/components/Card'
import type { ChangeItem } from '../whats-changed'

export default function WhatsChanged({ items }: { items: ChangeItem[] }) {
  return (
    <Card title="What's Changed" padding="p-3.5">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing new since yesterday yet</p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item, i) => (
            <li key={i}>
              <Link href={item.href} className="flex items-center gap-3 py-1 px-2 -mx-2 rounded-lg hover:bg-surface-2 transition-colors">
                <span className="text-base shrink-0">{item.emoji}</span>
                <p className="text-sm text-slate-300 flex-1">{item.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
