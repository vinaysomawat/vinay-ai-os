'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Plus, Trash2, ExternalLink, X } from 'lucide-react'
import Card from '@/components/Card'
import { addResource, updateResource, deleteResource } from '../actions'
import type { Resource, ResourceStatus, ResourceType } from '../types'

const TYPE_ICON: Record<ResourceType, string> = {
  course: '🎓', book: '📚', video: '🎬', article: '📄', podcast: '🎙️',
}

const STATUS_CONFIG: Record<ResourceStatus, { label: string; color: string; bg: string }> = {
  'not-started': { label: 'Not started', color: 'text-slate-400',  bg: 'bg-slate-500/15' },
  'in-progress':  { label: 'In progress', color: 'text-amber-400',  bg: 'bg-amber-500/15' },
  'completed':    { label: 'Completed',   color: 'text-green-400',  bg: 'bg-green-500/15' },
}

const STATUSES = Object.keys(STATUS_CONFIG) as ResourceStatus[]
const TYPES: ResourceType[] = ['course', 'book', 'video', 'article', 'podcast']

interface Props { initialResources: Resource[] }

export default function LearningView({ initialResources }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<ResourceStatus | 'all'>('all')
  const [isPending, startTransition] = useTransition()

  const [resources, updateResources] = useOptimistic(
    initialResources,
    (state: Resource[], action: { type: string; payload: Partial<Resource> & { id?: string } }) => {
      if (action.type === 'add') return [action.payload as Resource, ...state]
      if (action.type === 'update') return state.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r)
      if (action.type === 'delete') return state.filter(r => r.id !== action.payload.id)
      return state
    }
  )

  const filtered = filter === 'all' ? resources : resources.filter(r => r.status === filter)
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: resources.filter(r => r.status === s).length }), {} as Record<ResourceStatus, number>)

  const handleAdd = async (formData: FormData) => {
    const optimistic: Resource = {
      id: `temp-${Date.now()}`, user_id: '',
      title: formData.get('title') as string,
      type: formData.get('type') as ResourceType,
      url: formData.get('url') as string || null,
      category: formData.get('category') as string || 'General',
      status: 'not-started', progress: 0,
      notes: formData.get('notes') as string || null,
      created_at: new Date().toISOString(),
    }
    setShowForm(false)
    startTransition(async () => {
      updateResources({ type: 'add', payload: optimistic })
      await addResource(formData)
    })
  }

  const handleStatus = (id: string, status: ResourceStatus) => {
    startTransition(async () => {
      updateResources({ type: 'update', payload: { id, status, progress: status === 'completed' ? 100 : undefined } })
      await updateResource(id, { status, ...(status === 'completed' ? { progress: 100 } : {}) })
    })
  }

  const handleProgress = (id: string, progress: number) => {
    startTransition(async () => {
      updateResources({ type: 'update', payload: { id, progress } })
      await updateResource(id, { progress })
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      updateResources({ type: 'delete', payload: { id } })
      await deleteResource(id)
    })
  }

  return (
    <div className="space-y-5">
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-accent text-white' : 'bg-surface-1 border border-surface-3 text-slate-400 hover:bg-surface-2'}`}>
          All ({resources.length})
        </button>
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s]
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? `${cfg.bg} ${cfg.color}` : 'bg-surface-1 border border-surface-3 text-slate-400 hover:bg-surface-2'}`}>
              {cfg.label} ({counts[s]})
            </button>
          )
        })}
      </div>

      <Card title="Resources" action={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-colors">
          <Plus size={12} /> Add
        </button>
      }>
        {filtered.length === 0 && <p className="text-sm text-slate-600 text-center py-8">Nothing here yet</p>}
        <ul className="space-y-2">
          {filtered.map(r => {
            const cfg = STATUS_CONFIG[r.status]
            return (
              <li key={r.id} className="p-3 rounded-lg bg-surface-2 border border-surface-3 group">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 shrink-0">{TYPE_ICON[r.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200">{r.title}</span>
                      {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-accent transition-colors"><ExternalLink size={11} /></a>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <select value={r.status} onChange={e => handleStatus(r.id, e.target.value as ResourceStatus)} disabled={isPending}
                        className={`text-xs px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer font-medium ${cfg.color} ${cfg.bg}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                      <span className="text-xs text-slate-600">{r.category}</span>
                    </div>
                    {r.status === 'in-progress' && (
                      <div className="mt-2 flex items-center gap-2">
                        <input type="range" min={0} max={100} value={r.progress}
                          onChange={e => handleProgress(r.id, parseInt(e.target.value))}
                          className="flex-1 h-1 accent-violet-500" />
                        <span className="text-xs text-slate-500 w-8 text-right">{r.progress}%</span>
                      </div>
                    )}
                    {r.status === 'completed' && (
                      <div className="mt-1.5 h-1 bg-green-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full w-full" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-200">Add Resource</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <form action={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Title *</label>
                <input name="title" required placeholder="The Pragmatic Programmer" className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Type</label>
                  <select name="type" defaultValue="course" className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-accent transition-colors">
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Category</label>
                  <input name="category" placeholder="React, DSA, System Design..." className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-wider">URL</label>
                <input name="url" type="url" placeholder="https://..." className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Notes</label>
                <textarea name="notes" rows={2} placeholder="Why you want to learn this..." className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-surface-2 border border-surface-3 text-slate-300 text-sm hover:bg-surface-3 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
