import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test if Supabase connection works
    const { data: notesTest, error: notesError } = await supabase
      .from('notes')
      .select('count', { count: 'exact', head: true })

    if (notesError) {
      console.error('Notes table error:', notesError)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to access notes table',
          error: notesError.message,
        },
        { status: 400 }
      )
    }

    const { data: attendanceTest, error: attendanceError } = await supabase
      .from('attendance')
      .select('count', { count: 'exact', head: true })

    if (attendanceError) {
      console.error('Attendance table error:', attendanceError)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to access attendance table',
          error: attendanceError.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      tables: {
        notes: 'accessible',
        attendance: 'accessible',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
