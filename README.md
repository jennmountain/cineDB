# CineDB — IMDb-style Movie Database

A React + Supabase prototype for teaching purposes (CS 436/636, UMass Boston).

---

## Building the App from Scratch

Follow these steps in order to get the app running on your own Supabase project.

### Step 1 — Create a Supabase project

Go to [https://supabase.com](https://supabase.com), create a new project, and wait for it to finish provisioning.

### Step 2 — Disable email confirmation

New sign-ups require email confirmation by default, which is inconvenient for a class project. Turn it off:

> **Supabase Dashboard → Authentication → Sign In / Providers → Email → turn OFF "Confirm email"**

This allows users to log in immediately after signing up with no email verification step.

> **Important:** Do this *before* running the seed data, otherwise newly seeded accounts may not be able to log in.

### Step 3 — Run the migration

In **Supabase Dashboard → SQL Editor**, paste and run the full contents of `supabase_migration.sql`.

This creates:
- All 7 tables: `profiles`, `media`, `reviews`, `watchlist` (with `watch_status` + `is_favourite` columns), `people`, `media_credits`, `saved_queries`
- Triggers (auto-create profile on sign-up, keep `avg_rating` in sync)
- Row Level Security (RLS) policies for all tables
- Full-text search index on `media`
- The `posters` storage bucket with access policies
- The `run_query` RPC function for the SQL Explorer

### Step 4 — Run the seed data

In **Supabase Dashboard → SQL Editor**, paste and run the full contents of `seed_data.sql`.

This populates the database with:
- 18 movies and TV series
- 7 user accounts (see credentials below)
- Reviews, watchlist entries
- 46 people (directors, actors, writers, producers)
- Cast & crew credits for all 18 titles
- Default saved queries for the SQL Explorer

### Step 5 — Configure the React app

Open the `.env` file in the project root and replace the values with your own project's URL and anon key:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in: **Supabase Dashboard → Project Settings → API**

### Step 6 — Install and run

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

---

## Test Accounts

### Admin account

Use this account to add/edit/delete media, manage people & credits, and upload poster images:

| Email | Password |
|---|---|
| `tpapon@umb.edu` | `cs636@umb` |

### Regular user accounts

Use any of these to experience the app as a normal user (browse, review, watchlist):

| Email | Username | Password |
|---|---|---|
| `alice@example.com` | `alice_m` | `pass1234` |
| `bob@example.com` | `bob_k` | `pass1234` |
| `sara@example.com` | `sara_j` | `pass1234` |
| `mike@example.com` | `mike_w` | `pass1234` |
| `priya@example.com` | `priya_r` | `pass1234` |
| `james@example.com` | `james_t` | `pass1234` |

You can also sign up for a brand new account via the app's Sign Up page.

---

## Features

| Feature | Notes |
|---|---|
| Browse & search | Full-text search + filter by type/genre, sort by rating/year/title |
| Movie detail page | Poster, overview, runtime, avg rating, cast & crew, reviews |
| Cast & crew | Click any person's name to see their bio and full filmography |
| User accounts | Sign up / sign in via Supabase Auth (no email confirmation needed) |
| Ratings & reviews | 1–10 star rating + written review, one per user per title |
| My List | Save media as Want to Watch / Watched, mark as Favourite independently |
| Admin page | Add/edit/delete media and people, manage credits, upload poster images |
| SQL Explorer | Run SELECT queries against the live database, save your own queries |

---

## Promoting a user to admin

If you sign up as a new user and want admin access, run this in the SQL Editor:

```sql
update profiles set is_admin = true where username = 'yourusername';
```

---

## Project structure

```
src/
  App.js                  — auth state, page routing
  index.js / index.css    — entry point
  config/
    supabaseClient.js     — Supabase client (reads .env)
  components/
    Navbar.js             — top navigation bar
    AuthPage.js           — sign in / sign up
    BrowsePage.js         — browse & search grid
    MediaCard.js          — card used in browse + watchlist
    DetailPage.js         — movie/TV detail, reviews, watchlist buttons
    PersonPage.js         — person bio + filmography
    WatchlistPage.js      — My List with status tabs (All / Favourites / Want to Watch / Watched)
    AdminPage.js          — admin CRUD for media and people, image upload
    SqlPage.js            — SQL explorer
```

---

## How poster images work

Images are stored in Supabase Storage in the `posters` bucket.

- Admins upload via the Admin page — the file path is saved to `media.poster_url`
- People photos are stored under the `people/` prefix in the same bucket
- The app resolves display URLs using:
  ```js
  supabase.storage.from('posters').getPublicUrl(media.poster_url)
  ```
- The bucket is public, so no authentication is needed to view images

---

## SQL Explorer

The explorer uses a Postgres function `run_query(text)` that safely wraps SELECT queries.

- Only `SELECT` statements are allowed — anything else raises an error
- The function is granted only to authenticated users
- Trailing semicolons are stripped automatically so queries work either way
