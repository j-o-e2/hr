'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ListChecks, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { useToast } from '@/hooks/use-toast'

type Note = {
  id: string
  title: string
  content: string
  tags?: string[]
  related_project?: string
  date?: string
  updated_at?: string
}

type Task = {
  id: string
  title: string
  description: string
  project: string
  assignedTo: string
  status: string
  priority: string
  dueDate: string
  createdAt: string
}

function extractActionItems(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- [ ]') || line.startsWith('- '))
    .map((line) => line.replace(/^- \[\]\s*/, '').replace(/^-\s*/, '').trim())
    .filter(Boolean)
}

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params?.id
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasksCreated, setTasksCreated] = useState<number | null>(null)

  useEffect(() => {
    if (!noteId) return

    const loadNote = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/notes')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const notes: Note[] = await res.json()
        const found = notes.find((n) => n.id === noteId)
        if (!found) {
          setError('Note not found')
          setNote(null)
        } else {
          setNote(found)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load note')
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [noteId])

  const actionItems = useMemo(() => {
    return note?.content ? extractActionItems(note.content) : []
  }, [note])

  const createTasksFromActionItems = () => {
    if (!note) return
    if (actionItems.length === 0) {
      toast({
        title: 'No action items found',
        description: 'Add lines starting with "- [ ]" to generate tasks.',
        variant: 'destructive',
      })
      return
    }

    const existingTasks: Task[] =
      typeof window !== 'undefined' && localStorage.getItem('tasks')
        ? JSON.parse(localStorage.getItem('tasks')!)
        : []

    const newTasks: Task[] = actionItems.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      title: item,
      description: '',
      project: note.related_project || 'Meeting',
      assignedTo: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      createdAt: new Date().toISOString().split('T')[0],
    }))

    const dedupedTasks = [...existingTasks, ...newTasks]
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(dedupedTasks))
    }

    setTasksCreated(newTasks.length)
    toast({
      title: 'Tasks created',
      description: `Created ${newTasks.length} task${newTasks.length === 1 ? '' : 's'} from action items.`,
    })
    router.push('/tasks')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar open={true} onOpenChange={() => {}} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => {}} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading note...</p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={true} onOpenChange={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => {}} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-6">
              <Link href="/notes" className="flex items-center gap-2 text-primary hover:underline mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Notes
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{note?.title}</h1>
                  <p className="text-muted-foreground">View the full note and convert action items into tasks.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/tasks')}>
                    <ListChecks className="w-4 h-4" />
                    View Tasks
                  </Button>
                  <Button onClick={createTasksFromActionItems} size="sm">
                    <PlusCircle className="w-4 h-4" />
                    Create Tasks from Action Items
                  </Button>
                </div>
              </div>
            </div>

            {error ? (
              <Card className="p-6 bg-red-50 border-red-200">
                <p className="text-sm text-red-700">Error: {error}</p>
              </Card>
            ) : (
              <Card className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {note?.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {note?.related_project && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Project:</span> {note.related_project}
                    </div>
                  )}
                  {note?.date && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Date:</span> {new Date(note.date).toLocaleDateString()}
                    </div>
                  )}
                  {note?.updated_at && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Last Updated:</span> {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="whitespace-pre-wrap text-sm text-foreground">
                  {note?.content}
                </div>

                {actionItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Action Items</h2>
                      <span className="text-xs text-muted-foreground">{actionItems.length} found</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside">
                      {actionItems.map((item, idx) => (
                        <li key={idx} className="text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tasksCreated !== null && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                    Created {tasksCreated} task{tasksCreated === 1 ? '' : 's'} from action items.
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
