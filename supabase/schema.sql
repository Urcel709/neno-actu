-- NENO ACTU — schéma PostgreSQL / Supabase
-- À exécuter une fois dans Supabase → SQL Editor. Ré-exécutable sans erreur.

create extension if not exists pgcrypto;

-- ───────────── Types ─────────────
do $$ begin
  create type public.user_role as enum
    ('reader','super_admin','admin','chief_editor','journalist','editor','moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.article_status as enum
    ('draft','pending_review','approved','scheduled','published','rejected');
exception when duplicate_object then null; end $$;

-- ───────────── Tables ─────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '',
  slug          text unique,
  role          public.user_role not null default 'reader',
  bio           text not null default '',
  avatar_url    text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  sort_order  int  not null default 0
);

create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text not null default '',
  content         text not null default '',
  sources         text not null default '',
  cover_url       text,
  cover_alt       text not null default '',
  author_id       uuid not null references public.profiles(id),
  category_id     uuid references public.categories(id),
  status          public.article_status not null default 'draft',
  is_featured     boolean not null default false,
  is_flash        boolean not null default false,
  is_opinion      boolean not null default false,
  video_url       text,
  seo_title       text not null default '',
  seo_description text not null default '',
  review_note     text not null default '',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists articles_status_pub_idx on public.articles (status, published_at desc);
create index if not exists articles_category_idx on public.articles (category_id);
create index if not exists articles_author_idx on public.articles (author_id);

create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);
create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null,
  url         text not null,
  caption     text not null default '',
  alt_text    text not null default '',
  mime_type   text not null,
  size_bytes  int  not null,
  uploaded_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.article_status_history (
  id          bigint generated always as identity primary key,
  article_id  uuid not null references public.articles(id) on delete cascade,
  from_status public.article_status,
  to_status   public.article_status not null,
  changed_by  uuid,
  note        text not null default '',
  created_at  timestamptz not null default now()
);

-- Consultations agrégées par jour (aucune donnée personnelle conservée)
create table if not exists public.article_views (
  article_id uuid not null references public.articles(id) on delete cascade,
  day        date not null default current_date,
  views      int  not null default 0,
  primary key (article_id, day)
);

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  consent      boolean not null default true,
  consented_at timestamptz not null default now(),
  active       boolean not null default true
);

create table if not exists public.audit_logs (
  id         bigint generated always as identity primary key,
  user_id    uuid,
  action     text not null,
  object     text not null default '',
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Préparées pour la version 2 (commentaires modérés, notifications)
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null,
  content    text not null,
  status     text not null default 'pending' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  content    text not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ───────────── Fonctions utilitaires ─────────────
create or replace function public.current_role_name()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in
    ('super_admin','admin','chief_editor','journalist','editor','moderator'), false)
$$;

create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('super_admin','admin','chief_editor'), false)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('super_admin','admin'), false)
$$;

-- Un article est public s'il est publié, ou programmé et arrivé à échéance.
create or replace function public.article_is_public(s public.article_status, at timestamptz)
returns boolean language sql immutable as $$
  select s = 'published' or (s = 'scheduled' and at is not null and at <= now())
$$;

-- Nouvel utilisateur Auth → profil sans aucun droit ('reader').
-- Les rôles sont attribués uniquement côté serveur (service_role) ou par SQL.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Empêche toute élévation de privilèges depuis le navigateur.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role   := old.role;
    new.active := old.active;
  end if;
  -- seul un super administrateur peut créer ou retirer un super administrateur
  if auth.uid() is not null
     and (new.role = 'super_admin' or old.role = 'super_admin')
     and new.role is distinct from old.role
     and public.current_role_name() <> 'super_admin' then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Historique des statuts + date de mise à jour
create or replace function public.article_before_write()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;
drop trigger if exists article_before_write on public.articles;
create trigger article_before_write before insert or update on public.articles
  for each row execute function public.article_before_write();

create or replace function public.article_log_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.article_status_history (article_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.article_status_history (article_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, auth.uid(), new.review_note);
    insert into public.audit_logs (user_id, action, object, detail)
    values (auth.uid(), 'article.status', new.id::text,
            jsonb_build_object('from', old.status, 'to', new.status, 'title', new.title));
  end if;
  return null;
end $$;
drop trigger if exists article_log_status on public.articles;
create trigger article_log_status after insert or update on public.articles
  for each row execute function public.article_log_status();

-- Compteur de consultations (appelable par le public, sans accès direct à la table)
create or replace function public.track_view(p_article uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.articles a
             where a.id = p_article and public.article_is_public(a.status, a.published_at)) then
    insert into public.article_views (article_id, day, views) values (p_article, current_date, 1)
    on conflict (article_id, day) do update set views = public.article_views.views + 1;
  end if;
end $$;

-- Articles les plus lus sur une période
create or replace function public.popular_article_ids(p_days int default 7, p_limit int default 6)
returns table (article_id uuid, total bigint)
language sql stable security definer set search_path = public as $$
  select v.article_id, sum(v.views)::bigint
  from public.article_views v
  join public.articles a on a.id = v.article_id
  where v.day >= current_date - p_days and public.article_is_public(a.status, a.published_at)
  group by v.article_id order by 2 desc limit p_limit
$$;

-- Vue publique des auteurs : aucune donnée sensible (ni rôle ni statut)
create or replace view public.authors as
  select p.id, p.display_name as name, p.slug, p.bio, p.avatar_url
  from public.profiles p
  where p.active and p.role in ('super_admin','admin','chief_editor','journalist','editor');

-- ───────────── Row Level Security ─────────────
alter table public.profiles               enable row level security;
alter table public.categories             enable row level security;
alter table public.articles               enable row level security;
alter table public.tags                   enable row level security;
alter table public.article_tags           enable row level security;
alter table public.media                  enable row level security;
alter table public.article_status_history enable row level security;
alter table public.article_views          enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.audit_logs             enable row level security;
alter table public.comments               enable row level security;
alter table public.notifications          enable row level security;

-- profiles
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_staff());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- categories : lecture publique, écriture par les responsables
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all
  using (public.is_manager()) with check (public.is_manager());

-- tags
drop policy if exists tags_read on public.tags;
create policy tags_read on public.tags for select using (true);
drop policy if exists tags_write on public.tags;
create policy tags_write on public.tags for all
  using (public.is_staff()) with check (public.is_staff());

-- articles
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles for select
  using (public.article_is_public(status, published_at));

drop policy if exists articles_staff_read on public.articles;
create policy articles_staff_read on public.articles for select using (
  public.current_role_name() in ('super_admin','admin','chief_editor','editor')
  or (public.current_role_name() = 'journalist' and author_id = auth.uid())
);

drop policy if exists articles_insert on public.articles;
create policy articles_insert on public.articles for insert with check (
  public.is_manager()
  or (public.current_role_name() in ('journalist','editor')
      and author_id = auth.uid() and status = 'draft')
);

drop policy if exists articles_update on public.articles;
create policy articles_update on public.articles for update
  using (
    public.is_manager()
    or (public.current_role_name() = 'journalist' and author_id = auth.uid()
        and status in ('draft','rejected','pending_review'))
    or (public.current_role_name() = 'editor' and status in ('draft','pending_review','rejected'))
  )
  with check (
    public.is_manager()
    or (public.current_role_name() = 'journalist' and author_id = auth.uid()
        and status in ('draft','pending_review'))
    or (public.current_role_name() = 'editor' and status in ('draft','pending_review','rejected'))
  );

drop policy if exists articles_delete on public.articles;
create policy articles_delete on public.articles for delete using (
  public.is_manager()
  or (public.current_role_name() = 'journalist' and author_id = auth.uid() and status = 'draft')
);

-- article_tags : visibles si l'article l'est
drop policy if exists article_tags_read on public.article_tags;
create policy article_tags_read on public.article_tags for select using (true);
drop policy if exists article_tags_write on public.article_tags;
create policy article_tags_write on public.article_tags for all
  using (public.is_staff()) with check (public.is_staff());

-- media : lecture publique (le bucket est public), écriture par l'équipe
drop policy if exists media_read on public.media;
create policy media_read on public.media for select using (true);
drop policy if exists media_insert on public.media;
create policy media_insert on public.media for insert
  with check (public.current_role_name() in ('super_admin','admin','chief_editor','journalist','editor'));
drop policy if exists media_update on public.media;
create policy media_update on public.media for update
  using (public.is_manager() or uploaded_by = auth.uid());
drop policy if exists media_delete on public.media;
create policy media_delete on public.media for delete
  using (public.is_manager() or uploaded_by = auth.uid());

-- historique & audit : lecture par les responsables, écriture uniquement par triggers
drop policy if exists history_read on public.article_status_history;
create policy history_read on public.article_status_history for select using (public.is_manager());
drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select using (public.is_admin());

-- consultations : aucune lecture directe (passer par les fonctions)
-- newsletter : inscription publique en insertion seule, lecture réservée aux administrateurs
drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers for insert
  with check (consent = true and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254);
drop policy if exists newsletter_admin on public.newsletter_subscribers;
create policy newsletter_admin on public.newsletter_subscribers for select using (public.is_admin());

-- comments (V2) : lecture publique des commentaires approuvés, modération par l'équipe
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select
  using (status = 'approved' or public.current_role_name() in ('super_admin','admin','chief_editor','moderator'));
drop policy if exists comments_moderate on public.comments;
create policy comments_moderate on public.comments for all
  using (public.current_role_name() in ('super_admin','admin','chief_editor','moderator'))
  with check (public.current_role_name() in ('super_admin','admin','chief_editor','moderator'));

-- notifications (V2)
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Droits d'exécution
revoke all on function public.track_view(uuid) from public;
grant execute on function public.track_view(uuid) to anon, authenticated;
revoke all on function public.popular_article_ids(int, int) from public;
grant execute on function public.popular_article_ids(int, int) to anon, authenticated;
grant select on public.authors to anon, authenticated;

-- ───────────── Stockage des médias ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists media_objects_read on storage.objects;
create policy media_objects_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_objects_insert on storage.objects;
create policy media_objects_insert on storage.objects for insert
  with check (bucket_id = 'media'
    and public.current_role_name() in ('super_admin','admin','chief_editor','journalist','editor'));
drop policy if exists media_objects_delete on storage.objects;
create policy media_objects_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_manager());

-- ───────────── Rubriques initiales ─────────────
insert into public.categories (name, slug, description, sort_order) values
  ('RDC','rdc','Actualités des provinces et institutions congolaises.',1),
  ('Politique','politique','Institutions, gouvernance, élections et décisions publiques.',2),
  ('Sécurité','securite','Sécurité, prévention et informations humanitaires vérifiées.',3),
  ('Société','societe','Vie quotidienne, santé, environnement et faits de société.',4),
  ('Économie','economie','Commerce, entreprises, finances et développement.',5),
  ('Éducation','education','Écoles, universités, bourses et formations.',6),
  ('Afrique & International','afrique-international','Actualités africaines et mondiales.',7),
  ('Technologie','technologie','Innovation, numérique et télécommunications.',8),
  ('Sports','sports','Football et autres disciplines sportives.',9),
  ('Culture','culture','Musique, arts, patrimoine et événements.',10),
  ('Vidéos','videos','Reportages, interviews et formats vidéo.',11),
  ('Opinions','opinions','Chroniques et tribunes clairement identifiées comme telles.',12)
on conflict (slug) do nothing;

-- ───────────── Premier super administrateur ─────────────
-- 1. Créez l'utilisateur dans Supabase → Authentication → Users (e-mail + mot de passe).
-- 2. Exécutez (en remplaçant l'e-mail) :
--
--   update public.profiles set role = 'super_admin', display_name = 'Votre nom'
--   where id = (select id from auth.users where email = 'vous@exemple.com');

-- ───────────── Messages du formulaire de contact ─────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null default '',
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists contact_insert on public.contact_messages;
create policy contact_insert on public.contact_messages for insert
  with check (length(name) between 1 and 120 and length(message) between 5 and 5000
              and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
drop policy if exists contact_admin_read on public.contact_messages;
create policy contact_admin_read on public.contact_messages for select using (public.is_admin());
drop policy if exists contact_admin_update on public.contact_messages;
create policy contact_admin_update on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());
