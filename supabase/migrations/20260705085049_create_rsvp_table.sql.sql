/*
# Create rsvp table for wedding invitation website

1. Purpose
- Stores RSVP responses submitted by wedding guests via the public invitation website.
- This is a single-tenant, no-auth application: guests do not sign in. The frontend
  uses the Supabase anon key, so policies must allow the anon role to insert and read.

2. New Tables
- `rsvp`
  - `id`         uuid PRIMARY KEY (auto-generated)
  - `name`       text NOT NULL        -- guest full name
  - `email`      text                 -- optional contact email
  - `phone`      text                 -- optional contact phone
  - `attending`  text NOT NULL        -- 'yes' | 'no' | 'maybe'
  - `guests`     integer DEFAULT 1    -- number of accompanying guests
  - `meal`       text                 -- optional dietary preference / meal choice
  - `message`    text                 -- optional well-wishes note
  - `created_at` timestamptz DEFAULT now()

3. Security
- RLS enabled on `rsvp`.
- This is a no-auth public wedding invitation; guests submit RSVPs without signing in.
- SELECT/INSERT allowed for anon + authenticated (guests can submit and the couple can read).
- UPDATE/DELETE restricted to authenticated (the couple/admin can manage responses later).
- `USING (true)` on SELECT/INSERT is acceptable here because RSVP data is intentionally
  public/shared for this wedding (no per-user ownership concept exists).
*/

CREATE TABLE IF NOT EXISTS rsvp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  attending text NOT NULL CHECK (attending IN ('yes','no','maybe')),
  guests integer NOT NULL DEFAULT 1 CHECK (guests >= 0 AND guests <= 10),
  meal text,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_rsvp" ON rsvp;
CREATE POLICY "anon_select_rsvp"
  ON rsvp FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon_insert_rsvp" ON rsvp;
CREATE POLICY "anon_insert_rsvp"
  ON rsvp FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_rsvp" ON rsvp;
CREATE POLICY "auth_update_rsvp"
  ON rsvp FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_rsvp" ON rsvp;
CREATE POLICY "auth_delete_rsvp"
  ON rsvp FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS rsvp_created_at_idx ON rsvp (created_at DESC);
