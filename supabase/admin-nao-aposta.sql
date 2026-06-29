-- ============================================================
--  TotoGraça — impedir o admin de apostar (só gere)
--  Correr no Supabase → SQL Editor → New query → Run
-- ============================================================

drop policy if exists tips_insert on public.tips;
create policy tips_insert on public.tips for insert with check (
  user_id = auth.uid() and not public.is_admin() and now() < public.match_deadline(match_id)
);

drop policy if exists tips_update on public.tips;
create policy tips_update on public.tips for update
  using (user_id = auth.uid() and not public.is_admin() and now() < public.match_deadline(match_id))
  with check (user_id = auth.uid() and not public.is_admin() and now() < public.match_deadline(match_id));
