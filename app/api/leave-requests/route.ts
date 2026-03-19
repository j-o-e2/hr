import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leave requests' },
        { status: 500 }
      )
    }

    const mapped = (data || []).map((request: any) => ({
      ...request,
      employee: request.employee,
      leaveType: request.leave_type,
      startDate: request.start_date,
      endDate: request.end_date,
      totalDays: request.total_days,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      approvedBy: request.approved_by,
      approvedDate: request.approved_date,
      status: request.status ? request.status.toLowerCase() : 'pending', // Normalize status to lowercase
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Build insert payload. Some DB schemas may not have optional columns.
    const insertPayload: Record<string, any> = {
      leave_type: body.leaveType,
      start_date: body.startDate,
      end_date: body.endDate,
      total_days: body.days || body.totalDays,
      status: body.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if provided
    if (body.reason) {
      insertPayload.reason = body.reason
    }
    if (body.approvedBy) {
      insertPayload.approved_by = body.approvedBy
    }
    if (body.approvedDate) {
      insertPayload.approved_date = body.approvedDate
    }
    // For now, store employee name as a string. In a real app, this would be a team_member_id
    if (body.employee) {
      insertPayload.employee = body.employee
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      // Log full error detail for debugging
      console.error('Database error:', JSON.stringify(error, null, 2))

      // Retry without optional columns if the schema doesn't include them
      const msg = typeof error?.message === 'string' ? error.message : ''
      const missingColumns = []

      if (msg.includes("Could not find the 'reason' column") && insertPayload.reason) {
        delete insertPayload.reason
        missingColumns.push('reason')
      }
      if (msg.includes("Could not find the 'approved_by' column") && insertPayload.approved_by) {
        delete insertPayload.approved_by
        missingColumns.push('approved_by')
      }
      if (msg.includes("Could not find the 'approved_date' column") && insertPayload.approved_date) {
        delete insertPayload.approved_date
        missingColumns.push('approved_date')
      }

      if (missingColumns.length > 0) {
        const retry = await supabase
          .from('leave_requests')
          .insert([insertPayload])
          .select()
          .single()

        if (!retry.error) {
          return NextResponse.json(
            {
              success: true,
              data: retry.data,
            },
            { status: 201 }
          )
        }

        console.error('Retry without missing columns failed:', JSON.stringify(retry.error, null, 2))

        return NextResponse.json(
          { error: 'Failed to save leave request', details: retry.error?.message ?? retry.error },
          { status: 500 }
        )
      }

      // Check for RLS policy issues
      if (msg.includes('row-level security policy')) {
        return NextResponse.json(
          { error: 'Failed to save leave request', details: 'Permission denied. Please ensure Supabase service role is configured or RLS policies allow inserts.' },
          { status: 500 }
        )
      }

      // Return error info to the client to aid debugging
      return NextResponse.json(
        { error: 'Failed to save leave request', details: error?.message ?? error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: data
      },
      { status: 201 }
    )

    // Create notification for leave request submission
    try {
      // Find team members who should be notified (managers/admins)
      // For now, we'll create a notification for all team members, but in a real app
      // you'd filter for managers or HR personnel
      const { data: teamMembersData } = await supabase
        .from('team_members')
        .select('id, name')
        .limit(10) // Limit to prevent too many notifications

      const teamMembers = teamMembersData || []

      if (teamMembers.length > 0) {
        const notifications = teamMembers.map(member => ({
          team_member_id: member.id,
          type: 'leave_request',
          title: 'New Leave Request Submitted',
          message: `${data.employee || 'An employee'} has submitted a ${data.leave_type} request for ${data.total_days} days starting ${data.start_date}`,
          read: false
        }))

        await supabase
          .from('notifications')
          .insert(notifications)
      }
    } catch (notificationError) {
      // Don't fail the request if notification creation fails
      console.error('Failed to create notification:', notificationError)
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to save leave request', details: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    console.log('PUT request body:', body)
    console.log('Updates:', updates)

    // Use service role key to bypass RLS for now
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, try to get the current record to check permissions
    const { data: currentRecord, error: fetchError } = await supabaseAdmin
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Leave request not found', details: fetchError.message },
        { status: 404 }
      )
    }

    console.log('Current record:', currentRecord)

    // Map camelCase from client to snake_case for database
    const dbUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'approvedBy') {
        dbUpdates['approved_by'] = value
      } else if (key === 'approvedDate') {
        dbUpdates['approved_date'] = value
      } else if (key === 'leaveType') {
        dbUpdates['leave_type'] = value
      } else if (key === 'startDate') {
        dbUpdates['start_date'] = value
      } else if (key === 'endDate') {
        dbUpdates['end_date'] = value
      } else if (key === 'totalDays') {
        dbUpdates['total_days'] = value
      } else {
        dbUpdates[key] = value
      }
    }

    console.log('DB Updates to apply:', dbUpdates)

    // Update the record using admin client
    const { data, error } = await supabaseAdmin
      .from('leave_requests')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', JSON.stringify(error, null, 2))
      console.error('Attempted updates:', dbUpdates)
      return NextResponse.json(
        { error: 'Failed to update leave request', details: error.message || JSON.stringify(error) },
        { status: 500 }
      )
    }

    console.log('Updated leave request:', data)

    return NextResponse.json(
      {
        success: true,
        data: data
      },
      { status: 200 }
    )

    // Create notification for leave request status change
    try {
      if (updates.status && updates.status !== 'pending') {
        // Find the team member who made the request
        // Since we don't have team_member_id in leave_requests yet, we'll skip this for now
        // In a real implementation, you'd look up the team member by name or add team_member_id to leave_requests
        console.log(`Leave request ${id} status changed to ${updates.status}`)
      }
    } catch (notificationError) {
      // Don't fail the request if notification creation fails
      console.error('Failed to create status change notification:', notificationError)
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update leave request' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Leave request ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete leave request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete leave request' },
      { status: 500 }
    )
  }
}
