-- =============================================================
-- CineDB — Dummy seed data
-- Run this AFTER the main migration in Supabase SQL Editor
-- =============================================================


-- ------------------------------------------------------------
-- MEDIA — 18 movies & TV series
-- poster_url left null (no images yet — upload via Admin page)
-- ------------------------------------------------------------
insert into public.media (id, title, type, genre, overview, release_year, runtime_minutes) values

('11111111-0000-0000-0000-000000000001', 'The Godfather',         'movie', 'Crime',
 'The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.',
 1972, 175),

('11111111-0000-0000-0000-000000000002', 'The Dark Knight',       'movie', 'Action',
 'When the Joker wreaks havoc on Gotham, Batman must confront one of the greatest psychological tests of his ability to fight injustice.',
 2008, 152),

('11111111-0000-0000-0000-000000000003', 'Inception',             'movie', 'Sci-Fi',
 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
 2010, 148),

('11111111-0000-0000-0000-000000000004', 'Parasite',              'movie', 'Drama',
 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
 2019, 132),

('11111111-0000-0000-0000-000000000005', 'Interstellar',          'movie', 'Sci-Fi',
 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.',
 2014, 169),

('11111111-0000-0000-0000-000000000006', 'The Shawshank Redemption', 'movie', 'Drama',
 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
 1994, 142),

('11111111-0000-0000-0000-000000000007', 'Pulp Fiction',          'movie', 'Crime',
 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
 1994, 154),

('11111111-0000-0000-0000-000000000008', 'The Matrix',            'movie', 'Sci-Fi',
 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
 1999, 136),

('11111111-0000-0000-0000-000000000009', 'Spirited Away',         'movie', 'Animation',
 'During her family''s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
 2001, 125),

('11111111-0000-0000-0000-000000000010', 'Goodfellas',            'movie', 'Crime',
 'The story of Henry Hill and his life in the mob, covering his relationship with his wife and his partners in crime.',
 1990, 146),

('11111111-0000-0000-0000-000000000011', 'Breaking Bad',          'tv',    'Drama',
 'A high school chemistry teacher turned methamphetamine producer partners with a former student to secure his family''s future.',
 2008, 47),

('11111111-0000-0000-0000-000000000012', 'Chernobyl',             'tv',    'Drama',
 'A dramatization of the Chernobyl nuclear disaster and its aftermath, told from multiple perspectives.',
 2019, 66),

('11111111-0000-0000-0000-000000000013', 'Stranger Things',       'tv',    'Sci-Fi',
 'When a young boy disappears, his mother and friends must confront terrifying supernatural forces to get him back.',
 2016, 51),

('11111111-0000-0000-0000-000000000014', 'The Bear',              'tv',    'Drama',
 'A young chef from the fine dining world returns to Chicago to run his family''s sandwich shop after a personal tragedy.',
 2022, 30),

('11111111-0000-0000-0000-000000000015', 'Squid Game',            'tv',    'Thriller',
 'Hundreds of cash-strapped players accept a strange invitation to compete in children''s games for a life-changing prize.',
 2021, 54),

('11111111-0000-0000-0000-000000000016', 'Oppenheimer',           'movie', 'Drama',
 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
 2023, 180),

('11111111-0000-0000-0000-000000000017', 'Everything Everywhere All at Once', 'movie', 'Sci-Fi',
 'A middle-aged Chinese immigrant is swept up in an outlandish adventure, where she alone can save the world by exploring other universes.',
 2022, 139),

('11111111-0000-0000-0000-000000000018', 'Shogun',                'tv',    'Drama',
 'In feudal Japan, an English navigator finds himself caught in a dangerous power struggle that will determine the future of the nation.',
 2024, 60);


-- ------------------------------------------------------------
-- USERS — create via Supabase Auth + matching profiles
--
-- Inserted directly into auth.users (allowed in the SQL Editor).
-- Passwords are hashed at runtime using pgcrypto's crypt() so
-- they work correctly on any Supabase project/GoTrue version.
--
-- All users can log in with:
--   Regular users → password: pass1234
--   tpapon        → password: cs636@umb
-- ------------------------------------------------------------

-- Helper: insert auth users with properly hashed passwords
-- Uses pgcrypto (built into Supabase) to generate real bcrypt hashes
-- at seed time, so these work on any Supabase project/version.
do $$
declare
  pass_hash_regular text := crypt('pass1234',  gen_salt('bf', 10));
  pass_hash_tpapon  text := crypt('cs636@umb', gen_salt('bf', 10));
begin

  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous,
    -- Newer GoTrue versions require these to be '' not NULL
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token,
    reauthentication_token
  ) values

  ('22222222-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'tpapon@umb.edu', pass_hash_tpapon,
   now(), now(), now(),
   '{"username":"tpapon"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', ''),

  ('22222222-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'alice@example.com', pass_hash_regular,
   now(), now(), now(),
   '{"username":"alice_m"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', ''),

  ('22222222-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'bob@example.com', pass_hash_regular,
   now(), now(), now(),
   '{"username":"bob_k"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', ''),

  ('22222222-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'sara@example.com', pass_hash_regular,
   now(), now(), now(),
   '{"username":"sara_j"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', ''),

  ('22222222-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'mike@example.com', pass_hash_regular,
   now(), now(), now(),
   '{"username":"mike_w"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', ''),

  ('22222222-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'priya@example.com', pass_hash_regular,
   now(), now(), now(),
   '{"username":"priya_r"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', ''),

  ('22222222-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'james@example.com', pass_hash_regular,
   now(), now(), now(),
   '{"username":"james_t"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb,
   false, false,
   '', '', '', '', '', '', '', '');

end $$;


-- ------------------------------------------------------------
-- PROFILES — the trigger auto-creates these on auth.users insert,
-- but we update them here to set is_admin for tpapon and
-- ensure usernames are correct.
-- ------------------------------------------------------------
update public.profiles set is_admin = true
  where id = '22222222-0000-0000-0000-000000000001';


-- ------------------------------------------------------------
-- REVIEWS — varied ratings across media and users
-- ------------------------------------------------------------
insert into public.reviews (user_id, media_id, rating, content) values

-- The Godfather
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 10, 'An absolute masterpiece. Every frame is perfection.'),
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 9,  'One of the greatest films ever made. Brando is legendary.'),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 10, 'Cinema does not get better than this.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 8,  'Slow at times but the payoff is extraordinary.'),

-- The Dark Knight
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 10, 'Heath Ledger''s Joker is the greatest villain in cinema history.'),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 9,  'The interrogation scene alone is worth a 10.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 9,  'Redefined what a superhero movie could be.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 8,  'Brilliant but slightly long in the third act.'),

-- Inception
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003', 9,  'Mind-bending. The zero-gravity hallway fight is iconic.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000003', 8,  'Confusing on first watch but rewards patience.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', 10, 'Nolan at his absolute peak.'),

-- Parasite
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 10, 'Nothing prepares you for the second half. Bong Joon-ho is a genius.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000004', 9,  'Sharp, funny, terrifying — all at once.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000004', 10, 'Best Picture winner and it absolutely deserved it.'),

-- Interstellar
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000005', 9,  'Emotionally devastating and visually stunning.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000005', 7,  'Great visuals, but the ending loses me.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000005', 9,  'The docking scene might be the most intense 5 minutes in film.'),

-- The Shawshank Redemption
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006', 10, 'Hope is a good thing, maybe the best of things.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000006', 10, 'Never gets old no matter how many times you watch it.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000006', 9,  'Morgan Freeman''s narration carries the whole film beautifully.'),

-- Pulp Fiction
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000007', 9,  'Tarantino changed filmmaking forever with this one.'),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000007', 8,  'The dialogue is unlike anything else.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000007', 7,  'Great but non-linear structure can be jarring.'),

-- The Matrix
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000008', 9,  'Still looks incredible 25 years later.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000008', 8,  'A film that genuinely made me question reality.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000008', 9,  'Revolutionary action sequences and a great story.'),

-- Spirited Away
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000009', 10, 'The most imaginative animated film ever made.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000009', 9,  'Miyazaki''s magnum opus. Pure wonder.'),

-- Goodfellas
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000010', 9,  'Scorsese''s kinetic energy makes this impossible to look away from.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000010', 8,  'As good as gangster films get.'),

-- Breaking Bad
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000011', 10, 'The greatest TV show ever made. Walter White''s transformation is unmatched.'),
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000011', 10, 'Every season is better than the last. Ozymandias alone is a 10/10.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000011', 9,  'Took me 3 episodes to get hooked but then I couldn''t stop.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000011', 10, 'I have never been more stressed watching anything in my life.'),

-- Chernobyl
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000012', 10, 'The most important miniseries ever produced. Deeply unsettling.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000012', 10, 'Jared Harris should have won every award.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000012', 9,  'Horrifying, educational, and brilliantly made.'),

-- Stranger Things
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000013', 8,  'Season 1 is perfect. Great nostalgia and genuine scares.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000013', 7,  'Loses some steam after season 2 but still highly entertaining.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000013', 8,  'Kate Bush running up that hill. Iconic.'),

-- The Bear
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000014', 9,  'The most stressful show on TV — in the best possible way.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000014', 10, 'The episode "Review" made me cry twice. Absolutely brilliant.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000014', 9,  'Never thought a show about a restaurant would hit this hard.'),

-- Squid Game
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000015', 8,  'Gripping social commentary wrapped in a brutal survival game.'),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000015', 7,  'First half is excellent but it drags toward the end.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000015', 9,  'The glass bridge episode is one of the most tense hours of TV ever.'),

-- Oppenheimer
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000016', 9,  'Cillian Murphy deserved every award. A monumental film.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000016', 8,  'The Trinity test sequence is one of the best scenes in years.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000016', 9,  'Three hours and it never drags for a second.'),

-- Everything Everywhere All at Once
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000017', 9,  'Chaotic, emotional, hilarious. Nothing like it exists.'),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000017', 10, 'I didn''t expect to cry at a movie with googly eyes, and yet.'),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000017', 8,  'A sensory overload in the best way.'),

-- Shogun
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000018', 9,  'The best new show of 2024. Stunning production values.'),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000018', 10, 'Hiroyuki Sanada is extraordinary. A true epic.'),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000018', 9,  'Every episode feels like a film. Outstanding.');


-- ------------------------------------------------------------
-- WATCHLIST
-- watch_status: 'want_to_watch' | 'watched' | null
-- is_favourite: true/false — independent of watch_status
-- 'watching' removed; old 'watching' entries converted to 'watched'
-- 'favourite' is now a separate boolean, combinable with any status
-- ------------------------------------------------------------
insert into public.watchlist (user_id, media_id, watch_status, is_favourite) values

-- tpapon's list
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'watched',       false),
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'watched',       false),
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', null,             true),
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000011', null,             true),
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000014', 'watched',       false),
('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000018', 'want_to_watch', false),

-- alice
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006', null,             true),
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000011', 'watched',       false),
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000013', 'watched',       false),
('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000016', 'want_to_watch', false),

-- bob
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000012', null,             true),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000007', 'watched',       false),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000015', 'watched',       false),
('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000017', 'want_to_watch', false),

-- sara
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000003', null,             true),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000005', 'watched',       false),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000018', 'watched',       false),
('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000009', 'want_to_watch', false),

-- mike
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000009', null,             true),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000014', null,             true),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000006', 'watched',       false),
('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000008', 'want_to_watch', false),

-- priya
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000004', null,             true),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000011', null,             true),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000015', 'watched',       false),
('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000017', 'watched',       false),

-- james
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000010', 'watched',       false),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', 'watched',       false),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000018', null,             true),
('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000016', 'want_to_watch', false);


-- ------------------------------------------------------------
-- PEOPLE — directors, writers, producers, actors
-- IDs use the 33333333-... prefix pattern
-- photo_url is null for all seed entries (upload via Admin page)
-- ------------------------------------------------------------
insert into public.people (id, name, bio, born_year, died_year) values

-- Directors / creators (001–019)
('33333333-0000-0000-0000-000000000001', 'Francis Ford Coppola',
 'American director, producer, and screenwriter. Known for The Godfather trilogy and Apocalypse Now.',
 1939, null),
('33333333-0000-0000-0000-000000000002', 'Christopher Nolan',
 'British-American director celebrated for complex narratives and practical filmmaking. Creator of The Dark Knight trilogy, Inception, and Oppenheimer.',
 1970, null),
('33333333-0000-0000-0000-000000000003', 'Quentin Tarantino',
 'American filmmaker known for nonlinear storytelling, sharp dialogue, and stylized violence. Films include Pulp Fiction and Inglourious Basterds.',
 1963, null),
('33333333-0000-0000-0000-000000000004', 'Bong Joon-ho',
 'South Korean director and screenwriter. Won the Palme d''Or and the Academy Award for Best Picture for Parasite.',
 1969, null),
('33333333-0000-0000-0000-000000000005', 'Martin Scorsese',
 'American director and film historian. Known for Goodfellas, Taxi Driver, and The Departed.',
 1942, null),
('33333333-0000-0000-0000-000000000006', 'Frank Darabont',
 'American filmmaker who adapted two Stephen King novellas into acclaimed films: The Shawshank Redemption and The Green Mile.',
 1959, null),
('33333333-0000-0000-0000-000000000007', 'Lana Wachowski',
 'American filmmaker best known for co-creating The Matrix franchise.',
 1965, null),
('33333333-0000-0000-0000-000000000008', 'Hayao Miyazaki',
 'Japanese animator and co-founder of Studio Ghibli. Widely regarded as one of the greatest animators in history.',
 1941, null),
('33333333-0000-0000-0000-000000000009', 'Vince Gilligan',
 'American writer and producer, best known as the creator of Breaking Bad and its prequel Better Call Saul.',
 1967, null),
('33333333-0000-0000-0000-000000000010', 'Craig Mazin',
 'American screenwriter and producer, creator of the HBO miniseries Chernobyl and co-creator of The Last of Us.',
 1971, null),
('33333333-0000-0000-0000-000000000011', 'Matt Duffer',
 'American filmmaker, one half of the Duffer Brothers duo, co-creator and showrunner of Stranger Things.',
 1984, null),
('33333333-0000-0000-0000-000000000012', 'Ross Duffer',
 'American filmmaker, one half of the Duffer Brothers duo, co-creator and showrunner of Stranger Things.',
 1984, null),
('33333333-0000-0000-0000-000000000013', 'Hwang Dong-hyuk',
 'South Korean filmmaker and creator of the global phenomenon Squid Game.',
 1971, null),
('33333333-0000-0000-0000-000000000014', 'Christopher Storer',
 'American writer and director, creator and showrunner of The Bear.',
 1986, null),
('33333333-0000-0000-0000-000000000015', 'Daniel Kwan',
 'American filmmaker, one half of the directing duo Daniels. Co-directed Everything Everywhere All at Once.',
 1988, null),
('33333333-0000-0000-0000-000000000016', 'Daniel Scheinert',
 'American filmmaker, one half of the directing duo Daniels. Co-directed Everything Everywhere All at Once.',
 1987, null),
('33333333-0000-0000-0000-000000000017', 'Rachel Kondo',
 'Writer and showrunner of the award-winning 2024 FX adaptation of Shōgun.',
 null, null),
('33333333-0000-0000-0000-000000000018', 'Mario Puzo',
 'American author and screenwriter. Best known for writing the novel and Academy Award-winning screenplay for The Godfather.',
 1920, 1999),
('33333333-0000-0000-0000-000000000019', 'Emma Thomas',
 'British film producer and long-time collaborator of Christopher Nolan, producing every film he has made since The Following.',
 1971, null),

-- Actors (020–046)
('33333333-0000-0000-0000-000000000020', 'Marlon Brando',
 'Considered one of the greatest actors of all time. Won the Academy Award for Best Actor for The Godfather and On the Waterfront.',
 1924, 2004),
('33333333-0000-0000-0000-000000000021', 'Al Pacino',
 'American actor known for his intense method performances. Iconic in The Godfather trilogy, Scarface, and Serpico.',
 1940, null),
('33333333-0000-0000-0000-000000000022', 'Christian Bale',
 'Welsh actor known for extreme physical transformations. Best known for playing Batman in Christopher Nolan''s Dark Knight trilogy.',
 1974, null),
('33333333-0000-0000-0000-000000000023', 'Heath Ledger',
 'Australian actor who delivered a legendary, posthumous Oscar-winning performance as the Joker in The Dark Knight.',
 1979, 2008),
('33333333-0000-0000-0000-000000000024', 'Leonardo DiCaprio',
 'American actor and environmental activist. Known for Titanic, The Revenant, and his frequent collaborations with Martin Scorsese.',
 1974, null),
('33333333-0000-0000-0000-000000000025', 'Matthew McConaughey',
 'American actor who reinvented his career in the 2010s with acclaimed dramatic roles in Dallas Buyers Club and Interstellar.',
 1969, null),
('33333333-0000-0000-0000-000000000026', 'Tim Robbins',
 'American actor and filmmaker, best known for his lead role in The Shawshank Redemption and his Oscar-winning turn in Mystic River.',
 1958, null),
('33333333-0000-0000-0000-000000000027', 'Morgan Freeman',
 'American actor with one of the most distinctive voices in film. Starred in The Shawshank Redemption, Se7en, and Million Dollar Baby.',
 1937, null),
('33333333-0000-0000-0000-000000000028', 'John Travolta',
 'American actor who experienced a major career resurgence with Pulp Fiction. Also known for Saturday Night Fever and Grease.',
 1954, null),
('33333333-0000-0000-0000-000000000029', 'Samuel L. Jackson',
 'American actor and one of the highest-grossing performers of all time. A frequent collaborator with Quentin Tarantino.',
 1948, null),
('33333333-0000-0000-0000-000000000030', 'Keanu Reeves',
 'Canadian actor best known for playing Neo in The Matrix trilogy and the title role in the John Wick franchise.',
 1964, null),
('33333333-0000-0000-0000-000000000031', 'Bryan Cranston',
 'American actor who won four Primetime Emmy Awards for his portrayal of Walter White in Breaking Bad.',
 1956, null),
('33333333-0000-0000-0000-000000000032', 'Aaron Paul',
 'American actor who won three Primetime Emmy Awards for his role as Jesse Pinkman in Breaking Bad.',
 1979, null),
('33333333-0000-0000-0000-000000000033', 'Jared Harris',
 'British actor best known for his Emmy-nominated performance as scientist Valery Legasov in the HBO miniseries Chernobyl.',
 1961, null),
('33333333-0000-0000-0000-000000000034', 'Millie Bobby Brown',
 'British actress who rose to fame as Eleven in Stranger Things, becoming one of the youngest people named to Time''s 100 most influential list.',
 2004, null),
('33333333-0000-0000-0000-000000000035', 'Jeremy Allen White',
 'American actor who won both a Golden Globe and Emmy Award for his lead role as Carmen ''Carmy'' Berzatto in The Bear.',
 1991, null),
('33333333-0000-0000-0000-000000000036', 'Lee Jung-jae',
 'South Korean actor who won the Primetime Emmy for Outstanding Lead Actor for his role as Seong Gi-hun in Squid Game.',
 1972, null),
('33333333-0000-0000-0000-000000000037', 'Cillian Murphy',
 'Irish actor who won the Academy Award for Best Actor for his portrayal of J. Robert Oppenheimer in Christopher Nolan''s biopic.',
 1976, null),
('33333333-0000-0000-0000-000000000038', 'Michelle Yeoh',
 'Malaysian actress who won the Academy Award for Best Actress for Everything Everywhere All at Once, the first Asian winner in that category.',
 1962, null),
('33333333-0000-0000-0000-000000000039', 'Ke Huy Quan',
 'Vietnamese-American actor who won the Academy Award for Best Supporting Actor for Everything Everywhere All at Once after a 20-year acting hiatus.',
 1971, null),
('33333333-0000-0000-0000-000000000040', 'Hiroyuki Sanada',
 'Japanese actor and martial artist with a five-decade career. Starred in and executive-produced the 2024 Emmy-winning Shōgun series.',
 1960, null),
('33333333-0000-0000-0000-000000000041', 'Song Kang-ho',
 'South Korean actor widely regarded as one of Korea''s greatest film stars. Known for Parasite, Memories of Murder, and The Host.',
 1967, null),
('33333333-0000-0000-0000-000000000042', 'Stellan Skarsgård',
 'Swedish actor with a prolific international career. Known for Chernobyl, the Avengers franchise, and Dune.',
 1951, null),
('33333333-0000-0000-0000-000000000043', 'Ray Liotta',
 'American actor best known for his captivating lead performance as Henry Hill in Goodfellas.',
 1954, 2022),
('33333333-0000-0000-0000-000000000044', 'Robert De Niro',
 'American actor widely considered one of the greatest of all time. A defining collaborator of Martin Scorsese across decades.',
 1943, null),
('33333333-0000-0000-0000-000000000045', 'Joe Pesci',
 'American actor known for explosive supporting performances, particularly in Martin Scorsese films. Won the Oscar for Goodfellas.',
 1943, null),
('33333333-0000-0000-0000-000000000046', 'Anne Hathaway',
 'American actress who has won the Academy Award, Emmy, and Grammy. Starred alongside Matthew McConaughey in Interstellar.',
 1982, null);


-- ------------------------------------------------------------
-- MEDIA CREDITS — cast and crew for all 18 seed titles
-- ------------------------------------------------------------
insert into public.media_credits (media_id, person_id, role, character_name, credit_order) values

-- The Godfather
('11111111-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'director', null, 1),
('11111111-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000018', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000020', 'actor', 'Don Vito Corleone',  1),
('11111111-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000021', 'actor', 'Michael Corleone',  2),

-- The Dark Knight
('11111111-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'director', null, 1),
('11111111-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000019', 'producer', null, 1),
('11111111-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000022', 'actor', 'Bruce Wayne / Batman', 1),
('11111111-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000023', 'actor', 'The Joker',            2),

-- Inception
('11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 'director', null, 1),
('11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000019', 'producer', null, 1),
('11111111-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000024', 'actor', 'Dom Cobb', 1),

-- Parasite
('11111111-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000004', 'director', null, 1),
('11111111-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000004', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000041', 'actor', 'Ki-taek', 1),

-- Interstellar
('11111111-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000002', 'director', null, 1),
('11111111-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000002', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000019', 'producer', null, 1),
('11111111-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000025', 'actor', 'Cooper',            1),
('11111111-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000046', 'actor', 'Dr. Amelia Brand',  2),

-- The Shawshank Redemption
('11111111-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000006', 'director', null, 1),
('11111111-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000006', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000026', 'actor', 'Andy Dufresne',             1),
('11111111-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000027', 'actor', 'Ellis Boyd ''Red'' Redding', 2),

-- Pulp Fiction
('11111111-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000003', 'director', null, 1),
('11111111-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000003', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000028', 'actor', 'Vincent Vega',   1),
('11111111-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000029', 'actor', 'Jules Winnfield', 2),

-- The Matrix
('11111111-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000007', 'director', null, 1),
('11111111-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000007', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000030', 'actor', 'Neo', 1),

-- Spirited Away
('11111111-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000008', 'director', null, 1),
('11111111-0000-0000-0000-000000000009', '33333333-0000-0000-0000-000000000008', 'writer',   null, 1),

-- Goodfellas
('11111111-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000005', 'director', null, 1),
('11111111-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000005', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000043', 'actor', 'Henry Hill',    1),
('11111111-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000044', 'actor', 'Jimmy Conway',  2),
('11111111-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000045', 'actor', 'Tommy DeVito',  3),

-- Breaking Bad
('11111111-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000009', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000009', 'producer', null, 1),
('11111111-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000031', 'actor', 'Walter White',  1),
('11111111-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000032', 'actor', 'Jesse Pinkman', 2),

-- Chernobyl
('11111111-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000010', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000010', 'producer', null, 1),
('11111111-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000033', 'actor', 'Valery Legasov',  1),
('11111111-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000042', 'actor', 'Boris Shcherbina', 2),

-- Stranger Things
('11111111-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000011', 'director', null, 1),
('11111111-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000011', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000012', 'director', null, 2),
('11111111-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000012', 'writer',   null, 2),
('11111111-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000034', 'actor', 'Eleven', 1),

-- The Bear
('11111111-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000014', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000014', 'producer', null, 1),
('11111111-0000-0000-0000-000000000014', '33333333-0000-0000-0000-000000000035', 'actor', 'Carmen ''Carmy'' Berzatto', 1),

-- Squid Game
('11111111-0000-0000-0000-000000000015', '33333333-0000-0000-0000-000000000013', 'director', null, 1),
('11111111-0000-0000-0000-000000000015', '33333333-0000-0000-0000-000000000013', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000015', '33333333-0000-0000-0000-000000000036', 'actor', 'Seong Gi-hun', 1),

-- Oppenheimer
('11111111-0000-0000-0000-000000000016', '33333333-0000-0000-0000-000000000002', 'director', null, 1),
('11111111-0000-0000-0000-000000000016', '33333333-0000-0000-0000-000000000002', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000016', '33333333-0000-0000-0000-000000000019', 'producer', null, 1),
('11111111-0000-0000-0000-000000000016', '33333333-0000-0000-0000-000000000037', 'actor', 'J. Robert Oppenheimer', 1),

-- Everything Everywhere All at Once
('11111111-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000015', 'director', null, 1),
('11111111-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000015', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000016', 'director', null, 2),
('11111111-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000016', 'writer',   null, 2),
('11111111-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000038', 'actor', 'Evelyn Wang',   1),
('11111111-0000-0000-0000-000000000017', '33333333-0000-0000-0000-000000000039', 'actor', 'Waymond Wang',  2),

-- Shōgun
('11111111-0000-0000-0000-000000000018', '33333333-0000-0000-0000-000000000017', 'writer',   null, 1),
('11111111-0000-0000-0000-000000000018', '33333333-0000-0000-0000-000000000040', 'producer', null, 1),
('11111111-0000-0000-0000-000000000018', '33333333-0000-0000-0000-000000000040', 'actor', 'Yoshii Toranaga', 1);
