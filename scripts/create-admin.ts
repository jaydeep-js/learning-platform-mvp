/* Creates (or promotes) the admin user via the service-role key.
   Role changes are deliberately impossible through the API (column-level
   grants block them), so this script is the only way to mint an admin.

   Run:  npx tsx scripts/create-admin.ts admin@example.com yourpassword
   Requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env. */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const [email, password] = process.argv.slice(2)

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}
if (!email || !password) {
  console.error('Usage: npx tsx scripts/create-admin.ts <email> <password>')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

async function main() {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Admin' },
  })

  let userId = created?.user?.id
  if (createError) {
    if (!createError.message.toLowerCase().includes('already')) {
      throw createError
    }
    // Existing user — look them up and promote instead.
    const { data: list, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw listError
    userId = list.users.find((u) => u.email === email)?.id
    if (!userId) throw new Error(`User ${email} exists but could not be found`)
    console.log('User already exists — promoting to admin.')
  }

  const { error: roleError } = await admin.from('profiles').update({ role: 'admin' }).eq('id', userId!)
  if (roleError) throw roleError

  console.log(`Admin ready: ${email} (${userId})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
