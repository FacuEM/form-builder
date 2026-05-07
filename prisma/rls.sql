-- Row Level Security policies — preparation for switching the Prisma
-- connection from the `postgres` superuser to a non-superuser app role.
--
-- These policies are INERT until two things change:
--   1. A non-superuser role exists (e.g. `app_user` with NOLOGIN BYPASSRLS off)
--      and DATABASE_URL connects as that role.
--   2. Each request issues `SET LOCAL request.jwt.claim.sub = '<user-id>'`
--      before running queries (Prisma middleware, or use Supabase's
--      `set_config('request.jwt.claims', ..., true)` pattern).
--
-- Until both are in place, Postgres superusers bypass RLS regardless of these
-- policies. Apply this file, then make the connection-role change.

-- Helper: read the current request's user id from the JWT claim.
create or replace function current_user_id() returns text
  language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')
$$;

-- Form: only the creator can read/write their forms.
alter table "Form" enable row level security;
alter table "Form" force row level security;
drop policy if exists form_owner_all on "Form";
create policy form_owner_all on "Form"
  for all using ("creatorId" = current_user_id())
  with check ("creatorId" = current_user_id());

-- Public read for published forms (respondents need to fetch the form).
drop policy if exists form_public_read on "Form";
create policy form_public_read on "Form"
  for select using (published = true);

-- Question: scoped to its parent Form. Public can read questions of published forms.
alter table "Question" enable row level security;
alter table "Question" force row level security;
drop policy if exists question_owner_all on "Question";
create policy question_owner_all on "Question"
  for all using (
    exists (select 1 from "Form" f where f.id = "Question"."formId" and f."creatorId" = current_user_id())
  )
  with check (
    exists (select 1 from "Form" f where f.id = "Question"."formId" and f."creatorId" = current_user_id())
  );
drop policy if exists question_public_read on "Question";
create policy question_public_read on "Question"
  for select using (
    exists (select 1 from "Form" f where f.id = "Question"."formId" and f.published = true)
  );

-- Choice: scoped to its parent Question -> Form.
alter table "Choice" enable row level security;
alter table "Choice" force row level security;
drop policy if exists choice_owner_all on "Choice";
create policy choice_owner_all on "Choice"
  for all using (
    exists (
      select 1 from "Question" q join "Form" f on f.id = q."formId"
      where q.id = "Choice"."questionId" and f."creatorId" = current_user_id()
    )
  )
  with check (
    exists (
      select 1 from "Question" q join "Form" f on f.id = q."formId"
      where q.id = "Choice"."questionId" and f."creatorId" = current_user_id()
    )
  );
drop policy if exists choice_public_read on "Choice";
create policy choice_public_read on "Choice"
  for select using (
    exists (
      select 1 from "Question" q join "Form" f on f.id = q."formId"
      where q.id = "Choice"."questionId" and f.published = true
    )
  );

-- Response: form owner reads; anyone can insert/update for a published form.
alter table "Response" enable row level security;
alter table "Response" force row level security;
drop policy if exists response_owner_read on "Response";
create policy response_owner_read on "Response"
  for select using (
    exists (select 1 from "Form" f where f.id = "Response"."formId" and f."creatorId" = current_user_id())
  );
drop policy if exists response_public_write on "Response";
create policy response_public_write on "Response"
  for insert with check (
    exists (select 1 from "Form" f where f.id = "Response"."formId" and f.published = true)
  );
drop policy if exists response_public_update on "Response";
create policy response_public_update on "Response"
  for update using (
    exists (select 1 from "Form" f where f.id = "Response"."formId" and f.published = true)
  )
  with check (
    exists (select 1 from "Form" f where f.id = "Response"."formId" and f.published = true)
  );

-- Answer: same shape as Response, scoped via responseId -> formId.
alter table "Answer" enable row level security;
alter table "Answer" force row level security;
drop policy if exists answer_owner_read on "Answer";
create policy answer_owner_read on "Answer"
  for select using (
    exists (
      select 1 from "Response" r join "Form" f on f.id = r."formId"
      where r.id = "Answer"."responseId" and f."creatorId" = current_user_id()
    )
  );
drop policy if exists answer_public_write on "Answer";
create policy answer_public_write on "Answer"
  for insert with check (
    exists (
      select 1 from "Response" r join "Form" f on f.id = r."formId"
      where r.id = "Answer"."responseId" and f.published = true
    )
  );
drop policy if exists answer_public_update on "Answer";
create policy answer_public_update on "Answer"
  for update using (
    exists (
      select 1 from "Response" r join "Form" f on f.id = r."formId"
      where r.id = "Answer"."responseId" and f.published = true
    )
  )
  with check (
    exists (
      select 1 from "Response" r join "Form" f on f.id = r."formId"
      where r.id = "Answer"."responseId" and f.published = true
    )
  );
