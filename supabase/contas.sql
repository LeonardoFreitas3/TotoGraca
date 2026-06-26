-- ============================================================
--  TotoGraça — definir as 3 contas (admin, leo, lelo)
--  CORRER no Supabase → SQL Editor → New query → Run
--  (já criaste as contas; isto só define quem é admin e aprova-as)
-- ============================================================

-- Admin (tu)
update public.profiles set role = 'admin', status = 'approved' where name = 'admin';

-- Jogadores
update public.profiles set status = 'approved' where name in ('leo', 'lelo');

-- Confirmar:
select name, role, status from public.profiles order by role desc, name;
