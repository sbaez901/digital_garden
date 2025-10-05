-- Create the user_tasks table in Supabase
-- Run this SQL in your Supabase dashboard: SQL Editor

CREATE TABLE IF NOT EXISTS user_tasks (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tasks_id ON user_tasks(id);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only access their own data
CREATE POLICY "Users can only access their own tasks" ON user_tasks
  FOR ALL USING (auth.uid()::text = id);

-- Grant necessary permissions
GRANT ALL ON user_tasks TO authenticated;
GRANT ALL ON user_tasks TO anon;