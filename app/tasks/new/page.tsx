'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function NewTaskPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  })

  const [projectSuggestions, setProjectSuggestions] = useState<string[]>([])
  const [teamSuggestions, setTeamSuggestions] = useState<string[]>([])
  const [filteredProjects, setFilteredProjects] = useState<string[]>([])
  const [filteredTeam, setFilteredTeam] = useState<string[]>([])
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTasks = localStorage.getItem('tasks')
    const tasks = savedTasks ? JSON.parse(savedTasks) : []
    const uniqueProjects = Array.from(new Set(tasks.map((t: any) => t.project).filter(Boolean))) as string[]
    setProjectSuggestions(uniqueProjects)
    setFilteredProjects(uniqueProjects)

    const savedMembers = localStorage.getItem('teamMembers')
    const members = savedMembers ? JSON.parse(savedMembers) : []
    const memberNames = Array.from(new Set(members.map((m: any) => m.name).filter(Boolean))) as string[]
    setTeamSuggestions(memberNames)
    setFilteredTeam(memberNames)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Handle project input with suggestions
    if (name === 'project') {
      setShowProjectDropdown(true)
      if (value) {
        const filtered = projectSuggestions.filter((p) => p.toLowerCase().includes(value.toLowerCase()))
        setFilteredProjects(filtered.length > 0 ? filtered : [value])
      } else {
        setFilteredProjects(projectSuggestions)
      }
    }

    // Handle team input with suggestions
    if (name === 'assignedTo') {
      setShowTeamDropdown(true)
      if (value) {
        const filtered = teamSuggestions.filter((t) => t.toLowerCase().includes(value.toLowerCase()))
        setFilteredTeam(filtered.length > 0 ? filtered : [value])
      } else {
        setFilteredTeam(teamSuggestions)
      }
    }
  }

  const selectProject = (project: string) => {
    setFormData((prev) => ({
      ...prev,
      project,
    }))
    setShowProjectDropdown(false)
  }

  const selectTeam = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: member,
    }))
    setShowTeamDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim() || !formData.project.trim() || !formData.assignedTo.trim()) {
      alert('Please fill in all required fields')
      return
    }

    // Create new task object
    const newTask = {
      title: formData.title,
      description: formData.description,
      project: formData.project,
      assignedTo: formData.assignedTo,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate,
    }

    try {
      // Save to database via API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      })

      if (!response.ok) {
        throw new Error('Failed to save task to database')
      }

      // Also save to localStorage for backup
      const existingTasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')!) : []
      const updatedTasks = [...existingTasks, { id: Date.now().toString(), ...newTask, createdAt: new Date().toISOString().split('T')[0] }]
      localStorage.setItem('tasks', JSON.stringify(updatedTasks))

      // Success message
      alert('Task created successfully!')

      // Redirect back to tasks
      router.push('/tasks')
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task. Please try again.')
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="flex-1 overflow-y-auto">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tasks
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Create New Task</h1>
          </div>
          {/* Form */}
          <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Task Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                {/* Project */}
                <div className="relative">
                  <label htmlFor="project" className="block text-sm font-medium mb-2">
                    Project *
                  </label>
                  <Input
                    id="project"
                    name="project"
                    type="text"
                    placeholder="Type or select a project"
                    value={formData.project}
                    onChange={handleChange}
                    onFocus={() => setShowProjectDropdown(true)}
                    required
                    autoComplete="off"
                  />
                  {showProjectDropdown && filteredProjects.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-md">
                      {filteredProjects.map((project, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => selectProject(project)}
                        >
                          {project}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned To */}
                <div className="relative">
                  <label htmlFor="assignedTo" className="block text-sm font-medium mb-2">
                    Assign To *
                  </label>
                  <Input
                    id="assignedTo"
                    name="assignedTo"
                    type="text"
                    placeholder="Type or select a team member"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    onFocus={() => setShowTeamDropdown(true)}
                    required
                    autoComplete="off"
                  />
                  {showTeamDropdown && filteredTeam.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-md">
                      {filteredTeam.map((member, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => selectTeam(member)}
                        >
                          {member}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Task
                  </Button>
                  <Link href="/tasks" className="flex-1">
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
  )
}
