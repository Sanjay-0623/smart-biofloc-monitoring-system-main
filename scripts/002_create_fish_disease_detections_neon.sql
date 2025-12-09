-- Updated for Neon - removed auth.users references and RLS policies
-- Create fish disease detections table
CREATE TABLE IF NOT EXISTS public.fish_disease_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  description TEXT,
  treatment_suggestions TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS fish_disease_detections_user_id_idx ON public.fish_disease_detections(user_id);
CREATE INDEX IF NOT EXISTS fish_disease_detections_detected_at_idx ON public.fish_disease_detections(detected_at DESC);
