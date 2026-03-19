'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, Circle, AlertCircle, Clock, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function TasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    // Load tasks from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('tasks')
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks)
          setTasks(parsedTasks)
        } catch (e) {
          setTasks([])
        }
      }
    }
  }, [])

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id)
    setTasks(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  const priorityColors = {
    urgent: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    high: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
    medium: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    low: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
  }

  const statusColors = {
    todo: { icon: Circle, color: 'text-muted-foreground' },
    in_progress: { icon: Clock, color: 'text-blue-500' },
    completed: { icon: CheckCircle2, color: 'text-green-500' },
    blocked: { icon: AlertCircle, color: 'text-red-500' },
  }

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority
    return statusMatch && priorityMatch
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Tasks</h1>
                <p className="text-muted-foreground">Manage and track all team tasks</p>
              </div>
              <Link href="/tasks/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Task
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Filter by Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Tasks List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const StatusIcon = statusColors[task.status as keyof typeof statusColors].icon
                const statusColor = statusColors[task.status as keyof typeof statusColors].color

                return (
                  <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <button className="mt-1 flex-shrink-0">
                        <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/tasks/${task.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors mb-1">{task.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline" className="text-xs">
                            {task.project}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">Assigned to {task.assignedTo}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Priority & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm" className="px-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2 text-destructive hover:text-destructive" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new task</p>
                <Link href="/tasks/new">
                  <Button>Create Task</Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
