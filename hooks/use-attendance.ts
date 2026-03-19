import { useState, useCallback } from 'react'

interface AttendanceRecord {
  id?: string
  memberName: string
  date: string
  status: 'present' | 'absent' | 'late' | 'half-day'
  checkIn?: string
  checkOut?: string
  notes?: string
  attended?: boolean
}

export function useAttendance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async (date?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/attendance', window.location.origin)
      if (date) url.searchParams.append('date', date)
      
      const response = await fetch(url)
      const contentType = response.headers.get('content-type')
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            const text = await response.text()
            errorMessage = text || errorMessage
          }
        } else {
          const text = await response.text()
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server')
      }
      
      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch attendance error:', message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addAttendance = useCallback(async (record: AttendanceRecord) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      
      const contentType = response.headers.get('content-type')
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            const text = await response.text()
            errorMessage = text || errorMessage
          }
        } else {
          const text = await response.text()
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server')
      }
      
      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Add attendance error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAttendance = useCallback(async (record: AttendanceRecord) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      
      const contentType = response.headers.get('content-type')
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            const text = await response.text()
            errorMessage = text || errorMessage
          }
        } else {
          const text = await response.text()
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server')
      }
      
      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAttendance = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/attendance?id=${id}`, {
        method: 'DELETE',
      })
      
      const contentType = response.headers.get('content-type')
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            const text = await response.text()
            errorMessage = text || errorMessage
          }
        } else {
          const text = await response.text()
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server')
      }
      
      return await response.json()
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
    fetchAttendance,
    addAttendance,
    updateAttendance,
    deleteAttendance,
  }
}
