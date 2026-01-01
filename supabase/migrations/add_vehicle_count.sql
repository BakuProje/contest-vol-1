-- Add vehicle_count column to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS vehicle_count INTEGER DEFAULT 1;

-- Update existing records to have vehicle_count = 1
UPDATE registrations 
SET vehicle_count = 1
WHERE vehicle_count IS NULL;

-- Add constraint to ensure vehicle_count is between 1 and 4
ALTER TABLE registrations 
ADD CONSTRAINT vehicle_count_check 
CHECK (vehicle_count >= 1 AND vehicle_count <= 4);