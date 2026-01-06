-- Add support for multiple category selection
-- Solution: Add a new column to store selected categories as an array

-- Add new column for storing multiple categories
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS selected_categories TEXT[];

-- Update existing records to populate selected_categories from category
-- Split comma-separated categories if they exist
UPDATE public.registrations 
SET selected_categories = string_to_array(category, ', ')
WHERE selected_categories IS NULL AND category IS NOT NULL;

-- For records with no category, set empty array
UPDATE public.registrations 
SET selected_categories = ARRAY[]::TEXT[]
WHERE selected_categories IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_selected_categories 
ON public.registrations USING GIN (selected_categories);

-- Add comment to explain the column
COMMENT ON COLUMN public.registrations.selected_categories IS 
'Array of selected categories: user can select 1-3 categories';
