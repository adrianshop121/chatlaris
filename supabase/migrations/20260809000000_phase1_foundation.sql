-- Migration: 20260809000000_phase1_foundation.sql
-- ChatLaris Phase 1 Foundation Database Architecture

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create business_members table
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_business_user UNIQUE (business_id, user_id)
);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business')) DEFAULT 'free',
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired')) DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create subscription_usage table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    chats_count INT NOT NULL DEFAULT 0,
    products_count INT NOT NULL DEFAULT 0,
    orders_count INT NOT NULL DEFAULT 0,
    broadcasts_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_business_period UNIQUE (business_id, period_start)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_business_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_members_business ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON public.subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_usage_business ON public.subscription_usage(business_id);

-- HELPER FUNCTIONS FOR SECURITY
CREATE OR REPLACE FUNCTION public.is_business_member(target_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = target_business_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_business_role(target_business_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = target_business_id
          AND user_id = auth.uid()
          AND status = 'active'
          AND (
              role = required_role 
              OR role = 'owner'
              OR (required_role = 'staff' AND role IN ('admin', 'owner'))
          )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT business_id FROM public.business_members
    WHERE user_id = auth.uid()
      AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile or co-members profile"
    ON public.profiles FOR SELECT
    USING (
        id = auth.uid() OR
        id IN (
            SELECT user_id FROM public.business_members 
            WHERE business_id IN (SELECT public.get_user_business_ids())
        )
    );

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- Businesses Policies
CREATE POLICY "Business members can select business"
    ON public.businesses FOR SELECT
    USING (public.is_business_member(id));

CREATE POLICY "Authenticated users can create business"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Business owners/admins can update business"
    ON public.businesses FOR UPDATE
    USING (public.has_business_role(id, 'admin'));

-- Business Members Policies
CREATE POLICY "Business members can view memberships"
    ON public.business_members FOR SELECT
    USING (public.is_business_member(business_id) OR user_id = auth.uid());

CREATE POLICY "Users can insert own membership on business creation"
    ON public.business_members FOR INSERT
    WITH CHECK (user_id = auth.uid() OR public.has_business_role(business_id, 'admin'));

CREATE POLICY "Business admins/owners can update members"
    ON public.business_members FOR UPDATE
    USING (public.has_business_role(business_id, 'admin'));

-- Subscriptions Policies
CREATE POLICY "Business members can view subscriptions"
    ON public.subscriptions FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Owners can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (public.has_business_role(business_id, 'owner'))
    WITH CHECK (public.has_business_role(business_id, 'owner'));

CREATE POLICY "Allow subscription creation on business setup"
    ON public.subscriptions FOR INSERT
    WITH CHECK (public.is_business_member(business_id) OR auth.uid() IS NOT NULL);

-- Subscription Usage Policies
CREATE POLICY "Business members can view usage"
    ON public.subscription_usage FOR SELECT
    USING (public.is_business_member(business_id));

CREATE POLICY "Allow usage insertion on business setup"
    ON public.subscription_usage FOR INSERT
    WITH CHECK (public.is_business_member(business_id) OR auth.uid() IS NOT NULL);

-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_business_members_updated_at BEFORE UPDATE ON public.business_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON public.subscription_usage FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- AUTOMATIC PROFILE CREATION TRIGGER FOR AUTH USERS
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
