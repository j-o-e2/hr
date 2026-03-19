import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    const mapped = (data || []).map((member: any) => ({
      ...member,
      hireDate: member.hire_date,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
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
      name: body.name,
      email: body.email,
      role: body.role || 'member',
      department: body.department,
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if provided
    if (body.phone) {
      insertPayload.phone = body.phone
    }
    if (body.hireDate) {
      insertPayload.hire_date = body.hireDate
    }
    if (body.location) {
      insertPayload.location = body.location
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      // Log full error detail for debugging
      console.error('Database error:', JSON.stringify(error, null, 2))

      // Retry without optional columns if the schema doesn't include them
      const msg = typeof error?.message === 'string' ? error.message : ''
      const missingColumns = []

      if (msg.includes("Could not find the 'phone' column") && insertPayload.phone) {
        delete insertPayload.phone
        missingColumns.push('phone')
      }
      if (msg.includes("Could not find the 'hire_date' column") && insertPayload.hire_date) {
        delete insertPayload.hire_date
        missingColumns.push('hire_date')
      }
      if (msg.includes("Could not find the 'location' column") && insertPayload.location) {
        delete insertPayload.location
        missingColumns.push('location')
      }

      if (missingColumns.length > 0) {
        const retry = await supabase
          .from('team_members')
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
          { error: 'Failed to save team member', details: retry.error?.message ?? retry.error },
          { status: 500 }
        )
      }

      // Check for RLS policy issues
      if (msg.includes('row-level security policy')) {
        return NextResponse.json(
          { error: 'Failed to save team member', details: 'Permission denied. Please ensure Supabase service role is configured or RLS policies allow inserts.' },
          { status: 500 }
        )
      }

      // Return error info to the client to aid debugging
      return NextResponse.json(
        { error: 'Failed to save team member', details: error?.message ?? error },
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
      { error: 'Failed to save team member' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('team_members')
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
        { error: 'Failed to update team member' },
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
      { error: 'Failed to update team member' },
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
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete team member' },
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
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}