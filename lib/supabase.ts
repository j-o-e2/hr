import { createClient } from '@supabase/supabase-js'

// Prefer server-side env vars when available, fall back to NEXT_PUBLIC_* for client builds
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://invalid.supabase.co'

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'anon-invalid'

// For server-side operations, use the service role key if provided (bypasses RLS policies).
// Keep this key secret and do NOT expose it to client-side code.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_...) to connect to your database.',
  )
}

const keyToUse = supabaseServiceRoleKey || supabaseAnonKey

export const supabase = createClient(supabaseUrl, keyToUse)

export type TeamMember = {
  id: string
  name: string
  email: string
  role?: string
  department?: string
  status: 'active' | 'inactive'
  hire_date?: string
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on_hold'
  start_date?: string
  end_date?: string
  owner_id?: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description?: string
  project_id?: string
  assigned_to?: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  start_date?: string
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  title: string
  content: string
  task_id?: string
  project_id?: string
  created_at: string
  updated_at: string
}

export type PerformanceMetrics = {
  id: string
  team_member_id: string
  month: string
  tasks_completed: number
  on_time_completion: number
  average_completion_time: number
  quality_score: number
  notes?: string
  created_at: string
  updated_at: string
}
