'use client'

import { useState, useEffect } from 'react'
import { Download, TrendingUp, Users, CheckSquare, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function ReportingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [tasks, setTasks] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTasks = localStorage.getItem('tasks')
    const loadedTasks = savedTasks ? JSON.parse(savedTasks) : []
    setTasks(Array.isArray(loadedTasks) ? loadedTasks : [])

    const savedMembers = localStorage.getItem('teamMembers')
    const loadedMembers = savedMembers ? JSON.parse(savedMembers) : []
    setTeamMembers(Array.isArray(loadedMembers) ? loadedMembers : [])
  }, [])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
  const teamCount = teamMembers.length
  const hasData = totalTasks > 0 && teamCount > 0

  const teamPerformanceData = teamMembers.map((member) => {
    const memberTasks = tasks.filter((t: any) => t.assignedTo === member.name)
    const completed = memberTasks.filter((t: any) => t.status === 'completed').length
    const completionRate = memberTasks.length ? Math.round((completed / memberTasks.length) * 100) : 0
    return {
      name: member.name,
      completion: completionRate,
      onTime: 0,
      quality: 0,
    }
  })

  const monthlyTrendData: Array<any> = []
  const projectStatusData: Array<any> = []

  const stats = [
    {
      label: 'Total Tasks',
      value: `${totalTasks}`,
      change: '',
      trend: '',
      icon: CheckSquare,
    },
    {
      label: 'Completed Tasks',
      value: `${completedTasks}`,
      change: '',
      trend: '',
      icon: Users,
    },
    {
      label: 'Team Members',
      value: `${teamCount}`,
      change: '',
      trend: '',
      icon: Users,
    },
    {
      label: 'Avg Quality',
      value: '-',
      change: '',
      trend: '',
      icon: TrendingUp,
    },
  ]

  const performanceData = teamMembers.map((member) => {
    const memberTasks = tasks.filter((t: any) => t.assignedTo === member.name)
    const completed = memberTasks.filter((t: any) => t.status === 'completed').length
    const total = memberTasks.length
    const completionRate = total ? `${Math.round((completed / total) * 100)}%` : '-'

    return {
      name: member.name,
      tasksCompleted: completed,
      completionRate,
      onTimeRate: '-',
      avgQuality: '-',
      status: 'Active',
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
      case 'Good':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
      case 'Needs Improvement':
        return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
      default:
        return 'bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300'
    }
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
                <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
                <p className="text-muted-foreground">Track performance metrics and generate reports</p>
              </div>
              <Button className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold mb-2">{stat.value}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{stat.change} from last month</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {!hasData ? (
                <Card className="p-6 lg:col-span-2 text-center text-muted-foreground">
                  <h2 className="text-lg font-semibold mb-2">No analytics data yet</h2>
                  <p>Add team members and tasks to generate charts and performance insights.</p>
                </Card>
              ) : (
                <>
                  {/* Team Performance */}
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Team Performance Metrics</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: `1px solid var(--color-border)`,
                            borderRadius: '0.5rem',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="completion" fill="var(--color-chart-1)" />
                        <Bar dataKey="onTime" fill="var(--color-chart-2)" />
                        <Bar dataKey="quality" fill="var(--color-chart-3)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Project Status */}
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={projectStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Monthly Trends */}
                  <Card className="p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Task Completion Trends</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: `1px solid var(--color-border)`,
                            borderRadius: '0.5rem',
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="completed" stroke="var(--color-chart-1)" strokeWidth={2} />
                        <Line type="monotone" dataKey="pending" stroke="var(--color-chart-2)" strokeWidth={2} />
                        <Line type="monotone" dataKey="overdue" stroke="var(--color-chart-4)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
            </div>

            {/* Individual Performance Report */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Team Member Performance Report</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Tasks Completed</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Completion Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">On-Time Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Avg Quality</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No performance data available. Add team members and tasks to populate this report.
                        </td>
                      </tr>
                    ) : (
                      performanceData.map((member, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted transition-colors">
                          <td className="py-3 px-4 font-medium">{member.name}</td>
                          <td className="py-3 px-4 text-sm">{member.tasksCompleted}</td>
                          <td className="py-3 px-4 text-sm">{member.completionRate}</td>
                          <td className="py-3 px-4 text-sm">{member.onTimeRate}</td>
                          <td className="py-3 px-4 text-sm">{member.avgQuality}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
