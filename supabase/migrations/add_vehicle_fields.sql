-- Add new columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS plate_number TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing records with default values (optional)
UPDATE registrations 
SET 
  vehicle_type = COALESCE(vehicle_type, 'Not specified'),
  plate_number = COALESCE(plate_number, 'Not specified'), 
  category = COALESCE(category, 'Not specified')
WHERE vehicle_type IS NULL OR plate_number IS NULL OR category IS NULL;