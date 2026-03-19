'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { useNotes } from '@/hooks/use-notes'

export default function NewNotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const template = searchParams.get('template')
  const isMeetingMinutes = template === 'minutes'
  const { addNote, loading, error } = useNotes()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    relatedProject: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Pre-fill meeting minutes template when requested
  useEffect(() => {
    if (template === 'minutes') {
      setFormData((prev) => ({
        ...prev,
        title: `Meeting Minutes (${new Date().toLocaleDateString()})`,
        content: `## Attendees\n\n- \n\n## Agenda\n\n- \n\n## Notes\n\n- \n\n## Action Items\n\n- [ ] `,
        tags: 'meeting,minutes',
      }))
    }
  }, [template])

  const projects = [
    'Website Redesign',
    'Mobile App Development',
    'API Development',
    'Data Analytics',
    'Marketing Campaign',
    'Q1 Planning Initiative',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const noteData = {
      title: formData.title,
      content: formData.content,
      tags: tags,
      related_project: formData.relatedProject || undefined,
      date: formData.date,
    }

    addNote(noteData)
      .then(() => {
        console.log('Note created successfully, redirecting...')
        router.push('/notes')
      })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create note'
        setSubmitError(errorMsg)
        console.error('Failed to create note:', errorMsg)
      })
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-6">
              <Link href="/notes" className="flex items-center gap-2 text-primary hover:underline mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Notes
              </Link>
              <h1 className="text-3xl font-bold mb-2">
                {isMeetingMinutes ? 'Create Meeting Minutes' : 'Create New Note'}
              </h1>
              <p className="text-muted-foreground">
                {isMeetingMinutes
                  ? 'Capture meeting notes and convert action items into tasks'
                  : 'Add a new note to your collection'}
              </p>
            </div>

            {/* Form */}
            <Card className="p-6">
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Note Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter note title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-2">
                    Content *
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Enter note content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-2">
                    Date *
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Related Project */}
                <div>
                  <label htmlFor="relatedProject" className="block text-sm font-medium mb-2">
                    Related Project
                  </label>
                  <select
                    id="relatedProject"
                    name="relatedProject"
                    value={formData.relatedProject}
                    onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select a project (optional)</option>
                    {projects.map((project) => (
                      <option key={project} value={project}>
                        {project}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-2">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    type="text"
                    placeholder="Enter tags separated by commas (e.g., design, review, urgent)"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Note'}
                  </Button>
                  <Link href="/notes" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
