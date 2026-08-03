/* Provisions the e2e member account via the service role (independent of the
   project's "Confirm email" setting) and resets its learner state so every
   run starts clean. */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

export const E2E_MEMBER = { email: 'primer.e2e.member@gmail.com', password: 'e2e-password-123' }

export default async function globalSetup() {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('E2E needs VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
  }
  const svc = createClient(url, serviceKey, { auth: { persistSession: false } })

  const { data: created, error } = await svc.auth.admin.createUser({
    email: E2E_MEMBER.email,
    password: E2E_MEMBER.password,
    email_confirm: true,
    user_metadata: { full_name: 'Test Learner' },
  })
  let userId = created?.user?.id
  if (error) {
    if (!error.message.toLowerCase().includes('already')) throw error
    const { data: list } = await svc.auth.admin.listUsers()
    userId = list.users.find((u) => u.email === E2E_MEMBER.email)?.id
  }
  if (!userId) throw new Error('Could not provision the e2e member')

  for (const table of ['lesson_progress', 'bookmarks', 'recent_views'] as const) {
    const { error: delError } = await svc.from(table).delete().eq('user_id', userId)
    if (delError) throw delError
  }
}
