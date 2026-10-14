-- T5.2 + T5.3: ตาราง loans, RLS, policy (ไม่มี DELETE, ไม่ให้สิทธิ์ anon)
-- ร่างนี้ยังไม่ได้รันบน Supabase จริง ให้ยืนยันก่อนรัน

create table if not exists public.loans (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id),
  friend_name   text not null check (length(btrim(friend_name)) > 0),
  item_name     text not null check (length(btrim(item_name)) > 0),
  borrowed_date date not null,
  due_date      date not null,
  returned_date date,
  constraint loans_due_after_borrowed check (due_date >= borrowed_date),
  constraint loans_returned_after_borrowed check (returned_date is null or returned_date >= borrowed_date)
);

alter table public.loans enable row level security;

revoke all on public.loans from public, anon;
revoke all on public.loans from authenticated;
grant select, insert, update on public.loans to authenticated;

create policy "loans_select_own" on public.loans
  for select to authenticated
  using (owner_id = auth.uid());

create policy "loans_insert_own" on public.loans
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "loans_update_own" on public.loans
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ไม่สร้าง policy DELETE โดยตั้งใจ (กติกา: ห้ามลบ Loan)

-- ปิดสิทธิ์ที่ Supabase ให้ authenticated โดยค่าเริ่มต้น (DELETE, TRUNCATE, REFERENCES, TRIGGER)
revoke delete, truncate, references, trigger on public.loans from authenticated;

-- ปิดสิทธิ์ execute ของฟังก์ชัน SECURITY DEFINER ที่ anon/authenticated เรียกได้ (จาก advisor)
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
