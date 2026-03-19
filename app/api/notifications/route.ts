import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamMemberId = searchParams.get('teamMemberId')
    const read = searchParams.get('read')

    let query = supabase
      .from('notifications')
      .select(`
        *,
        team_members!notifications_team_member_id_fkey (
          name,
          email
        ),
        tasks!notifications_task_id_fkey (
          title
        )
      `)
      .order('created_at', { ascending: false })

    if (teamMemberId) {
      query = query.eq('team_member_id', teamMemberId)
    }

    if (read !== null) {
      query = query.eq('read', read === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    // Transform data to camelCase for frontend
    const transformedData = data?.map(notification => ({
      id: notification.id,
      teamMemberId: notification.team_member_id,
      taskId: notification.task_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at,
      teamMember: notification.team_members ? {
        name: notification.team_members.name,
        email: notification.team_members.email
      } : null,
      task: notification.tasks ? {
        title: notification.tasks.title
      } : null
    })) || []

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in notifications GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { teamMemberId, taskId, type, title, message } = body

    if (!teamMemberId || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        team_member_id: teamMemberId,
        task_id: taskId || null,
        type: type || 'general',
        title,
        message,
        read: false
      })
      .select(`
        *,
        team_members!notifications_team_member_id_fkey (
          name,
          email
        ),
        tasks!notifications_task_id_fkey (
          title
        )
      `)
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // Transform data to camelCase for frontend
    const transformedData = {
      id: data.id,
      teamMemberId: data.team_member_id,
      taskId: data.task_id,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      teamMember: data.team_members ? {
        name: data.team_members.name,
        email: data.team_members.email
      } : null,
      task: data.tasks ? {
        title: data.tasks.title
      } : null
    }

    return NextResponse.json(transformedData, { status: 201 })
  } catch (error) {
    console.error('Error in notifications POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { read } = body

    const updateData: any = {}
    if (read !== undefined) {
      updateData.read = read
      updateData.updated_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        team_members!notifications_team_member_id_fkey (
          name,
          email
        ),
        tasks!notifications_task_id_fkey (
          title
        )
      `)
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    // Transform data to camelCase for frontend
    const transformedData = {
      id: data.id,
      teamMemberId: data.team_member_id,
      taskId: data.task_id,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      teamMember: data.team_members ? {
        name: data.team_members.name,
        email: data.team_members.email
      } : null,
      task: data.tasks ? {
        title: data.tasks.title
      } : null
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in notifications PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Error in notifications DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}