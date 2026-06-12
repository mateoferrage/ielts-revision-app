-- Run this entire file in the Supabase SQL editor

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

-- RLS
alter table user_progress enable row level security;
alter table sessions enable row level security;
alter table results enable row level security;

create policy "users own progress" on user_progress for all using (auth.uid() = user_id);
create policy "users own sessions" on sessions for all using (auth.uid() = user_id);
create policy "users own results" on results for all
  using (session_id in (select id from sessions where user_id = auth.uid()));
create policy "questions are public" on questions for select using (true);

-- Seed: Reading questions
insert into questions (section, type, difficulty, content, theme) values
(
  'reading', 'true_false', 1,
  '{
    "passage": "Climate change refers to long-term shifts in global temperatures and weather patterns. While some climate change is natural, since the 1800s human activities have been the main driver, primarily due to burning fossil fuels.",
    "text": "According to the passage, human activities are the main driver of climate change since the 1800s.",
    "correct_answer": "TRUE",
    "options": ["TRUE", "FALSE", "NOT GIVEN"]
  }',
  'environment'
),
(
  'reading', 'true_false', 1,
  '{
    "passage": "Climate change refers to long-term shifts in global temperatures and weather patterns. While some climate change is natural, since the 1800s human activities have been the main driver, primarily due to burning fossil fuels.",
    "text": "Scientists believe fossil fuels were discovered in the 1800s.",
    "correct_answer": "NOT GIVEN",
    "options": ["TRUE", "FALSE", "NOT GIVEN"]
  }',
  'environment'
),
(
  'reading', 'mcq', 2,
  '{
    "passage": "Artificial intelligence (AI) is transforming industries at an unprecedented pace. In healthcare, AI algorithms can diagnose diseases with accuracy comparable to specialist physicians. In finance, machine learning models detect fraudulent transactions in milliseconds.",
    "text": "Which sector is mentioned as using AI to identify illegal financial activity?",
    "options": ["Healthcare", "Education", "Finance", "Manufacturing"],
    "correct_answer": "Finance"
  }',
  'technology'
),
(
  'reading', 'true_false', 2,
  '{
    "passage": "The Great Barrier Reef, located off the coast of Queensland, Australia, is the world''s largest coral reef system. It stretches over 2,300 kilometres and is visible from outer space. The reef supports an extraordinary diversity of marine life, including over 1,500 species of fish.",
    "text": "The Great Barrier Reef can be seen from space.",
    "correct_answer": "TRUE",
    "options": ["TRUE", "FALSE", "NOT GIVEN"]
  }',
  'environment'
),
(
  'reading', 'mcq', 1,
  '{
    "passage": "The Industrial Revolution, which began in Britain in the late 18th century, marked a major turning point in history. It involved the transition from hand production to machine manufacturing, the development of iron and steel industries, and the widespread use of steam power.",
    "text": "Where did the Industrial Revolution begin?",
    "options": ["France", "Germany", "Britain", "United States"],
    "correct_answer": "Britain"
  }',
  'history'
);
