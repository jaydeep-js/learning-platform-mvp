-- lessons.topic_id / lesson_progress.topic_id were only covered by the
-- composite FKs (to units/lessons), so PostgREST had no lessons→topics
-- relationship to embed through (400: "Could not find a relationship").
-- Add the direct FKs: enables `topics!inner(...)` embeds and gives topic
-- deletion a direct cascade path alongside the composite one.

alter table public.lessons
  add constraint lessons_topic_id_fkey
  foreign key (topic_id) references public.topics (id) on delete cascade;

alter table public.lesson_progress
  add constraint lesson_progress_topic_id_fkey
  foreign key (topic_id) references public.topics (id) on delete cascade;
