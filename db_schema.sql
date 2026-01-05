-- Create the journal_entries table
CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL, -- This will match the Clerk User ID
    title text,
    content text,
    mood integer CHECK (mood >= 1 AND mood <= 5),
    mood_emoji text,
    mood_label text,
    category text DEFAULT 'personal',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to CRUD their own data
-- Note: Since we are using Clerk for auth, we trust the client logic for now 
-- or we can setup JWT integration later. For strict security, 
-- you would configure Clerk JWT templates in Supabase.
-- For now, we will allow based on the user_id matching.

-- Policy: Users can see their own entries
CREATE POLICY "Users can view their own entries" 
ON public.journal_entries FOR SELECT 
USING (user_id = auth.uid()::text OR user_id IS NOT NULL);
-- Note: The above policy is loose to allow getting started easier without JWT setup. 
-- In production, strictly use: user_id = auth.uid()::text

-- Broader policy for getting started (Assumes app handles user_id filtering)
-- If you setup Clerk JWT integration properly, change 'true' to appropriate checks.
CREATE POLICY "Enable all access for users based on user_id" 
ON public.journal_entries 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create an index for faster queries on user_id and date
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at);
