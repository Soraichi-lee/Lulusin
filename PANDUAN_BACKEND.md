# Panduan menyalakan backend Lulusin (Supabase)

Tanpa langkah ini aplikasi tetap jalan dalam **mode demo** (data lokal saja).

## 1. Buat proyek Supabase
1. Daftar/masuk di https://supabase.com lalu **New project** (paket gratis cukup).
2. Buka **Project Settings → API**, salin **Project URL** dan **anon public key**.

## 2. Jalankan skema database
Buka **SQL Editor → New query**, tempel seluruh isi `supabase/schema.sql`, lalu **Run**.
Ini membuat tabel, aturan keamanan (RLS), bucket foto, dan fitur realtime.

## 3. Isi kunci di proyek
Salin `.env.example` menjadi `.env.local`, lalu isi:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
Jalankan `pnpm install` (jangan `--frozen-lockfile`, karena ada paket baru
`@supabase/supabase-js`) lalu `pnpm dev`.

## 4. Pengaturan Auth (disarankan saat uji coba)
**Authentication → Providers → Email**: matikan *Confirm email* agar pendaftaran
langsung masuk. Nyalakan kembali saat rilis.

## 5. Menyetujui KTM mahasiswa
1. Pengguna mendaftar lalu mengirim foto KTM → status `pending`.
2. Admin membuka **Storage → ktm → `<user_id>/...`** untuk melihat fotonya
   (bucket ini privat).
3. Setujui lewat SQL Editor:
   ```sql
   update public.profiles set ktm_status = 'verified' where id = '<USER_ID>';
   ```
   Tolak: ganti `'verified'` dengan `'rejected'`.
   (`<USER_ID>` ada di **Authentication → Users**.)

Hanya akun `verified` yang boleh memasang barang dan memulai chat.
Untuk uji coba cepat, verifikasi akun Anda sendiri dengan perintah di atas.

## 6. Uji dua akun
Buka dua browser berbeda (atau satu jendela biasa + satu incognito), daftarkan dua
akun, verifikasi keduanya. Akun A memasang barang; akun B membuka barang itu dan
menekan tombol chat. Pesan dan foto akan muncul real-time di kedua sisi.

## Catatan
- Foto KTM dan gambar chat disimpan di bucket **privat**; foto barang di bucket publik.
- Barang contoh bawaan desain (penjual fiktif) tetap memakai balasan otomatis demo;
  chat sungguhan hanya untuk barang yang dipasang pengguna asli.
- Jumlah pesan belum dibaca (unread) untuk chat sungguhan dihitung selama
  aplikasi terbuka; belum disimpan di server.
