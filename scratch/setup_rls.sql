ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeacherApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContentRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LessonProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RateLimit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Certificate" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select" ON public."User" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."User" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."User" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."User" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."TeacherApplication" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."TeacherApplication" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."TeacherApplication" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."TeacherApplication" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."Course" FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_select_published" ON public."Course" FOR SELECT TO anon USING (published = true);
CREATE POLICY "authenticated_insert" ON public."Course" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."Course" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."Course" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."Lesson" FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_select_preview" ON public."Lesson" FOR SELECT TO anon USING ("isFreePreview" = true);
CREATE POLICY "authenticated_insert" ON public."Lesson" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."Lesson" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."Lesson" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."ContentRequest" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."ContentRequest" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."ContentRequest" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."ContentRequest" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."Comment" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."Comment" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."Comment" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."Comment" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."LessonProgress" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."LessonProgress" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."LessonProgress" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_select" ON public."Enrollment" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."Enrollment" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."Enrollment" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_select" ON public."RateLimit" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."RateLimit" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."RateLimit" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_delete" ON public."RateLimit" FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_select" ON public."EventLog" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."EventLog" FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_select" ON public."Notification" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."Notification" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public."Notification" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_select" ON public."Certificate" FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public."Certificate" FOR INSERT TO authenticated WITH CHECK (true);
