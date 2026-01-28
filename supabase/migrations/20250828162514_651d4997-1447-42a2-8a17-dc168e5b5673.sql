-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner uuid NOT NULL,
  title text,
  language text,
  code text,
  explanation text,
  mermaid_diagram text,
  trace_table jsonb,
  diagram_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid REFERENCES snippets(id) ON DELETE CASCADE,
  question text,
  choices jsonb,
  answer text,
  hint text,
  difficulty text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on snippets
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- RLS policies for snippets
CREATE POLICY "Allow owners to insert snippets" ON snippets 
FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Allow owners to select snippets" ON snippets 
FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Allow owners to update snippets" ON snippets 
FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Allow owners to delete snippets" ON snippets 
FOR DELETE USING (auth.uid() = owner);

-- Enable RLS on quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- RLS policies for quizzes
CREATE POLICY "Allow owners to select quizzes" ON quizzes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM snippets s 
    WHERE s.id = quizzes.snippet_id AND s.owner = auth.uid()
  )
);

CREATE POLICY "Allow owners to insert quizzes" ON quizzes 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM snippets s 
    WHERE s.id = quizzes.snippet_id AND s.owner = auth.uid()
  )
);

CREATE POLICY "Allow owners to update quizzes" ON quizzes 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM snippets s 
    WHERE s.id = quizzes.snippet_id AND s.owner = auth.uid()
  )
);

CREATE POLICY "Allow owners to delete quizzes" ON quizzes 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM snippets s 
    WHERE s.id = quizzes.snippet_id AND s.owner = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for snippets
CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for diagrams
INSERT INTO storage.buckets (id, name, public) 
VALUES ('diagrams', 'diagrams', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for diagrams
CREATE POLICY "Allow authenticated users to upload diagrams" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'diagrams' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow public read access to diagrams" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'diagrams');