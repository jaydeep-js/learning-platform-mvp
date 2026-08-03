/* RLS verification suite — runs against the LIVE hosted Supabase project.
   Requires .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY, and an admin created by scripts/create-admin.ts
   whose credentials are in ADMIN_EMAIL / ADMIN_PASSWORD.

   Run:  npm run test:rls
   The suite self-skips when the env vars are absent so plain `vitest` stays
   green on machines without a linked project. Test users it creates are
   deleted again in afterAll via the service role. */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import 'dotenv/config'
import type { Database } from '../src/lib/database.types'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

const configured = Boolean(url && anonKey && serviceKey && adminEmail && adminPassword)

type Client = SupabaseClient<Database>

function anonClient(): Client {
  return createClient<Database>(url!, anonKey!, { auth: { persistSession: false } })
}

describe.skipIf(!configured)('RLS', () => {
  const anon = anonClient()
  const member = anonClient()
  const admin = anonClient()
  const service = createClient<Database>(url ?? 'http://unset', serviceKey ?? 'unset', {
    auth: { persistSession: false },
  })
  let memberId = ''
  /* A real domain — Supabase's email validation rejects example.com. No mail
     is ever sent (confirmation is disabled), so the address needn't exist. */
  const memberEmail = `primer.rls.${Date.now()}@gmail.com`

  beforeAll(async () => {
    /* Created via the admin API (not signUp) so the suite runs regardless of
       the project's "Confirm email" setting and never sends real mail. */
    const { data: created, error: cErr } = await service.auth.admin.createUser({
      email: memberEmail,
      password: 'test-password-123',
      email_confirm: true,
      user_metadata: { full_name: 'RLS Member' },
    })
    if (cErr) throw cErr
    memberId = created.user!.id

    const { error: mErr } = await member.auth.signInWithPassword({ email: memberEmail, password: 'test-password-123' })
    if (mErr) throw mErr

    const { error: aErr } = await admin.auth.signInWithPassword({ email: adminEmail!, password: adminPassword! })
    if (aErr) throw aErr
  }, 30_000)

  afterAll(async () => {
    if (memberId) await service.auth.admin.deleteUser(memberId)
  })

  // --- anon: the catalog must be readable without error (catches the
  // --- is_admin() execute-grant bug — policies run AS the querying role).
  it('anon reads all 8 categories', async () => {
    const { data, error } = await anon.from('categories').select('slug')
    expect(error).toBeNull()
    expect(data).toHaveLength(8)
  })

  it('anon sees only published topics', async () => {
    const { data, error } = await anon.from('topics').select('slug, status')
    expect(error).toBeNull()
    expect(data!.length).toBe(117) // 120 seeded minus 3 draft/review
    expect(data!.every((t) => t.status === 'published')).toBe(true)
  })

  it('anon cannot read lessons of a non-published topic', async () => {
    const { data: topic } = await service.from('topics').select('id').eq('slug', 'ml-foundations-foundations').single()
    const { data, error } = await anon.from('lessons').select('id').eq('topic_id', topic!.id)
    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('anon cannot write to the catalog', async () => {
    const { error } = await anon.from('categories').insert({ name: 'Hacked', sort_order: 99 })
    expect(error).not.toBeNull()
  })

  it('anon cannot call dashboard_stats', async () => {
    const { error } = await anon.rpc('dashboard_stats', { tz_offset_minutes: 0 })
    expect(error).not.toBeNull()
  })

  it('anon can call search_topics and gets published results', async () => {
    const { data, error } = await anon.rpc('search_topics', { q: 'javascript' })
    expect(error).toBeNull()
    expect(data!.some((r) => r.slug === 'javascript-basics')).toBe(true)
    expect(data!.some((r) => r.slug === 'ml-foundations-foundations')).toBe(false)
  })

  // --- member: own-row scoping + escalation blocked
  it('member writes and reads their own progress only', async () => {
    const { data: lesson } = await service.from('lessons').select('id, topic_id, minutes').eq('sort_order', 1).limit(1).single()
    const { error: insErr } = await member.from('lesson_progress').insert({
      user_id: memberId,
      lesson_id: lesson!.id,
      topic_id: lesson!.topic_id,
      minutes: lesson!.minutes,
    })
    expect(insErr).toBeNull()

    const { data: mine } = await member.from('lesson_progress').select('lesson_id')
    expect(mine).toHaveLength(1)

    // a different client (admin) sees none of the member's rows
    const { data: others } = await admin.from('lesson_progress').select('lesson_id')
    expect(others).toHaveLength(0)
  })

  it('member cannot insert progress for another user', async () => {
    const { data: lesson } = await service.from('lessons').select('id, topic_id, minutes').eq('sort_order', 2).limit(1).single()
    const { error } = await member.from('lesson_progress').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      lesson_id: lesson!.id,
      topic_id: lesson!.topic_id,
      minutes: lesson!.minutes,
    })
    expect(error).not.toBeNull()
  })

  it('member can update their name but not their role', async () => {
    const { error: nameErr } = await member.from('profiles').update({ full_name: 'Renamed Member' }).eq('id', memberId)
    expect(nameErr).toBeNull()

    // column-level grant blocks the whole statement (42501)
    const { error: roleErr } = await member
      .from('profiles')
      .update({ role: 'admin' } as never)
      .eq('id', memberId)
    expect(roleErr).not.toBeNull()

    const { data: check } = await service.from('profiles').select('role').eq('id', memberId).single()
    expect(check!.role).toBe('learner')
  })

  it('member cannot write to the catalog', async () => {
    const { error } = await member.from('topics').insert({ title: 'Sneaky topic' })
    expect(error).not.toBeNull()
  })

  // --- admin: catalog management + the two seeded-bug regression checks
  it('admin reads a draft topic by slug (Preview link support)', async () => {
    const { data, error } = await admin.from('topics').select('slug, status').eq('slug', 'ml-foundations-foundations').single()
    expect(error).toBeNull()
    expect(data!.status).toBe('draft')
  })

  it('admin inserts into each catalog table post-seed (sequence resync check)', async () => {
    const { data: cat, error: catErr } = await admin
      .from('categories')
      .insert({ name: 'RLS Test Category', sort_order: 99 })
      .select('id, slug')
      .single()
    expect(catErr).toBeNull() // duplicate-PK here means the seed forgot setval

    const { data: sub } = await admin
      .from('subcategories')
      .insert({ category_id: cat!.id, name: 'RLS Test Sub', sort_order: 1 })
      .select('id')
      .single()
    const { data: topic } = await admin
      .from('topics')
      .insert({ subcategory_id: sub!.id, title: 'RLS Test Topic', status: 'published', sort_order: 1 })
      .select('id')
      .single()
    const { data: unit } = await admin
      .from('units')
      .insert({ topic_id: topic!.id, title: 'Unit 01', sort_order: 1 })
      .select('id')
      .single()
    const { error: lessonErr } = await admin
      .from('lessons')
      .insert({ topic_id: topic!.id, unit_id: unit!.id, title: 'RLS Test Lesson', minutes: 5, sort_order: 1 })
    expect(lessonErr).toBeNull()

    // slug trigger: generated + collision suffix
    const { data: cat2 } = await admin
      .from('categories')
      .insert({ name: 'RLS Test Category', sort_order: 100 })
      .select('id, slug')
      .single()
    expect(cat!.slug).toBe('rls-test-category')
    expect(cat2!.slug).toBe('rls-test-category-2')

    // cascade: deleting the subcategory unlinks (not deletes) the topic
    await admin.from('subcategories').delete().eq('id', sub!.id)
    const { data: unlinked } = await admin.from('topics').select('subcategory_id').eq('id', topic!.id).single()
    expect(unlinked!.subcategory_id).toBeNull()

    // unlinked topics are invisible to search even though published
    const { data: search } = await anon.rpc('search_topics', { q: 'RLS Test Topic' })
    expect(search).toHaveLength(0)

    // cascade: topic delete removes lessons and any progress
    const { data: lesson } = await service.from('lessons').select('id, topic_id, minutes').eq('topic_id', topic!.id).single()
    await member.from('lesson_progress').insert({
      user_id: memberId,
      lesson_id: lesson!.id,
      topic_id: lesson!.topic_id,
      minutes: lesson!.minutes,
    })
    await admin.from('topics').delete().eq('id', topic!.id)
    const { data: gone } = await service.from('lesson_progress').select('lesson_id').eq('topic_id', topic!.id)
    expect(gone).toHaveLength(0)

    // clean up the test categories
    await admin.from('categories').delete().in('id', [cat!.id, cat2!.id])
  }, 30_000)
})

if (!configured) {
  console.warn('RLS suite skipped: set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD in .env')
}
