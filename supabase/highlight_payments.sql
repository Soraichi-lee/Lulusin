-- =====================================================================
-- Lulusin — pembayaran Sorot Barang (Midtrans)
-- Jalankan di Supabase Dashboard > SQL Editor > New query > Run.
-- Aman dijalankan ulang.
-- =====================================================================

-- 1. Masa sorot pada barang. Status "Disorot" = highlighted_until masih di masa depan.
alter table public.products
  add column if not exists highlighted_until timestamptz;

-- Pemilik barang BOLEH mengubah isi barang (kolom data), tetapi TIDAK BOLEH
-- mengubah masa sorot sendiri. Hanya server (setelah pembayaran lunas) yang boleh.
revoke update on public.products from anon, authenticated;
grant update (data) on public.products to authenticated;

-- 2. Pesanan sorot
create table if not exists public.highlight_orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  product_id   text not null references public.products(id) on delete cascade,
  days         int  not null check (days in (1, 3, 7)),
  amount       int  not null check (amount > 0),
  status       text not null default 'pending'
               check (status in ('pending', 'paid', 'failed', 'expired')),
  snap_token   text,
  payment_type text,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index if not exists highlight_orders_user_idx
  on public.highlight_orders (user_id, created_at desc);

alter table public.highlight_orders enable row level security;

-- Pengguna hanya boleh MELIHAT pesanannya sendiri. Membuat/mengubah pesanan
-- hanya lewat fungsi server (service role), tidak dari browser.
drop policy if exists highlight_orders_read_own on public.highlight_orders;
create policy highlight_orders_read_own on public.highlight_orders
  for select to authenticated using (user_id = auth.uid());

revoke insert, update, delete on public.highlight_orders from anon, authenticated;

-- 3. Mengaktifkan sorot setelah pembayaran lunas (idempotent: aman dipanggil
--    berulang kali oleh webhook, sorot tidak bertambah dua kali).
create or replace function public.activate_highlight(p_order uuid)
returns void language plpgsql security definer set search_path = public as $$
declare o public.highlight_orders%rowtype;
begin
  select * into o from public.highlight_orders where id = p_order for update;
  if not found then raise exception 'Pesanan tidak ditemukan'; end if;
  if o.status = 'paid' then return; end if;

  update public.highlight_orders
     set status = 'paid', paid_at = now()
   where id = p_order;

  -- Bila barang masih disorot, perpanjang dari masa berakhirnya.
  update public.products
     set highlighted_until =
           greatest(coalesce(highlighted_until, now()), now())
           + make_interval(days => o.days)
   where id = o.product_id;
end $$;

revoke all on function public.activate_highlight(uuid) from public, anon, authenticated;
grant execute on function public.activate_highlight(uuid) to service_role;
