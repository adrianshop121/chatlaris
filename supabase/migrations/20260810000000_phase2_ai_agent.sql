-- Migration: 20260810000000_phase2_ai_agent.sql
-- ChatLaris Phase 2 AI Agent Builder & Knowledge Base Database Architecture

-- 1. Create ai_agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    personality TEXT NOT NULL CHECK (personality IN ('friendly', 'professional', 'playful')),
    language TEXT NOT NULL CHECK (language IN ('id', 'en', 'mixed')),
    greeting TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'active', 'paused')) DEFAULT 'draft',
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create ai_business_knowledge table
CREATE TABLE IF NOT EXISTS public.ai_business_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    content TEXT,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create ai_faqs table
CREATE TABLE IF NOT EXISTS public.ai_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create ai_rules table
CREATE TABLE IF NOT EXISTS public.ai_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('prohibited_topic', 'custom_instruction', 'escalation_rule')),
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create ai_operating_hours table
CREATE TABLE IF NOT EXISTS public.ai_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_open BOOLEAN NOT NULL DEFAULT true,
    start_time TIME DEFAULT '08:00:00',
    end_time TIME DEFAULT '21:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create ai_settings table
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    share_price_without_request BOOLEAN NOT NULL DEFAULT false,
    active_24_hours BOOLEAN NOT NULL DEFAULT true,
    after_hours_message TEXT DEFAULT 'Maaf kak, kami tutup. Pesan kamu akan dibalas segera ya! 🙏',
    escalation_enabled BOOLEAN NOT NULL DEFAULT true,
    uncertainty_threshold NUMERIC DEFAULT 0.7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create ai_knowledge_documents table
CREATE TABLE IF NOT EXISTS public.ai_knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('uploading', 'processing', 'learned', 'failed')) DEFAULT 'uploading',
    extracted_text TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create ai_test_sessions table
CREATE TABLE IF NOT EXISTS public.ai_test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    total_tests INT NOT NULL DEFAULT 0,
    successful_tests INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create ai_test_messages table
CREATE TABLE IF NOT EXISTS public.ai_test_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.ai_test_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    response_source TEXT,
    response_time_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create ai_test_results table
CREATE TABLE IF NOT EXISTS public.ai_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.ai_test_sessions(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.ai_test_messages(id) ON DELETE CASCADE,
    rating TEXT NOT NULL CHECK (rating IN ('pass', 'fail')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PHASE 2
CREATE INDEX IF NOT EXISTS idx_agents_business ON public.ai_agents(business_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_business ON public.ai_business_knowledge(business_id);
CREATE INDEX IF NOT EXISTS idx_faqs_business ON public.ai_faqs(business_id);
CREATE INDEX IF NOT EXISTS idx_rules_business ON public.ai_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_op_hours_business ON public.ai_operating_hours(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_business ON public.ai_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_documents_business ON public.ai_knowledge_documents(business_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_business ON public.ai_test_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_test_messages_session ON public.ai_test_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_test_results_session ON public.ai_test_results(session_id);

-- RLS ENABLING
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_business_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_test_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_test_results ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ALL PHASE 2 TABLES
CREATE POLICY "Business members can manage ai_agents" ON public.ai_agents FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_business_knowledge" ON public.ai_business_knowledge FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_faqs" ON public.ai_faqs FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_rules" ON public.ai_rules FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_operating_hours" ON public.ai_operating_hours FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_settings" ON public.ai_settings FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_knowledge_documents" ON public.ai_knowledge_documents FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));
CREATE POLICY "Business members can manage ai_test_sessions" ON public.ai_test_sessions FOR ALL USING (public.is_business_member(business_id)) WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Business members can manage ai_test_messages" ON public.ai_test_messages FOR ALL
USING (session_id IN (SELECT id FROM public.ai_test_sessions WHERE public.is_business_member(business_id)))
WITH CHECK (session_id IN (SELECT id FROM public.ai_test_sessions WHERE public.is_business_member(business_id)));

CREATE POLICY "Business members can manage ai_test_results" ON public.ai_test_results FOR ALL
USING (session_id IN (SELECT id FROM public.ai_test_sessions WHERE public.is_business_member(business_id)))
WITH CHECK (session_id IN (SELECT id FROM public.ai_test_sessions WHERE public.is_business_member(business_id)));

-- AUTOMATIC UPDATED_AT TRIGGERS FOR PHASE 2
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON public.ai_agents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_business_knowledge_updated_at BEFORE UPDATE ON public.ai_business_knowledge FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_faqs_updated_at BEFORE UPDATE ON public.ai_faqs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_rules_updated_at BEFORE UPDATE ON public.ai_rules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_operating_hours_updated_at BEFORE UPDATE ON public.ai_operating_hours FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_knowledge_documents_updated_at BEFORE UPDATE ON public.ai_knowledge_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ai_test_sessions_updated_at BEFORE UPDATE ON public.ai_test_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
