import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    const mapped = (data || []).map((task: any) => ({
      ...task,
      assignedTo: task.assigned_to_name ?? task.assigned_to,
      dueDate: task.due_date,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
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

    // Build insert payload. Some DB schemas may not have the optional `project` column.
    const insertPayload: Record<string, any> = {
      title: body.title,
      description: body.description,
      assigned_to_name: body.assignedTo,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      due_date: body.dueDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (body.project) {
      insertPayload.project = body.project
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      // Log full error detail for debugging
      console.error('Database error:', JSON.stringify(error, null, 2))

      // Retry without optional columns if the schema doesn't include them.
      const msg = typeof error?.message === 'string' ? error.message : ''
      const missingProjectColumn = msg.includes("Could not find the 'project' column")
      const missingAssignedToNameColumn = msg.includes("Could not find the 'assigned_to_name' column")

      if (missingProjectColumn && insertPayload.project) {
        delete insertPayload.project
      }

      if (missingAssignedToNameColumn && insertPayload.assigned_to_name) {
        delete insertPayload.assigned_to_name
      }

      if ((missingProjectColumn && missingAssignedToNameColumn) || missingProjectColumn || missingAssignedToNameColumn) {
        const retry = await supabase
          .from('tasks')
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

        // Return retry error for better debugging
        return NextResponse.json(
          { error: 'Failed to save task', details: retry.error?.message ?? retry.error },
          { status: 500 }
        )
      }

      // Return error info to the client to aid debugging
      return NextResponse.json(
        { error: 'Failed to save task', details: error?.message ?? error },
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
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to save task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
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
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
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
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}