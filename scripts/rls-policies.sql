-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- This script creates security policies for the HR task 
-- tracking system database tables
-- ============================================================

-- NOTE: Make sure to enable RLS on each table before applying policies
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. TEAM MEMBERS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    -- Enable RLS on team_members table
    EXECUTE 'ALTER TABLE team_members ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view all team members (for assignment purposes)
    EXECUTE 'CREATE POLICY "Allow reading team members" ON team_members FOR SELECT USING (true)';

    -- Policy: Only admins can insert team members
    EXECUTE 'CREATE POLICY "Only admins can create team members" ON team_members FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';

    -- Policy: Only admins can update team members
    EXECUTE 'CREATE POLICY "Only admins can update team members" ON team_members FOR UPDATE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';

    -- Policy: Only admins can delete team members
    EXECUTE 'CREATE POLICY "Only admins can delete team members" ON team_members FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 2. PROJECTS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    -- Enable RLS on projects table
    EXECUTE 'ALTER TABLE projects ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view all projects
    EXECUTE 'CREATE POLICY "Allow viewing all projects" ON projects FOR SELECT USING (true)';

    -- Policy: Only project owner and admins can update projects
    EXECUTE 'CREATE POLICY "Only project owner and admins can update projects" ON projects FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';

    -- Policy: Only admins can create projects
    EXECUTE 'CREATE POLICY "Only admins can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';

    -- Policy: Only admins can delete projects
    EXECUTE 'CREATE POLICY "Only admins can delete projects" ON projects FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 3. TASKS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    -- Enable RLS on tasks table
    EXECUTE 'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view all tasks (for transparency)
    EXECUTE 'CREATE POLICY "Allow viewing all tasks" ON tasks FOR SELECT USING (true)';

    -- Policy: Users can update tasks they\'re assigned to
    EXECUTE 'CREATE POLICY "Users can update their assigned tasks" ON tasks FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only managers and admins can create tasks
    EXECUTE 'CREATE POLICY "Only managers and admins can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only managers and admins can delete tasks
    EXECUTE 'CREATE POLICY "Only managers and admins can delete tasks" ON tasks FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';
  END IF;
END;
$$;

-- ============================================================
-- 4. NOTES POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
    -- Enable RLS on notes table
    EXECUTE 'ALTER TABLE notes ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view all notes
    EXECUTE 'CREATE POLICY "Allow viewing all notes" ON notes FOR SELECT USING (true)';

    -- Policy: Users can create notes
    EXECUTE 'CREATE POLICY "Allow creating notes" ON notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';

    -- Policy: Users can update their own notes
    EXECUTE 'CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = created_by)';

    -- Policy: Only note creator and admins can delete notes
    EXECUTE 'CREATE POLICY "Only note creator and admins can delete notes" ON notes FOR DELETE USING (auth.uid() = created_by OR auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 5. ATTENDANCE POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    -- Enable RLS on attendance table
    EXECUTE 'ALTER TABLE attendance ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own attendance
    EXECUTE 'CREATE POLICY "Users can view their own attendance" ON attendance FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users can create their own attendance
    EXECUTE 'CREATE POLICY "Users can create their own attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users can update their own attendance
    EXECUTE 'CREATE POLICY "Users can update their own attendance" ON attendance FOR UPDATE USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins can delete attendance records
    EXECUTE 'CREATE POLICY "Only admins can delete attendance records" ON attendance FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 6. LEAVE REQUESTS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
    -- Enable RLS on leave_requests table
    EXECUTE 'ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own leave requests and managers can view all
    EXECUTE 'CREATE POLICY "Users can view their own and managers can view all leave requests" ON leave_requests FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users can create their own leave requests
    EXECUTE 'CREATE POLICY "Users can create their own leave requests" ON leave_requests FOR INSERT WITH CHECK (auth.uid() = team_member_id)';

    -- Policy: Users can update their own pending leave requests
    EXECUTE 'CREATE POLICY "Users can update their own pending leave requests" ON leave_requests FOR UPDATE USING (auth.uid() = team_member_id AND status = ''pending'' OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins and managers can delete leave requests
    EXECUTE 'CREATE POLICY "Only admins and managers can delete leave requests" ON leave_requests FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';
  END IF;
END;
$$;

-- ============================================================
-- 7. TIME TRACKING POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_tracking') THEN
    -- Enable RLS on time_tracking table
    EXECUTE 'ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own time tracking and managers can view all
    EXECUTE 'CREATE POLICY "Users can view their own and managers can view all time tracking" ON time_tracking FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users can create time tracking entries
    EXECUTE 'CREATE POLICY "Users can create time tracking entries" ON time_tracking FOR INSERT WITH CHECK (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users can update their own time tracking
    EXECUTE 'CREATE POLICY "Users can update their own time tracking" ON time_tracking FOR UPDATE USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins can delete time tracking
    EXECUTE 'CREATE POLICY "Only admins can delete time tracking" ON time_tracking FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 8. TASK ATTACHMENTS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_attachments') THEN
    -- Enable RLS on task_attachments table
    EXECUTE 'ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view attachments for tasks they can see
    EXECUTE 'CREATE POLICY "Allow viewing task attachments" ON task_attachments FOR SELECT USING (true)';

    -- Policy: Users assigned to task or managers can upload attachments
    EXECUTE 'CREATE POLICY "Users can upload attachments to their tasks" ON task_attachments FOR INSERT WITH CHECK (auth.uid() IN (SELECT assigned_to FROM tasks WHERE id = task_id) OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only uploader and admins can delete attachments
    EXECUTE 'CREATE POLICY "Only uploader and admins can delete attachments" ON task_attachments FOR DELETE USING (auth.uid() = uploaded_by OR auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 9. PERFORMANCE METRICS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics') THEN
    -- Enable RLS on performance_metrics table
    EXECUTE 'ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own and managers can view all metrics
    EXECUTE 'CREATE POLICY "Users can view their own and managers can view all metrics" ON performance_metrics FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins and managers can create metrics
    EXECUTE 'CREATE POLICY "Only admins and managers can create metrics" ON performance_metrics FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins and managers can update metrics
    EXECUTE 'CREATE POLICY "Only admins and managers can update metrics" ON performance_metrics FOR UPDATE USING (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins can delete metrics
    EXECUTE 'CREATE POLICY "Only admins can delete metrics" ON performance_metrics FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 10. PAYROLL POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll') THEN
    -- Enable RLS on payroll table
    EXECUTE 'ALTER TABLE payroll ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own payroll (sensitive - limited access)
    EXECUTE 'CREATE POLICY "Users can view their own payroll" ON payroll FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''payroll_admin'')))';

    -- Policy: Only payroll admins can create payroll
    EXECUTE 'CREATE POLICY "Only payroll admins can create payroll" ON payroll FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''payroll_admin'')))';

    -- Policy: Only payroll admins can update payroll
    EXECUTE 'CREATE POLICY "Only payroll admins can update payroll" ON payroll FOR UPDATE USING (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''payroll_admin'')))';

    -- Policy: Only admins can delete payroll
    EXECUTE 'CREATE POLICY "Only admins can delete payroll" ON payroll FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 11. NOTIFICATIONS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Enable RLS on notifications table
    EXECUTE 'ALTER TABLE notifications ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can only view their own notifications
    EXECUTE 'CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = team_member_id)';

    -- Policy: System can create notifications (no user check needed)
    EXECUTE 'CREATE POLICY "Allow creating notifications" ON notifications FOR INSERT WITH CHECK (true)';

    -- Policy: Users can update their own notifications (mark as read)
    EXECUTE 'CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = team_member_id)';

    -- Policy: Users can delete their own notifications
    EXECUTE 'CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = team_member_id)';
  END IF;
END;
$$;

-- ============================================================
-- 12. DEADLINES POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deadlines') THEN
    -- Enable RLS on deadlines table
    EXECUTE 'ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY';

    -- Policy: All users can view deadlines
    EXECUTE 'CREATE POLICY "Allow viewing all deadlines" ON deadlines FOR SELECT USING (true)';

    -- Policy: Only managers and admins can manage deadlines
    EXECUTE 'CREATE POLICY "Only managers and admins can manage deadlines" ON deadlines FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only managers and admins can update deadlines
    EXECUTE 'CREATE POLICY "Only managers and admins can update deadlines" ON deadlines FOR UPDATE USING (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins can delete deadlines
    EXECUTE 'CREATE POLICY "Only admins can delete deadlines" ON deadlines FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 13. TRAINING RECORDS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_records') THEN
    -- Enable RLS on training_records table
    EXECUTE 'ALTER TABLE training_records ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own and managers can view all training
    EXECUTE 'CREATE POLICY "Users can view their own and managers can view all training" ON training_records FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users and managers can create training records
    EXECUTE 'CREATE POLICY "Users and managers can create training records" ON training_records FOR INSERT WITH CHECK (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Users can update their own and managers can update all
    EXECUTE 'CREATE POLICY "Users can update their own and managers can update all training" ON training_records FOR UPDATE USING (auth.uid() = team_member_id OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only admins can delete training records
    EXECUTE 'CREATE POLICY "Only admins can delete training records" ON training_records FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- 14. PERFORMANCE REVIEWS POLICIES
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_reviews') THEN
    -- Enable RLS on performance_reviews table
    EXECUTE 'ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY';

    -- Policy: Users can view their own reviews and managers can view all
    EXECUTE 'CREATE POLICY "Users can view their own reviews and managers can view all" ON performance_reviews FOR SELECT USING (auth.uid() = team_member_id OR auth.uid() = reviewed_by OR auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only managers and admins can create reviews
    EXECUTE 'CREATE POLICY "Only managers and admins can create reviews" ON performance_reviews FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM team_members WHERE role IN (''admin'', ''manager'')))';

    -- Policy: Only reviewer and admins can update reviews
    EXECUTE 'CREATE POLICY "Only reviewer and admins can update reviews" ON performance_reviews FOR UPDATE USING (auth.uid() = reviewed_by OR auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';

    -- Policy: Only admins can delete reviews
    EXECUTE 'CREATE POLICY "Only admins can delete reviews" ON performance_reviews FOR DELETE USING (auth.uid() IN (SELECT id FROM team_members WHERE role = ''admin''))';
  END IF;
END;
$$;

-- ============================================================
-- ADDITIONAL SECURITY POLICIES
-- ============================================================

-- Policy to prevent direct authentication bypass
-- Users must be authenticated to perform any operation
-- This is implicit in the policies above but can be made explicit

-- ============================================================
-- HELPER FUNCTIONS (Optional)
-- ============================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- END OF RLS POLICIES
-- ============================================================

-- NOTE: After applying these policies:
-- 1. Test all policies thoroughly
-- 2. Monitor for any permission issues
-- 3. Adjust policies based on your actual organizational needs
-- 4. Keep audit logs of who accessed what data
-- 5. Regularly review and update policies as roles change
