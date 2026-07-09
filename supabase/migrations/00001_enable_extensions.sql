-- Enable pgvector for vocabulary embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp as backup UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shared trigger function: auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
