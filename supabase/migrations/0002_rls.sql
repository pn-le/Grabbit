-- Row Level Security: anonymous browse, authenticated write via RPCs only.

alter table chains enable row level security;
alter table stores enable row level security;
alter table users enable row level security;
alter table deals enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;
alter table points_ledger enable row level security;
alter table coupons enable row level security;

-- Public read of reference + feed data (FR-13: browse without an account)
create policy "chains readable by all" on chains for select using (true);
create policy "stores readable by all" on stores for select using (true);
create policy "coupons readable by all" on coupons for select using (true);

-- Deals: everyone sees active deals; posters also see their own expired ones (FR-2)
create policy "active deals readable" on deals for select
  using (status = 'active' or posted_by = auth.uid());

-- Profiles: public leaderboard fields are read via RPC; row readable by all
-- (email is never selected by the client; keep it out of client queries)
create policy "profiles readable" on users for select using (true);
create policy "own profile insert" on users for insert with check (id = auth.uid());
create policy "own profile update" on users for update using (id = auth.uid());

-- Votes/reports/deals/points are written exclusively through SECURITY DEFINER
-- RPCs (vote_on_deal, report_deal, post_deal) which enforce rate limits and
-- points. Users can read their own rows.
create policy "own votes readable" on votes for select using (user_id = auth.uid());
create policy "own reports readable" on reports for select using (user_id = auth.uid());
create policy "own ledger readable" on points_ledger for select using (user_id = auth.uid());

-- Storage: public-read bucket for deal photos, authenticated upload
insert into storage.buckets (id, name, public) values ('deal-photos', 'deal-photos', true)
on conflict (id) do nothing;

create policy "deal photos public read" on storage.objects for select
  using (bucket_id = 'deal-photos');
create policy "deal photos auth upload" on storage.objects for insert
  with check (bucket_id = 'deal-photos' and auth.role() = 'authenticated');
