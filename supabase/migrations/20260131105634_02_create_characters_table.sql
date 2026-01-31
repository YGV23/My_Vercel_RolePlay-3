/*
  # Create Characters Table

  1. New Tables
    - `characters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `name` (text)
      - `tagline` (text)
      - `description` (text)
      - `appearance` (text)
      - `personality` (text)
      - `firstMessage` (text)
      - `chatExamples` (text)
      - `avatarUrl` (text)
      - `scenario` (text)
      - `jailbreak` (text)
      - `style` (text)
      - `eventSequence` (text)
      - `lorebooks` (jsonb - array of lorebook objects)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `characters` table
    - Add policy for users to read their own characters
    - Add policy for users to create characters
    - Add policy for users to update their own characters
    - Add policy for users to delete their own characters
*/

CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  appearance TEXT DEFAULT '',
  personality TEXT DEFAULT '',
  firstMessage TEXT DEFAULT '',
  chatExamples TEXT DEFAULT '',
  avatarUrl TEXT DEFAULT '',
  scenario TEXT DEFAULT '',
  jailbreak TEXT DEFAULT '',
  style TEXT DEFAULT '',
  eventSequence TEXT DEFAULT '',
  lorebooks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters"
  ON public.characters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create characters"
  ON public.characters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON public.characters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON public.characters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_characters_user_id ON public.characters(user_id);
