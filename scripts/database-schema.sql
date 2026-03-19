-- ============================================================
-- HR TASK TRACKING SYSTEM - DATABASE SCHEMA
-- ============================================================
-- This script creates all necessary tables for the HR task 
-- tracking and management system
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TEAM MEMBERS TABLE
-- ============================================================
-- Stores all employee/team member information
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(100),
  department VARCHAR(100),
  position VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, on_leave
  hire_date DATE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. PROJECTS TABLE
-- ============================================================
-- Stores project/department information
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, on_hold, cancelled
  start_date DATE,
  end_date DATE,
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  budget NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TASKS TABLE
-- ============================================================
-- Stores all tasks and assignments
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, completed, cancelled
  priority VARCHAR(50) DEFAULT 'medium', -- urgent, high, medium, low
  due_date DATE,
  start_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC(8, 2),
  actual_hours NUMERIC(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. NOTES TABLE
-- ============================================================
-- Stores notes, minutes, and documentation
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  related_project VARCHAR(255),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  note_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. ATTENDANCE TABLE
-- ============================================================
-- Tracks employee attendance records
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'present', -- present, absent, late, half_day, leave
  check_in_time TIME,
  check_out_time TIME,
  total_hours NUMERIC(5, 2),
  notes TEXT,
  attended BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_member_id, attendance_date)
);

-- ============================================================
-- 6. LEAVE REQUESTS TABLE
-- ============================================================
-- Manages employee leave/time-off requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- vacation, sick, personal, unpaid
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. TIME TRACKING TABLE
-- ============================================================
-- Tracks time spent on tasks
CREATE TABLE IF NOT EXISTS time_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  track_date DATE NOT NULL,
  hours_spent NUMERIC(8, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. TASK ATTACHMENTS TABLE
-- ============================================================
-- Stores file attachments for tasks
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. PERFORMANCE METRICS TABLE
-- ============================================================
-- Monthly performance tracking
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  metric_month DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_on_time INTEGER DEFAULT 0,
  on_time_completion_rate NUMERIC(5, 2),
  average_completion_time NUMERIC(8, 2),
  quality_score NUMERIC(3, 2), -- 1.00 to 5.00
  attendance_rate NUMERIC(5, 2), -- percentage
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_member_id, metric_month)
);

-- ============================================================
-- 10. PAYROLL TABLE
-- ============================================================
-- Employee payroll and compensation information
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  payroll_month DATE NOT NULL,
  base_salary NUMERIC(12, 2),
  bonuses NUMERIC(12, 2) DEFAULT 0,
  deductions NUMERIC(12, 2) DEFAULT 0,
  net_salary NUMERIC(12, 2),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processed, paid
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_member_id, payroll_month)
);

-- ============================================================
-- 11. NOTIFICATIONS TABLE
-- ============================================================
-- User notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- task_assigned, task_updated, deadline, etc
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. DEADLINES TABLE
-- ============================================================
-- Critical deadline tracking
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  deadline_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, on_track, at_risk, overdue, completed
  priority VARCHAR(50) DEFAULT 'medium', -- urgent, high, medium, low
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 13. TRAINING RECORDS TABLE
-- ============================================================
-- Employee training and development records
CREATE TABLE IF NOT EXISTS training_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  training_name VARCHAR(255) NOT NULL,
  provider VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, cancelled
  certification_received BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  cost NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. PERFORMANCE REVIEWS TABLE
-- ============================================================
-- Periodic performance appraisals
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  review_date DATE NOT NULL,
  rating NUMERIC(3, 2), -- 1.00 to 5.00
  comments TEXT,
  goals TEXT[],
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES - Optimize Query Performance
-- ============================================================

-- Team Members Indexes
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_department ON team_members(department);

-- Projects Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Tasks Indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Notes Indexes
CREATE INDEX idx_notes_task_id ON notes(task_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);

-- Attendance Indexes
CREATE INDEX idx_attendance_team_member ON attendance(team_member_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Leave Requests Indexes
CREATE INDEX idx_leave_requests_team_member ON leave_requests(team_member_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_date_range ON leave_requests(start_date, end_date);

-- Time Tracking Indexes
CREATE INDEX idx_time_tracking_task ON time_tracking(task_id);
CREATE INDEX idx_time_tracking_team_member ON time_tracking(team_member_id);
CREATE INDEX idx_time_tracking_date ON time_tracking(track_date);

-- Task Attachments Indexes
CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);

-- Performance Metrics Indexes
CREATE INDEX idx_performance_metrics_team_member ON performance_metrics(team_member_id);
CREATE INDEX idx_performance_metrics_month ON performance_metrics(metric_month);

-- Payroll Indexes
CREATE INDEX idx_payroll_team_member ON payroll(team_member_id);
CREATE INDEX idx_payroll_month ON payroll(payroll_month);
CREATE INDEX idx_payroll_status ON payroll(payment_status);

-- Notifications Indexes
CREATE INDEX idx_notifications_team_member ON notifications(team_member_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_task ON notifications(task_id);

-- Deadlines Indexes
CREATE INDEX idx_deadlines_date ON deadlines(deadline_date);
CREATE INDEX idx_deadlines_status ON deadlines(status);

-- Training Records Indexes
CREATE INDEX idx_training_records_team_member ON training_records(team_member_id);
CREATE INDEX idx_training_records_status ON training_records(status);

-- Performance Reviews Indexes
CREATE INDEX idx_performance_reviews_team_member ON performance_reviews(team_member_id);
CREATE INDEX idx_performance_reviews_date ON performance_reviews(review_date);

-- ============================================================
-- END OF DATABASE SCHEMA
-- ============================================================
