import { useState, useCallback } from 'react'

interface NoteRecord {
  id?: string
  title: string
  content: string
  tags?: string[]
  related_project?: string
  date?: string
  created_at?: string
  updated_at?: string
}

export function useNotes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notes')
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }
      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch notes error:', message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addNote = useCallback(async (note: NoteRecord) => {
    setLoading(true)
    setError(null)
    try {
      const noteData = {
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        related_project: note.related_project,
        date: note.date || new Date().toISOString().split('T')[0],
      }
      
      // Save to database via API
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        throw new Error('Failed to save note to database')
      }

      const savedNote = await response.json()

      // Also save to localStorage for backup
      if (typeof window !== 'undefined') {
        const existingNotes = localStorage.getItem('notes')
        const notes = existingNotes ? JSON.parse(existingNotes) : []
        notes.push(savedNote)
        localStorage.setItem('notes', JSON.stringify(notes))
      }

      console.log('Note saved successfully:', savedNote)
      return savedNote
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Add note error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateNote = useCallback(async (note: NoteRecord) => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available')
      }

      const noteData = {
        ...note,
        updated_at: new Date().toISOString(),
      }
      
      const existingNotes = localStorage.getItem('notes')
      const notes = existingNotes ? JSON.parse(existingNotes) : []
      const index = notes.findIndex((n: NoteRecord) => n.id === note.id)
      
      if (index >= 0) {
        notes[index] = noteData
      }
      
      localStorage.setItem('notes', JSON.stringify(notes))
      return noteData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available')
      }

      const existingNotes = localStorage.getItem('notes')
      const notes = existingNotes ? JSON.parse(existingNotes) : []
      const filtered = notes.filter((n: NoteRecord) => n.id !== id)
      
      localStorage.setItem('notes', JSON.stringify(filtered))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
  }
}
