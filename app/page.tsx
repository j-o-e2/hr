'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, Calendar, CheckSquare, Users, FileText, BarChart as BarChartIcon, Plus, Clock, LogIn, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks')
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          setTasks(tasksData)
        }

        // Fetch team members
        const membersResponse = await fetch('/api/team-members')
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          setTeamMembers(membersData)
        }

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0]
        const attendanceResponse = await fetch(`/api/attendance?date=${today}`)
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          setAttendanceRecords(attendanceData)
        }

        // Fetch unread notifications
        const notificationsResponse = await fetch('/api/notifications?read=false')
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData)
        }

        // Fetch leave requests
        const leaveResponse = await fetch('/api/leave-requests')
        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json()
          setLeaveRequests(leaveData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const totalEmployees = teamMembers.length
  const activeEmployees = teamMembers.filter((m) => m.status === 'active' || m.status === 'Active').length
  const newHires = teamMembers.filter((m) => {
    if (!m.hireDate) return false
    const hireDate = new Date(m.hireDate)
    const daysSince = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 30
  }).length
  const openPositions = tasks.filter((t) => t.status === 'todo' || t.status === 'todo').length
  const todaysAttendance = attendanceRecords.length
  const unreadNotifications = notifications.length

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  const recentActivities = tasks
    .slice()
    .sort((a, b) => (new Date(b.createdAt || '').getTime() || 0) - (new Date(a.createdAt || '').getTime() || 0))
    .slice(0, 5)
    .map((task) => ({
      action: task.status === 'completed' ? 'Task Completed' : 'Task Created',
      item: task.title || 'Untitled task',
      user: task.assignedTo || 'Unassigned',
      time: task.createdAt ? formatTimeAgo(task.createdAt) : 'just now',
    }))

  const performanceOverview = teamMembers.map((member) => {
    const memberTasks = tasks.filter((t) => t.assignedTo === member.name)
    const completed = memberTasks.filter((t) => t.status === 'completed').length
    const total = memberTasks.length
    const completion = total ? `${Math.round((completed / total) * 100)}%` : '-'

    return {
      name: member.name,
      completion,
      onTime: '-',
      quality: '-',
    }
  })

  const stats = [
    {
      label: 'Total Employees',
      value: `${totalEmployees}`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Active Employees',
      value: `${activeEmployees}`,
      icon: CheckSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'New Hires',
      value: `${newHires}`,
      icon: Plus,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Today\'s Attendance',
      value: `${todaysAttendance}`,
      icon: LogIn,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: 'Open Positions',
      value: `${openPositions}`,
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      label: 'Unread Notifications',
      value: `${unreadNotifications}`,
      icon: Bell,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
  ]

  const pendingLeaveRequests = leaveRequests.filter((t) => t.status === 'pending' || t.status === 'Pending').length

  const kpis = [
    { label: 'Employee Turnover Rate', value: '-', icon: BarChartIcon, color: 'text-red-500' },
    { label: 'Attendance Rate', value: '-', icon: LogIn, color: 'text-green-500' },
    { label: 'Pending Leave Requests', value: `${pendingLeaveRequests}`, icon: Calendar, color: 'text-blue-500' },
    { label: 'Performance Rating Avg', value: '-', icon: CheckSquare, color: 'text-purple-500' },
  ]

  const quickActions = [
    { label: 'New Task', href: '/tasks/new', icon: CheckSquare },
    { label: 'New Project', href: '/projects/new', icon: BarChart3 },
    { label: 'Track Time', href: '/time-tracking', icon: Clock },
    { label: 'Attendance', href: '/attendance', icon: LogIn },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your operations overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        <Icon className={`${stat.color} w-6 h-6`} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-3 md:py-4 flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 hover:bg-accent hover:text-accent-foreground bg-transparent text-xs md:text-sm"
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-center">{action.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Today's Attendance Details */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Today's Attendance</h2>
                <Link href="/attendance">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b border-border last:border-0 p-3 bg-muted rounded-lg hover:bg-muted/80">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{record.memberName || 'N/A'}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {record.checkIn ? <span className="mr-4">In: {record.checkIn}</span> : null}
                          {record.checkOut ? <span className="mr-4">Out: {record.checkOut}</span> : null}
                          {!record.checkIn && !record.checkOut && <span>No time recorded</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        {record.status === 'late' && (
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Late</span>
                        )}
                        {record.status === 'present' && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Present</span>
                        )}
                        {record.status === 'absent' && (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Absent</span>
                        )}
                        {record.status === 'half-day' && (
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Half Day</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance recorded yet for today.
                  </div>
                )}
              </div>
            </Card>

            {/* Performance KPIs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Performance KPIs</h2>
                <Link href="/reporting">
                  <Button variant="ghost" size="sm">
                    View Reports
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon
                  return (
                    <div key={kpi.label} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{kpi.label}</p>
                        <Icon className={`${kpi.color} w-5 h-5`} />
                      </div>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recent Activity Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-start justify-between pb-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.item}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No recent activity yet. Create tasks to see updates.
                  </div>
                )}
              </div>
            </Card>

            {/* Performance Overview */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChartIcon className="w-5 h-5" />
                Performance Overview
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Team performance metrics updated monthly. Click on a team member to see detailed analytics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceOverview.length > 0 ? (
                  performanceOverview.map((member) => (
                    <div key={member.name} className="p-4 bg-muted rounded-lg">
                      <p className="font-medium text-sm mb-3">{member.name}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-medium">{member.completion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">On-Time</span>
                          <span className="font-medium">{member.onTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality Score</span>
                          <span className="font-medium">{member.quality}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-3 text-center py-8 text-muted-foreground">
                    No performance data yet. Add team members and tasks to view performance insights.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
