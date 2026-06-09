-- ============================================================
-- MELATOZ — Setup Supabase
-- Ejecuta este archivo en:
--   Supabase Dashboard → SQL Editor → New query → pega y corre
-- ============================================================

-- 1. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
  id          BIGSERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  marca       TEXT DEFAULT 'Natrol',
  dosis       TEXT,
  cantidad    INTEGER,
  sabor       TEXT,
  descripcion TEXT,
  precio      INTEGER NOT NULL DEFAULT 0,
  imagen      TEXT,
  imagenes    TEXT[] DEFAULT '{}',
  stock       BOOLEAN DEFAULT true,
  disponible  BOOLEAN DEFAULT true,
  etiqueta    TEXT,
  categoria   TEXT DEFAULT 'adultos',
  destacado   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Visitantes (anon): solo ven productos visibles
CREATE POLICY "anon_read_available" ON public.products
  FOR SELECT TO anon
  USING (disponible = true);

-- Admin autenticado: lee TODOS los productos
CREATE POLICY "admin_read_all" ON public.products
  FOR SELECT TO authenticated
  USING (true);

-- Admin autenticado: puede crear, editar y eliminar
CREATE POLICY "admin_insert" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "admin_update" ON public.products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_delete" ON public.products
  FOR DELETE TO authenticated USING (true);

-- 3. TRIGGER: actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. DATOS INICIALES (los 3 productos actuales)
INSERT INTO public.products
  (id, nombre, marca, dosis, cantidad, sabor, descripcion, precio, imagen, imagenes, stock, disponible, etiqueta, categoria, destacado)
VALUES
  (1, 'Melatonina Natrol Kids 1mg', 'Natrol', '1mg',  90,  'Frambuesa',
   'Para niños desde los 4 años. Formato gummy suave con sabor a frambuesa, sin saborizantes artificiales.',
   12990, 'assets/images/natrol-kids-1mg-90.png',
   ARRAY['assets/images/natrol-kids-1mg-90.png'],
   true, true, 'Kids', 'kids', false),

  (2, 'Melatonina Natrol 10mg', 'Natrol', '10mg', 90,  'Frutilla',
   'Para adultos. 45 porciones de 2 gomitas. Sabor frutilla natural. Sin saborizantes artificiales ni OGM.',
   14990, 'assets/images/natrol-10mg-90.png',
   ARRAY['assets/images/natrol-10mg-90.png'],
   true, true, 'Más vendido', 'adultos', true),

  (3, 'Melatonina Natrol 10mg', 'Natrol', '10mg', 140, 'Frutilla',
   'Para adultos. El formato con más gomitas: 70 porciones sabor frutilla. Ideal para stock prolongado.',
   19990, 'assets/images/natrol-10mg-140.png',
   ARRAY['assets/images/natrol-10mg-140.png'],
   true, true, 'Mejor valor', 'adultos', false)

ON CONFLICT (id) DO NOTHING;

-- Reinicia la secuencia para que el próximo id auto sea 4+
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));

-- ============================================================
-- MIGRACIÓN: Campos de promoción/oferta
-- Si ya corriste el setup anterior, ejecuta SOLO este bloque.
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS promo_activa   BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS precio_oferta  INTEGER     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS texto_promo    TEXT        DEFAULT 'Oferta',
  ADD COLUMN IF NOT EXISTS promo_inicio   TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS promo_fin      TIMESTAMPTZ DEFAULT NULL;
