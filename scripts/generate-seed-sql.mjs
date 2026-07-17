// Regenerates supabase/seed.sql store inserts from src/data/stores.ts so the
// two stay in sync. Run: node scripts/generate-seed-sql.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'src/data/stores.ts'), 'utf8')

const storeRe =
  /s\(\s*'([^']+)',\s*'([^']+)',\s*'((?:[^'\\]|\\')*)',\s*'((?:[^'\\]|\\')*)',\s*'([^']+)',\s*(-?[\d.]+),\s*(-?[\d.]+),?\s*\)/g

const q = (s) => `'${s.replace(/\\'/g, "'").replace(/'/g, "''")}'`
const rows = []
for (const m of src.matchAll(storeRe)) {
  const [, id, chainId, name, address, city, lat, lng] = m
  rows.push(`  (${q(id)}, ${q(chainId)}, ${q(name)}, ${q(address)}, ${lat}, ${lng}, ${q(city)}, 'MA')`)
}
if (rows.length < 50) throw new Error(`Only matched ${rows.length} stores — regex drift?`)

const storesSql = `insert into stores (id, chain_id, name, address, lat, lng, city, state) values\n${rows.join(',\n')}\non conflict (id) do nothing;\n`

const template = readFileSync(join(root, 'supabase/seed.template.sql'), 'utf8')
writeFileSync(join(root, 'supabase/seed.sql'), template.replace('-- {{STORES}}', storesSql))
console.log(`seed.sql written with ${rows.length} stores`)
