import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    let query = supabase
      .from('attendance')
      .select(`
        *,
        team_members!inner(name)
      `)

    if (date) {
      // Try attendance_date first, fall back to date if needed
      query = query.eq('attendance_date', date)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      // If attendance_date doesn't exist, try the date column
      if (error.message?.includes('attendance_date')) {
        console.log('Retrying with date column')
        let retryQuery = supabase
          .from('attendance')
          .select(`
            *,
            team_members!inner(name)
          `)
        
        if (date) {
          retryQuery = retryQuery.eq('date', date)
        }
        
        const { data: retryData, error: retryError } = await retryQuery.order('created_at', { ascending: false })
        
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 400 })
        }

        // Map snake_case from database to camelCase for frontend
        const mapped = (retryData || []).map((record: any) => ({
          id: record.id,
          memberName: record.team_members?.name || record.memberName,
          date: record.date,
          status: record.status,
          checkIn: record.check_in_time,
          checkOut: record.check_out_time,
          notes: record.notes,
          attended: record.attended,
        }))

        return NextResponse.json(mapped)
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map snake_case from database to camelCase for frontend
    const mapped = (data || []).map((record: any) => ({
      id: record.id,
      memberName: record.team_members?.name || record.memberName,
      date: record.attendance_date || record.date,
      status: record.status,
      checkIn: record.check_in_time,
      checkOut: record.check_out_time,
      notes: record.notes,
      attended: record.attended,
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
    console.log('Saving attendance:', body)

    // Transform the data to match database structure
    const attendanceData = {
      member_name: body.memberName,
      attendance_date: body.date,
      status: body.status,
      check_in_time: body.checkIn,
      check_out_time: body.checkOut,
      notes: body.notes,
      attended: body.attended,
    }

    let result = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()

    // If attendance_date doesn't exist, try with date column
    if (result.error && result.error.message?.includes('attendance_date')) {
      console.log('Retrying POST with date column')
      const fallbackData = {
        member_name: body.memberName,
        date: body.date,
        status: body.status,
        check_in_time: body.checkIn,
        check_out_time: body.checkOut,
        notes: body.notes,
        attended: body.attended,
      }
      result = await supabase
        .from('attendance')
        .insert([fallbackData])
        .select()
    }

    const { data, error } = result

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map response to camelCase
    const record = data[0]
    const mapped = {
      id: record.id,
      memberName: record.member_name || body.memberName,
      date: record.attendance_date || record.date,
      status: record.status,
      checkIn: record.check_in_time,
      checkOut: record.check_out_time,
      notes: record.notes,
      attended: record.attended,
    }

    return NextResponse.json(mapped, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    // Map camelCase to snake_case
    const dbUpdateData: Record<string, any> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'memberName') {
        dbUpdateData['team_member_id'] = value
      } else if (key === 'checkIn') {
        dbUpdateData['check_in_time'] = value
      } else if (key === 'checkOut') {
        dbUpdateData['check_out_time'] = value
      } else if (key === 'date') {
        // Try attendance_date first
        dbUpdateData['attendance_date'] = value
      } else {
        dbUpdateData[key] = value
      }
    }

    let result = await supabase
      .from('attendance')
      .update(dbUpdateData)
      .eq('id', id)
      .select()

    // If attendance_date doesn't exist, retry with date column
    if (result.error && result.error.message?.includes('attendance_date')) {
      console.log('Retrying PUT with date column')
      const fallbackData = { ...dbUpdateData }
      if ('attendance_date' in fallbackData) {
        fallbackData['date'] = fallbackData['attendance_date']
        delete fallbackData['attendance_date']
      }
      result = await supabase
        .from('attendance')
        .update(fallbackData)
        .eq('id', id)
        .select()
    }

    const { data, error } = result

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map response to camelCase
    const record = data[0]
    const mapped = {
      id: record.id,
      memberName: record.team_member_id,
      date: record.attendance_date || record.date,
      status: record.status,
      checkIn: record.check_in_time,
      checkOut: record.check_out_time,
      notes: record.notes,
      attended: record.attended,
    }

    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
