import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    const mapped = (data || []).map((note: any) => ({
      ...note,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      createdBy: note.created_by,
      relatedProject: note.related_project,
      taskId: note.task_id,
      projectId: note.project_id,
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
      title: body.title,
      content: body.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if provided
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      insertPayload.tags = body.tags
    }
    if (body.related_project) {
      insertPayload.related_project = body.related_project
    }
    if (body.date) {
      insertPayload.date = body.date
    }
    if (body.task_id) {
      insertPayload.task_id = body.task_id
    }
    if (body.project_id) {
      insertPayload.project_id = body.project_id
    }
    if (body.created_by) {
      insertPayload.created_by = body.created_by
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      // Log full error detail for debugging
      console.error('Database error:', JSON.stringify(error, null, 2))

      // Retry without optional columns if the schema doesn't include them
      const msg = typeof error?.message === 'string' ? error.message : ''
      const missingColumns = []

      if (msg.includes("Could not find the 'tags' column") && insertPayload.tags) {
        delete insertPayload.tags
        missingColumns.push('tags')
      }
      if (msg.includes("Could not find the 'related_project' column") && insertPayload.related_project) {
        delete insertPayload.related_project
        missingColumns.push('related_project')
      }
      if (msg.includes("Could not find the 'date' column") && insertPayload.date) {
        delete insertPayload.date
        missingColumns.push('date')
      }
      if (msg.includes("Could not find the 'task_id' column") && insertPayload.task_id) {
        delete insertPayload.task_id
        missingColumns.push('task_id')
      }
      if (msg.includes("Could not find the 'project_id' column") && insertPayload.project_id) {
        delete insertPayload.project_id
        missingColumns.push('project_id')
      }
      if (msg.includes("Could not find the 'created_by' column") && insertPayload.created_by) {
        delete insertPayload.created_by
        missingColumns.push('created_by')
      }

      if (missingColumns.length > 0) {
        const retry = await supabase
          .from('notes')
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
          { error: 'Failed to save note', details: retry.error?.message ?? retry.error },
          { status: 500 }
        )
      }

      // Check for RLS policy issues
      if (msg.includes('row-level security policy')) {
        return NextResponse.json(
          { error: 'Failed to save note', details: 'Permission denied. Please ensure Supabase service role is configured or RLS policies allow inserts.' },
          { status: 500 }
        )
      }

      // Return error info to the client to aid debugging
      return NextResponse.json(
        { error: 'Failed to save note', details: error?.message ?? error },
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
      { error: 'Failed to save note', details: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('notes')
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
        { error: 'Failed to update note' },
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
      { error: 'Failed to update note' },
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
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete note' },
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
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}


