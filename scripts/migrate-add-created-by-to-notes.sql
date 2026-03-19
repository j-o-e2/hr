-- Migration: Add created_by column to notes table to support RLS policies

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Optionally backfill created_by for existing rows (if you have a default user id):
-- UPDATE notes SET created_by = '<some-user-uuid>' WHERE created_by IS NULL;
