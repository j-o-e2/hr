'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTasks = localStorage.getItem('tasks')
    const loadedTasks = savedTasks ? JSON.parse(savedTasks) : []
    setTasks(Array.isArray(loadedTasks) ? loadedTasks : [])
  }, [])

  const deadlines = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: task.id,
      title: task.title,
      date: new Date(task.dueDate),
      priority: task.priority || 'medium',
      status: task.status === 'completed' ? 'completed' : task.status === 'blocked' ? 'at_risk' : 'on_track',
      project: task.project || 'General',
      owner: task.assignedTo || 'Unassigned',
    }))

  const statusColors = {
    on_track: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    at_risk: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
    completed: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  }

  const priorityColors = {
    urgent: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    high: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
    medium: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    low: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'at_risk':
        return <AlertCircle className="w-4 h-4" />
      case 'on_track':
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  const getSelectedDateDeadlines = () => {
    if (!selectedDate) return []
    return deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.date)
      return (
        deadlineDate.getFullYear() === selectedDate.getFullYear() &&
        deadlineDate.getMonth() === selectedDate.getMonth() &&
        deadlineDate.getDate() === selectedDate.getDate()
      )
    })
  }

  const upcomingDeadlines = deadlines
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Calendar & Deadlines</h1>
              <p className="text-muted-foreground">Track important dates and project deadlines</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <Card className="p-6 h-fit">
                <h2 className="text-lg font-semibold mb-4">February 2024</h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full"
                />

                {/* Selected Date Info */}
                {selectedDate && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Selected Date</p>
                    <p className="font-semibold text-lg">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getSelectedDateDeadlines().length} deadline{getSelectedDateDeadlines().length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </Card>

              {/* Deadlines List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Deadlines */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-start gap-4 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{deadline.title}</h3>
                          <div className="flex flex-wrap gap-2 items-center text-xs">
                            <Badge variant="outline">{deadline.project}</Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{deadline.date.toLocaleDateString()}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">Owner: {deadline.owner}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={priorityColors[deadline.priority as keyof typeof priorityColors]}>
                            {deadline.priority}
                          </Badge>
                          <Badge className={statusColors[deadline.status as keyof typeof statusColors]} variant="secondary">
                            {getStatusIcon(deadline.status)}
                            <span className="ml-1">{deadline.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Selected Date Deadlines */}
                {selectedDate && getSelectedDateDeadlines().length > 0 && (
                  <Card className="p-6 border-primary/50">
                    <h2 className="text-lg font-semibold mb-4">
                      Deadlines for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </h2>
                    <div className="space-y-3">
                      {getSelectedDateDeadlines().map((deadline) => (
                        <div key={deadline.id} className="p-4 bg-muted rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{deadline.title}</h3>
                            <Badge className={priorityColors[deadline.priority as keyof typeof priorityColors]}>
                              {deadline.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{deadline.project}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Owner: {deadline.owner}</span>
                            <Badge className={statusColors[deadline.status as keyof typeof statusColors]} variant="secondary">
                              {getStatusIcon(deadline.status)}
                              <span className="ml-1">{deadline.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
