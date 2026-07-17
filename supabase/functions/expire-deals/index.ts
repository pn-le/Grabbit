// Expiry sweep (FR-2). Schedule hourly, e.g. with Supabase cron:
//   select cron.schedule('expire-deals', '0 * * * *',
//     $$select net.http_post('https://<ref>.functions.supabase.co/expire-deals',
//       headers => '{"Authorization": "Bearer <service-role-key>"}'::jsonb)$$);
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const { data, error } = await supabase.rpc('expire_deals')
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ expired: data }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
