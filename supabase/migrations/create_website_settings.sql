-- Create website_settings table
CREATE TABLE IF NOT EXISTS website_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  reason TEXT,
  description TEXT,
  reopen_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default record
INSERT INTO website_settings (id, status) VALUES (1, 'open') ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read website settings" ON website_settings
  FOR SELECT USING (true);

-- Create policy for admin write access
CREATE POLICY "Admin users can update website settings" ON website_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );