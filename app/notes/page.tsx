'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Edit, Search, Tag, Calendar as CalendarIcon, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { useNotes } from '@/hooks/use-notes'

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { fetchNotes, deleteNote, loading, error } = useNotes()

  const [notes, setNotes] = useState([])

  // Load notes on mount
  useEffect(() => {
    const loadNotes = async () => {
      const loadedNotes = await fetchNotes()
      if (loadedNotes && loadedNotes.length > 0) {
        setNotes(loadedNotes)
      }
    }
    loadNotes()
  }, [])

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])))

  // Filter notes based on search and tags
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm text-red-700">Error: {error}</p>
              </Card>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Notes</h1>
                <p className="text-muted-foreground">Store and organize important notes and information</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/notes/new?template=minutes">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    Meeting Minutes
                  </Button>
                </Link>
                <Link href="/notes/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Filter by Tag</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedTag === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTag(null)}
                      >
                        All Tags
                      </Button>
                      {allTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={selectedTag === tag ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTag(tag)}
                          className="flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="p-6 flex flex-col hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg flex-1 line-clamp-2">{note.title}</h3>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="px-2">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="px-2 text-destructive hover:text-destructive"
                        onClick={async () => {
                          try {
                            await deleteNote(note.id)
                            setNotes(notes.filter(n => n.id !== note.id))
                          } catch (err) {
                            console.error('Failed to delete note:', err)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{note.content}</p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border">
                      {note.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {note.related_project && (
                      <div className="flex items-center gap-2">
                        <span>Project:</span>
                        <span className="font-medium text-foreground">{note.related_project}</span>
                      </div>
                    )}
                    {note.date && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Date: {new Date(note.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="mt-4">
                    <Link href={`/notes/${note.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Note
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredNotes.length === 0 && !loading && (
              <Card className="p-12 text-center">
                <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || selectedTag ? 'No notes found' : 'No notes yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedTag
                    ? 'Try adjusting your search or filter'
                    : 'Start taking notes to organize your thoughts'}
                </p>
                <Link href="/notes/new">
                  <Button>Create Note</Button>
                </Link>
              </Card>
            )}

            {loading && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading notes...</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
