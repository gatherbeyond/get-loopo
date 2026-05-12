-- Table 1: extra_chore_templates
CREATE TABLE public.extra_chore_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    credits INTEGER NOT NULL,
    estimated_time TEXT,
    description TEXT,
    supervised_only BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.extra_chore_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read extra chore templates"
ON public.extra_chore_templates
FOR SELECT
TO authenticated
USING (true);

-- Table 2: extra_chore_requests
CREATE TABLE public.extra_chore_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    kid_id UUID NOT NULL REFERENCES public.kids(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.extra_chore_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL,
    category TEXT NOT NULL,
    estimated_time TEXT,
    kid_note TEXT,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','denied','active','completed','pending_approval','paid')),
    parent_note TEXT,
    last_requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.extra_chore_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can read own extra chore requests"
ON public.extra_chore_requests
FOR SELECT
TO authenticated
USING (kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid()));

CREATE POLICY "Kids can insert own extra chore requests"
ON public.extra_chore_requests
FOR INSERT
TO authenticated
WITH CHECK (kid_id IN (SELECT kids.id FROM public.kids WHERE kids.anonymous_uid = auth.uid()));

CREATE POLICY "Parents can read family extra chore requests"
ON public.extra_chore_requests
FOR SELECT
TO authenticated
USING (kid_id IN (SELECT k.id FROM public.kids k JOIN public.families f ON k.family_id = f.id WHERE f.parent_id = auth.uid()));

CREATE POLICY "Parents can update family extra chore requests"
ON public.extra_chore_requests
FOR UPDATE
TO authenticated
USING (kid_id IN (SELECT k.id FROM public.kids k JOIN public.families f ON k.family_id = f.id WHERE f.parent_id = auth.uid()))
WITH CHECK (kid_id IN (SELECT k.id FROM public.kids k JOIN public.families f ON k.family_id = f.id WHERE f.parent_id = auth.uid()));

CREATE INDEX idx_extra_chore_requests_kid_id ON public.extra_chore_requests(kid_id);
CREATE INDEX idx_extra_chore_requests_family_id ON public.extra_chore_requests(family_id);
CREATE INDEX idx_extra_chore_requests_status ON public.extra_chore_requests(status);
CREATE INDEX idx_extra_chore_requests_template_id ON public.extra_chore_requests(template_id);