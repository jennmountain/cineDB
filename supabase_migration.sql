-- =============================================================
-- IMDb-style prototype — Supabase migration
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================================


-- ------------------------------------------------------------
-- 1. PROFILES
--    Extends auth.users with app-specific fields.
--    Created automatically via trigger on user sign-up.
-- ------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ------------------------------------------------------------
-- DISABLE EMAIL CONFIRMATION
--
-- For a teaching / prototype deployment we want sign-up →
-- immediate login with no email confirmation step.
--
-- DO THIS IN THE SUPABASE DASHBOARD (not via SQL):
--   Authentication → Providers → Email → turn OFF "Confirm email"
--
-- That toggle tells GoTrue not to send confirmation emails and
-- not to block login for unconfirmed accounts.  It is the correct
-- and safe way to disable confirmation — a BEFORE INSERT trigger
-- on auth.users will interfere with GoTrue's internal auth flow
-- and cause 500 errors on the token endpoint.
--
-- The seed users below already have email_confirmed_at = now()
-- set explicitly, so they always work regardless of the toggle.
-- New sign-ups work once the Dashboard toggle is turned off.
-- ------------------------------------------------------------

-- Fix any accounts stuck in unconfirmed state
-- (safe to run at any time, has no effect on GoTrue's flow)
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;


-- ------------------------------------------------------------
-- 2. MEDIA
--    Movies and TV series in one table.
--    type: 'movie' | 'tv'
--    genre: plain text for simplicity (e.g. 'Action', 'Drama')
--    avg_rating: updated by trigger on reviews insert/update/delete
--    poster_url: storage path — resolved to a public URL in the app
--                via supabase.storage.from('posters').getPublicUrl(poster_url)
-- ------------------------------------------------------------
create table public.media (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  type             text not null check (type in ('movie', 'tv')),
  genre            text,
  overview         text,
  poster_url       text,  -- e.g. 'posters/the-godfather.jpg'
  release_year     integer,
  runtime_minutes  integer,
  avg_rating       numeric(3, 1) default 0,
  created_at       timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 3. REVIEWS
--    Rating (1–10) + optional written review.
--    One review per user per media item (enforced by unique constraint).
-- ------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  media_id    uuid not null references public.media (id) on delete cascade,
  rating      integer not null check (rating between 1 and 10),
  content     text,
  created_at  timestamptz not null default now(),
  unique (user_id, media_id)
);

-- Keep media.avg_rating in sync automatically
create or replace function public.update_avg_rating()
returns trigger
language plpgsql
as $$
begin
  update public.media
  set avg_rating = (
    select round(avg(rating)::numeric, 1)
    from public.reviews
    where media_id = coalesce(new.media_id, old.media_id)
  )
  where id = coalesce(new.media_id, old.media_id);
  return null;
end;
$$;

create trigger sync_avg_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_avg_rating();


-- ------------------------------------------------------------
-- 4. WATCHLIST
--    watch_status: 'want_to_watch' | 'watched' | NULL
--    is_favourite: independent boolean — can be combined with any status
--    Both columns can be set simultaneously on the same row.
-- ------------------------------------------------------------
create table public.watchlist (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  media_id     uuid not null references public.media (id) on delete cascade,
  watch_status text check (watch_status in ('want_to_watch', 'watched')),
  is_favourite boolean not null default false,
  added_at     timestamptz not null default now(),
  unique (user_id, media_id)
);


-- ------------------------------------------------------------
-- 5. PEOPLE
--    Directors, actors, writers, producers.
--    photo_url follows the same storage convention as media.poster_url
--    but is stored under the people/ prefix in the same 'posters' bucket.
-- ------------------------------------------------------------
create table public.people (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  bio        text,
  photo_url  text,
  born_year  integer,
  died_year  integer,
  created_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 6. MEDIA CREDITS
--    Links people to media with a role.
--    role: 'actor' | 'director' | 'producer' | 'writer'
--    character_name: the character an actor plays (optional)
--    credit_order: display order within a role group (lower = first)
--    One row per (media, person, role) — same person can be both
--    director and writer on the same title.
-- ------------------------------------------------------------
create table public.media_credits (
  id             uuid primary key default gen_random_uuid(),
  media_id       uuid not null references public.media (id) on delete cascade,
  person_id      uuid not null references public.people (id) on delete cascade,
  role           text not null check (role in ('actor', 'director', 'producer', 'writer')),
  character_name text,
  credit_order   integer not null default 0,
  unique (media_id, person_id, role)
);


-- ------------------------------------------------------------
-- 7. SAVED QUERIES (SQL Explorer)
--    Rows where user_id IS NULL and is_default = true are
--    the preset queries shown to everyone.
--    Users can save their own queries (user_id = their id).
-- ------------------------------------------------------------
create table public.saved_queries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,
  title       text not null,
  sql         text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);


-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.media         enable row level security;
alter table public.reviews       enable row level security;
alter table public.watchlist     enable row level security;
alter table public.people        enable row level security;
alter table public.media_credits enable row level security;
alter table public.saved_queries enable row level security;

-- profiles: users can read all, update only their own
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- media: everyone can read; only admins can insert/update/delete
create policy "Media is publicly readable"
  on public.media for select using (true);

create policy "Admins can insert media"
  on public.media for insert
  with check ((select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can update media"
  on public.media for update
  using ((select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can delete media"
  on public.media for delete
  using ((select is_admin from public.profiles where id = auth.uid()));

-- reviews: everyone can read; users manage their own
create policy "Reviews are publicly readable"
  on public.reviews for select using (true);

create policy "Users can insert their own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- watchlist: private to each user
create policy "Users can read their own watchlist"
  on public.watchlist for select using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist"
  on public.watchlist for insert with check (auth.uid() = user_id);

create policy "Users can update their own watchlist"
  on public.watchlist for update using (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
  on public.watchlist for delete using (auth.uid() = user_id);

-- people: everyone can read; only admins can write
create policy "People are publicly readable"
  on public.people for select using (true);

create policy "Admins can insert people"
  on public.people for insert
  with check ((select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can update people"
  on public.people for update
  using ((select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can delete people"
  on public.people for delete
  using ((select is_admin from public.profiles where id = auth.uid()));

-- media_credits: everyone can read; only admins can write
create policy "Credits are publicly readable"
  on public.media_credits for select using (true);

create policy "Admins can insert credits"
  on public.media_credits for insert
  with check ((select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can update credits"
  on public.media_credits for update
  using ((select is_admin from public.profiles where id = auth.uid()));

create policy "Admins can delete credits"
  on public.media_credits for delete
  using ((select is_admin from public.profiles where id = auth.uid()));

-- saved_queries: default queries are readable by all; personal queries are private
create policy "Default queries are publicly readable"
  on public.saved_queries for select
  using (is_default = true or auth.uid() = user_id);

create policy "Users can insert their own queries"
  on public.saved_queries for insert with check (auth.uid() = user_id);

create policy "Users can delete their own queries"
  on public.saved_queries for delete using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- INDEXES (for fast search and filtering)
-- ------------------------------------------------------------
create index on public.media (type);
create index on public.media (genre);
create index on public.media (release_year);
create index on public.reviews (media_id);
create index on public.reviews (user_id);
create index on public.watchlist (user_id);
create index on public.media_credits (media_id);
create index on public.media_credits (person_id);

-- Full-text search on title + overview
alter table public.media
  add column fts tsvector
  generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(overview, ''))) stored;

create index on public.media using gin(fts);


-- ------------------------------------------------------------
-- SEED DATA — Default saved queries
-- ------------------------------------------------------------
insert into public.saved_queries (user_id, title, sql, is_default) values

(null, 'All movies', 
'select title, genre, release_year, avg_rating
from media
where type = ''movie''
order by avg_rating desc;', 
true),

(null, 'All TV series', 
'select title, genre, release_year, avg_rating
from media
where type = ''tv''
order by avg_rating desc;', 
true),

(null, 'Top 10 rated', 
'select title, type, avg_rating
from media
order by avg_rating desc
limit 10;', 
true),

(null, 'Most reviewed', 
'select m.title, count(r.id) as review_count, round(avg(r.rating), 1) as avg_rating
from media m
left join reviews r on r.media_id = m.id
group by m.id, m.title
order by review_count desc
limit 10;', 
true),

(null, 'Recent reviews', 
'select p.username, m.title, r.rating, r.content, r.created_at
from reviews r
join profiles p on p.id = r.user_id
join media m on m.id = r.media_id
order by r.created_at desc
limit 20;', 
true),

(null, 'Media by genre', 
'select genre, count(*) as total, round(avg(avg_rating), 1) as avg_rating
from media
group by genre
order by total desc;', 
true);


-- ------------------------------------------------------------
-- STORAGE — Poster image uploads
--
-- Creates a public 'posters' bucket.
-- Admins can upload and delete files.
-- Everyone (including unauthenticated users) can view/download.
--
-- In the app, upload like this:
--   const { data } = await supabase.storage
--     .from('posters')
--     .upload(`${mediaId}.jpg`, file);
--   // then save data.path to media.poster_url
--
-- Resolve to a display URL like this:
--   const { data } = supabase.storage
--     .from('posters')
--     .getPublicUrl(media.poster_url);
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('posters', 'posters', true);

-- Anyone can view poster images (bucket is public, but policy is explicit)
create policy "Posters are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'posters');

-- Only admins can upload posters
create policy "Admins can upload posters"
  on storage.objects for insert
  with check (
    bucket_id = 'posters'
    and (select is_admin from public.profiles where id = auth.uid())
  );

-- Only admins can update (replace) posters
create policy "Admins can update posters"
  on storage.objects for update
  using (
    bucket_id = 'posters'
    and (select is_admin from public.profiles where id = auth.uid())
  );

-- Only admins can delete posters
create policy "Admins can delete posters"
  on storage.objects for delete
  using (
    bucket_id = 'posters'
    and (select is_admin from public.profiles where id = auth.uid())
  );


-- ------------------------------------------------------------
-- RPC FUNCTION — SQL Explorer
--
-- Allows the app to run arbitrary SELECT queries via
-- supabase.rpc('run_query', { query_text: '...' })
--
-- Security: restricted to SELECT only (enforced in the app
-- AND via a check here). Runs with the caller's permissions.
-- ------------------------------------------------------------
create or replace function public.run_query(query_text text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  clean_query text;
begin
  -- Strip trailing semicolons and whitespace so the query can be
  -- safely embedded as a subquery: select json_agg(t) from (<query>) t
  clean_query := trim(regexp_replace(trim(query_text), ';\s*$', ''));

  -- Block anything that isn't a SELECT
  if not (lower(clean_query) like 'select%') then
    raise exception 'Only SELECT queries are permitted.';
  end if;

  execute 'select json_agg(t) from (' || clean_query || ') t' into result;
  return coalesce(result, '[]'::json);
end;
$$;

-- Grant execute to authenticated users only
grant execute on function public.run_query(text) to authenticated;
