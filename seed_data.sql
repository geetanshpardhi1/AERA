-- Insert sample journal entries
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual User ID from Clerk/Supabase (e.g. 'user_2r...')
-- You can find this in the Users table or by checking the user object in your app console logs.

INSERT INTO public.journal_entries (user_id, title, content, mood, mood_emoji, mood_label, category, created_at)
VALUES 
(
  'YOUR_USER_ID_HERE', 
  'Morning Reflection', 
  'Woke up feeling energized today. The sun is shining and I am ready to tackle the big project at work. I had a healthy breakfast and did some meditation.', 
  5, 
  '😄', 
  'Great', 
  'morning',
  NOW() - INTERVAL '2 hours'
),
(
  'YOUR_USER_ID_HERE', 
  'Work Challenges', 
  'Had a tough meeting today. Felt a bit overwhelmed with the new deadlines, but I know I can handle it if I break it down into smaller tasks. Need to remember to breathe.', 
  2, 
  '😔', 
  'Bad', 
  'work',
  NOW() - INTERVAL '1 day'
),
(
  'YOUR_USER_ID_HERE', 
  'Evening Walk', 
  'Took a nice long walk in the park. It was very peaceful. Saw some cute dogs and just enjoyed the fresh air. It really helped to clear my mind after a busy day.', 
  4, 
  '🙂', 
  'Good', 
  'wellness',
  NOW() - INTERVAL '1 day 4 hours'
),
(
  'YOUR_USER_ID_HERE', 
  'Late Night Thoughts', 
  'Can''t sleep. Thinking about the future and what I want to achieve this year. I feel a mixture of excitement and anxiety. I should probably write down my goals tomorrow.', 
  3, 
  '😐', 
  'Neutral', 
  'personal',
  NOW() - INTERVAL '2 days'
),
(
  'YOUR_USER_ID_HERE', 
  'Productivity Win', 
  'Finally finished that feature I was stuck on! It felt so good to see it working. Celebrated with a nice cup of coffee.', 
  5, 
  '😄', 
  'Great', 
  'work',
  NOW() - INTERVAL '3 days'
);
