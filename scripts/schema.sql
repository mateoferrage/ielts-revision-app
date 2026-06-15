-- IELTS Revision App — database schema (tables + RLS)
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste → Run
-- Then run scripts/seed-reading.sql to load sample reading questions.

create extension if not exists "uuid-ossp";

create table questions (
  id uuid primary key default uuid_generate_v4(),
  section text not null check (section in ('listening','reading','writing','speaking')),
  type text not null,
  difficulty int not null check (difficulty between 1 and 3),
  content jsonb not null,
  theme text,
  created_at timestamptz default now()
);

create table user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  question_id uuid references questions on delete cascade,
  ease_factor float default 2.5,
  interval int default 1,
  repetitions int default 0,
  next_review date default current_date,
  last_score int,
  updated_at timestamptz default now(),
  unique(user_id, question_id)
);

create table sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  section text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  score float,
  questions_count int
);

create table results (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions on delete cascade,
  question_id uuid references questions on delete cascade,
  user_answer jsonb,
  is_correct boolean,
  gemini_feedback text,
  band_score float,
  answered_at timestamptz default now()
);

-- Row Level Security
alter table user_progress enable row level security;
alter table sessions enable row level security;
alter table results enable row level security;

create policy "users own progress" on user_progress for all using (auth.uid() = user_id);
create policy "users own sessions" on sessions for all using (auth.uid() = user_id);
create policy "users own results" on results for all
  using (session_id in (select id from sessions where user_id = auth.uid()));
create policy "questions are public" on questions for select using (true);
