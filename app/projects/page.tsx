'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, Edit, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function ProjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [projects, setProjects] = useState<any[]>([])

  const statusColors = {
    active: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-200 dark:bg-blue-800' },
    in_progress: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-200 dark:bg-purple-800' },
    completed: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-200 dark:bg-green-800' },
  }

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

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
                <h1 className="text-3xl font-bold mb-2">Projects</h1>
                <p className="text-muted-foreground">Manage all your projects and track progress</p>
              </div>
              <Link href="/projects/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </Link>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const progress = getProgressPercentage(project.completed, project.tasks)
                const colors = statusColors[project.status as keyof typeof statusColors]

                return (
                  <Card key={project.id} className={`p-6 hover:shadow-lg transition-shadow`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <FolderOpen className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                      <Badge className={colors.badge}>{getStatusLabel(project.status)}</Badge>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground">Progress</p>
                        <p className="text-xs font-bold">{progress}%</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.completed} of {project.tasks} tasks completed
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Owner</p>
                        <p className="text-sm font-medium">{project.owner}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due Date
                        </p>
                        <p className="text-sm font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="px-3">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="px-3 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
              <Card className="p-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
                <Link href="/projects/new">
                  <Button>Create Project</Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
