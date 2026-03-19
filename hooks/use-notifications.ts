import { useState, useCallback } from 'react'

interface NotificationRecord {
  id?: string
  teamMemberId: string
  taskId?: string
  type?: string
  title: string
  message: string
  read?: boolean
  createdAt?: string
  updatedAt?: string
}

export function useNotifications() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async (teamMemberId?: string, read?: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (teamMemberId) params.append('teamMemberId', teamMemberId)
      if (read !== undefined) params.append('read', read.toString())

      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch notifications error:', message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createNotification = useCallback(async (notification: NotificationRecord) => {
    setLoading(true)
    setError(null)
    try {
      const notificationData = {
        teamMemberId: notification.teamMemberId,
        taskId: notification.taskId,
        type: notification.type || 'general',
        title: notification.title,
        message: notification.message,
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (!response.ok) {
        throw new Error('Failed to create notification')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Create notification error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Mark as read error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllAsRead = useCallback(async (teamMemberId: string) => {
    setLoading(true)
    setError(null)
    try {
      // First fetch unread notifications
      const unreadNotifications = await fetchNotifications(teamMemberId, false)

      // Mark each one as read
      const promises = unreadNotifications.map((notification: NotificationRecord) =>
        fetch(`/api/notifications?id=${notification.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ read: true }),
        })
      )

      await Promise.all(promises)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Mark all as read error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchNotifications])

  const deleteNotification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Delete notification error:', message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}