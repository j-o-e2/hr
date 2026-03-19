import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const teamMemberId = searchParams.get('teamMemberId')

    if (!type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 })
    }

    let reportData: any = {}

    switch (type) {
      case 'tasks':
        reportData = await generateTasksReport(supabase, startDate, endDate, teamMemberId)
        break
      case 'leave':
        reportData = await generateLeaveReport(supabase, startDate, endDate)
        break
      case 'attendance':
        reportData = await generateAttendanceReport(supabase, startDate, endDate, teamMemberId)
        break
      case 'performance':
        reportData = await generatePerformanceReport(supabase, startDate, endDate, teamMemberId)
        break
      case 'overview':
        reportData = await generateOverviewReport(supabase, startDate, endDate)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

async function generateTasksReport(supabase: any, startDate?: string | null, endDate?: string | null, teamMemberId?: string | null) {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      team_members!tasks_assigned_to_fkey (
        name,
        email
      ),
      projects (
        name
      )
    `)

  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  if (teamMemberId) {
    query = query.eq('assigned_to', teamMemberId)
  }

  const { data: tasks, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  const stats = {
    total: tasks?.length || 0,
    completed: tasks?.filter((t: any) => t.status === 'completed').length || 0,
    inProgress: tasks?.filter((t: any) => t.status === 'in_progress').length || 0,
    todo: tasks?.filter((t: any) => t.status === 'todo').length || 0,
    overdue: tasks?.filter((t: any) => {
      if (!t.due_date) return false
      return new Date(t.due_date) < new Date() && t.status !== 'completed'
    }).length || 0
  }

  return {
    type: 'tasks',
    stats,
    data: tasks?.map((task: any) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assignedTo: task.team_members?.name,
      project: task.projects?.name,
      createdAt: task.created_at
    })) || []
  }
}

async function generateLeaveReport(supabase: any, startDate?: string | null, endDate?: string | null) {
  let query = supabase
    .from('leave_requests')
    .select('*')

  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data: leaveRequests, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  const stats = {
    total: leaveRequests?.length || 0,
    pending: leaveRequests?.filter((l: any) => l.status === 'pending').length || 0,
    approved: leaveRequests?.filter((l: any) => l.status === 'approved').length || 0,
    rejected: leaveRequests?.filter((l: any) => l.status === 'rejected').length || 0,
    totalDays: leaveRequests?.filter((l: any) => l.status === 'approved')
      .reduce((sum: number, l: any) => sum + (l.total_days || 0), 0) || 0
  }

  return {
    type: 'leave',
    stats,
    data: leaveRequests?.map((leave: any) => ({
      id: leave.id,
      employee: leave.employee,
      leaveType: leave.leave_type,
      startDate: leave.start_date,
      endDate: leave.end_date,
      totalDays: leave.total_days,
      status: leave.status,
      createdAt: leave.created_at
    })) || []
  }
}

async function generateAttendanceReport(supabase: any, startDate?: string | null, endDate?: string | null, teamMemberId?: string | null) {
  let query = supabase
    .from('attendance')
    .select(`
      *,
      team_members!attendance_team_member_id_fkey (
        name,
        email
      )
    `)

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }
  if (teamMemberId) {
    query = query.eq('team_member_id', teamMemberId)
  }

  const { data: attendance, error } = await query.order('date', { ascending: false })

  if (error) throw error

  const stats = {
    total: attendance?.length || 0,
    present: attendance?.filter((a: any) => a.status === 'present').length || 0,
    absent: attendance?.filter((a: any) => a.status === 'absent').length || 0,
    late: attendance?.filter((a: any) => a.status === 'late').length || 0,
    attendanceRate: attendance?.length ?
      ((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100).toFixed(1) : '0'
  }

  return {
    type: 'attendance',
    stats,
    data: attendance?.map((record: any) => ({
      id: record.id,
      employee: record.team_members?.name,
      date: record.date,
      status: record.status,
      checkInTime: record.check_in_time,
      checkOutTime: record.check_out_time,
      notes: record.notes
    })) || []
  }
}

async function generatePerformanceReport(supabase: any, startDate?: string | null, endDate?: string | null, teamMemberId?: string | null) {
  let query = supabase
    .from('performance_kpis')
    .select(`
      *,
      team_members!performance_kpis_team_member_id_fkey (
        name,
        email
      )
    `)

  if (startDate) {
    query = query.gte('month', startDate)
  }
  if (endDate) {
    query = query.lte('month', endDate)
  }
  if (teamMemberId) {
    query = query.eq('team_member_id', teamMemberId)
  }

  const { data: kpis, error } = await query.order('month', { ascending: false })

  if (error) throw error

  const stats = {
    total: kpis?.length || 0,
    avgTasksCompleted: kpis?.length ?
      (kpis.reduce((sum: number, k: any) => sum + (k.tasks_completed || 0), 0) / kpis.length).toFixed(1) : '0',
    avgOnTimeCompletion: kpis?.length ?
      (kpis.reduce((sum: number, k: any) => sum + (k.on_time_completion_rate || 0), 0) / kpis.length).toFixed(1) : '0',
    avgQualityScore: kpis?.length ?
      (kpis.reduce((sum: number, k: any) => sum + (k.quality_score || 0), 0) / kpis.length).toFixed(1) : '0'
  }

  return {
    type: 'performance',
    stats,
    data: kpis?.map((kpi: any) => ({
      id: kpi.id,
      employee: kpi.team_members?.name,
      month: kpi.month,
      tasksCompleted: kpi.tasks_completed,
      onTimeCompletionRate: kpi.on_time_completion_rate,
      qualityScore: kpi.quality_score,
      attendanceRate: kpi.attendance_rate,
      productivityScore: kpi.productivity_score
    })) || []
  }
}

async function generateOverviewReport(supabase: any, startDate?: string | null, endDate?: string | null) {
  // Get all data for overview
  const [tasksResult, leaveResult, attendanceResult, teamResult] = await Promise.all([
    generateTasksReport(supabase, startDate, endDate, null),
    generateLeaveReport(supabase, startDate, endDate),
    generateAttendanceReport(supabase, startDate, endDate, null),
    supabase.from('team_members').select('id, name, status').eq('status', 'active')
  ])

  const { data: teamMembers } = teamResult

  return {
    type: 'overview',
    period: { startDate, endDate },
    summary: {
      totalEmployees: teamMembers?.length || 0,
      totalTasks: tasksResult.stats.total,
      completedTasks: tasksResult.stats.completed,
      pendingLeaveRequests: leaveResult.stats.pending,
      attendanceRate: attendanceResult.stats.attendanceRate,
      taskCompletionRate: tasksResult.stats.total ?
        ((tasksResult.stats.completed / tasksResult.stats.total) * 100).toFixed(1) : '0'
    },
    details: {
      tasks: tasksResult,
      leave: leaveResult,
      attendance: attendanceResult
    }
  }
}