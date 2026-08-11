-- Migration: 20260810100000_phase3_product_catalog.sql
-- ChatLaris Phase 3 Product Catalog Database Architecture

-- 1. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    normal_price NUMERIC NOT NULL CHECK (normal_price >= 0),
    discount_price NUMERIC CHECK (discount_price IS NULL OR (discount_price >= 0 AND discount_price < normal_price)),
    stock NUMERIC NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit TEXT NOT NULL DEFAULT 'pcs',
    category TEXT,
    weight_grams INT DEFAULT 0 CHECK (weight_grams >= 0),
    status TEXT NOT NULL CHECK (status IN ('active', 'out_of_stock', 'draft', 'inactive')) DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_business_product_slug UNIQUE (business_id, slug)
);

-- 2. Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    price_override NUMERIC CHECK (price_override IS NULL OR price_override >= 0),
    stock NUMERIC NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create product_tags table
CREATE TABLE IF NOT EXISTS public.product_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PHASE 3
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON public.product_tags(product_id);

-- RLS ENABLING
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Business members can manage products" ON public.products FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status IN ('active', 'out_of_stock'));

CREATE POLICY "Business members can manage product_images" ON public.product_images FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Public can view active product images" ON public.product_images FOR SELECT USING (product_id IN (SELECT id FROM public.products WHERE status IN ('active', 'out_of_stock')));

CREATE POLICY "Business members can manage product_variants" ON public.product_variants FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Public can view active product variants" ON public.product_variants FOR SELECT USING (product_id IN (SELECT id FROM public.products WHERE status IN ('active', 'out_of_stock')));

CREATE POLICY "Business members can manage product_tags" ON public.product_tags FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Public can view active product tags" ON public.product_tags FOR SELECT USING (product_id IN (SELECT id FROM public.products WHERE status IN ('active', 'out_of_stock')));

-- AUTOMATIC UPDATED_AT TRIGGERS FOR PHASE 3
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
