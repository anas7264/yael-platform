-- Knowledge Components: hierarchical skill taxonomy
CREATE TABLE public.knowledge_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_arabic TEXT NOT NULL,
  name_hebrew TEXT,
  section TEXT NOT NULL
    CHECK (section IN ('reading', 'vocabulary', 'writing', 'spelling')),
  parent_id UUID REFERENCES public.knowledge_components(id),
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: all authenticated users can read
ALTER TABLE public.knowledge_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view KCs"
  ON public.knowledge_components FOR SELECT
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_kc_section ON public.knowledge_components(section);
CREATE INDEX idx_kc_parent ON public.knowledge_components(parent_id);
