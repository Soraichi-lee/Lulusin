-- =====================================================================
-- Lulusin — skema backend Supabase
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > tempel > Run.
-- Aman dijalankan ulang (idempotent).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROFIL PENGGUNA
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  faculty_prodi text not null default '',
  ktm_status    text not null default 'none'
                check (ktm_status in ('none','pending','verified','rejected')),
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Pengguna TIDAK boleh mengubah ktm_status / is_admin sendiri:
-- hanya kolom di bawah ini yang boleh diubah dari aplikasi.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, faculty_prodi) on public.profiles to authenticated;

-- Profil dibuat otomatis saat akun baru terdaftar.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, faculty_prodi)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'faculty_prodi', '')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
-- 2. VERIFIKASI KTM  (data pribadi: hanya pemilik & admin yang bisa baca)
-- ---------------------------------------------------------------------
create table if not exists public.ktm_submissions (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  nim          text not null,
  ktm_path     text not null,
  submitted_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  review_note  text
);
alter table public.ktm_submissions enable row level security;

drop policy if exists ktm_read on public.ktm_submissions;
create policy ktm_read on public.ktm_submissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.ktm_submissions from anon, authenticated;

-- Pengguna mengirim KTM lewat fungsi ini (bukan menulis tabel langsung).
create or replace function public.submit_ktm(p_nim text, p_path text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Belum login'; end if;
  if p_path not like uid::text || '/%' then raise exception 'Path file tidak valid'; end if;
  if (select ktm_status from public.profiles where id = uid) = 'verified' then
    raise exception 'Akun sudah terverifikasi';
  end if;

  insert into public.ktm_submissions (user_id, nim, ktm_path)
  values (uid, p_nim, p_path)
  on conflict (user_id) do update
    set nim = excluded.nim, ktm_path = excluded.ktm_path,
        submitted_at = now(), reviewed_at = null, review_note = null;

  update public.profiles set ktm_status = 'pending' where id = uid;
end $$;

-- Untuk UI admin di masa depan (login sebagai admin). Dari SQL Editor,
-- cukup pakai UPDATE langsung (lihat catatan di bagian paling bawah).
create or replace function public.review_ktm(p_user uuid, p_approved boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Hanya admin'; end if;
  update public.ktm_submissions set reviewed_at = now(), review_note = p_note where user_id = p_user;
  update public.profiles
     set ktm_status = case when p_approved then 'verified' else 'rejected' end
   where id = p_user;
end $$;

grant execute on function public.submit_ktm(text, text) to authenticated;
grant execute on function public.review_ktm(uuid, boolean, text) to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 3. BARANG
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id         text primary key,
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;

drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select to authenticated using (true);

-- Hanya mahasiswa yang KTM-nya sudah diverifikasi yang boleh memasang barang.
drop policy if exists products_insert on public.products;
create policy products_insert on public.products
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.ktm_status = 'verified')
  );

drop policy if exists products_update_own on public.products;
create policy products_update_own on public.products
  for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists products_delete_own on public.products;
create policy products_delete_own on public.products
  for delete to authenticated using (owner_id = auth.uid());

-- ---------------------------------------------------------------------
-- 4. CHAT PENJUAL <-> PEMBELI
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  buyer_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  seller_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (product_id, buyer_id),
  check (buyer_id <> seller_id)
);
alter table public.conversations enable row level security;

drop policy if exists conversations_read on public.conversations;
create policy conversations_read on public.conversations
  for select to authenticated
  using (auth.uid() in (buyer_id, seller_id));

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and seller_id = (select owner_id from public.products where id = product_id)
    and exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.ktm_status = 'verified')
  );

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body            text,
  image_path      text,
  created_at      timestamptz not null default now(),
  check (body is not null or image_path is not null),
  check (char_length(coalesce(body, '')) <= 2000)
);
create index if not exists messages_conv_time_idx
  on public.messages (conversation_id, created_at);
alter table public.messages enable row level security;

drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages
  for select to authenticated
  using (exists (select 1 from public.conversations c
                 where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id)));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.conversations c
                where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id))
  );

-- Realtime: pesan & percakapan baru langsung sampai ke lawan bicara.
do $$
begin
  begin alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.conversations;
  exception when duplicate_object then null; end;
end $$;

-- ---------------------------------------------------------------------
-- 5. PENYIMPANAN FOTO (Storage)
--    product-photos : publik   (foto barang)
--    ktm            : PRIVAT   (foto KTM)
--    chat-images    : PRIVAT   (gambar di chat, hanya peserta percakapan)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-photos', 'product-photos', true,  5242880, array['image/jpeg','image/png','image/webp']),
  ('ktm',            'ktm',            false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('chat-images',    'chat-images',    false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Foto barang: tiap pengguna hanya menulis ke folder miliknya (<user_id>/...).
drop policy if exists product_photos_insert on storage.objects;
create policy product_photos_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-photos'
              and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists product_photos_delete on storage.objects;
create policy product_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-photos'
         and (storage.foldername(name))[1] = auth.uid()::text);

-- KTM: tulis & baca hanya folder sendiri; admin boleh membaca semua.
drop policy if exists ktm_insert on storage.objects;
create policy ktm_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ktm'
              and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists ktm_select on storage.objects;
create policy ktm_select on storage.objects
  for select to authenticated
  using (bucket_id = 'ktm'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists ktm_delete on storage.objects;
create policy ktm_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'ktm'
         and (storage.foldername(name))[1] = auth.uid()::text);

-- Gambar chat: folder = id percakapan; hanya penjual & pembeli di percakapan itu.
drop policy if exists chat_images_insert on storage.objects;
create policy chat_images_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-images'
    and exists (select 1 from public.conversations c
                where c.id::text = (storage.foldername(name))[1]
                  and auth.uid() in (c.buyer_id, c.seller_id))
  );

drop policy if exists chat_images_select on storage.objects;
create policy chat_images_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat-images'
    and exists (select 1 from public.conversations c
                where c.id::text = (storage.foldername(name))[1]
                  and auth.uid() in (c.buyer_id, c.seller_id))
  );

-- =====================================================================
-- CATATAN OPERASIONAL (jalankan terpisah di SQL Editor bila perlu)
--
-- Menyetujui KTM seorang pengguna (setelah melihat fotonya di
-- Storage > ktm > <user_id>/...):
--   update public.profiles set ktm_status = 'verified' where id = '<USER_ID>';
-- Menolak:
--   update public.profiles set ktm_status = 'rejected' where id = '<USER_ID>';
--
-- Menjadikan akun Anda admin (untuk UI admin di kemudian hari):
--   update public.profiles set is_admin = true where id = '<USER_ID>';
-- =====================================================================
