Project solo_outreach_pipeline {
database_type: 'PostgreSQL'
Note: '''
ERD — Solo Outreach Pipeline (disinkronkan dengan apps/api/prisma/schema.prisma
per 25 September 2026, setelah project ini live di production)

    Prinsip desain:
    - users adalah tabel ASLI, self-managed sepenuhnya — tidak ada dependensi ke
      provider auth pihak ketiga (Supabase dkk).
    - password_hash NULLABLE: user yang signup lewat Google OAuth saja tidak punya
      password sama sekali.
    - google_id NULLABLE UNIQUE: user yang signup lewat email+password saja tidak
      punya ini.
    - Invariant di level APLIKASI (bukan constraint database): setiap user wajib
      punya minimal satu dari password_hash atau google_id — tidak boleh dua-duanya
      kosong. Kalau seseorang signup pakai Google dengan email yang sama dengan akun
      email+password yang sudah ada, keduanya disambungkan jadi satu row.
    - refresh_tokens: sesi login disimpan sebagai HASH token (bukan raw), dirotasi
      setiap dipakai (token lama di-revoke, token baru diterbitkan). Token curian
      yang dipakai ulang setelah pemilik asli refresh akan terdeteksi invalid.
    - role_change_logs & demo_change_logs: audit trail untuk aksi admin — dicatat
      HANYA saat nilai benar-benar berubah (no-op tidak dicatat), dalam transaksi
      yang sama dengan perubahannya.
    - Enum yang di-translate ke Inggris (user_role, pipeline_stage, contact_channel)
      nilainya UPPERCASE (mengikuti konvensi Prisma untuk enum yang di-@@map ke nama
      tipe kustom). activity_outcome TIDAK di-@@map, jadi nilainya tetap lowercase
      apa adanya.
    - Setiap tabel data punya user_id langsung (termasuk activities, meski bisa
      didapat lewat join ke prospects) untuk kebutuhan otorisasi per-request di
      business logic layer. TIDAK ada Row Level Security di level database —
      filtering user_id 100% tanggung jawab kode di apps/api.
    - response_rate & conversion_rate SENGAJA tidak punya tabel sendiri — dihitung
      on-the-fly dari activities (PRD §7, §12). Menyimpannya sebagai tabel agregat
      terpisah berisiko data tidak sinkron.
    - Tidak ada tabel ai_drafts — draft AI stateless (generate, review, pakai atau
      buang). Kalau dipakai, teksnya masuk ke activities.message_text.
    - tags/prospect_tags SEMPAT ada di skema tapi dihapus 25 September 2026 — tidak
      pernah dipakai API/UI, dan tidak ada bukti kebutuhan nyata (PRD §11, "Out of
      Scope"). Kalau nanti benar-benar dibutuhkan, desain ulang dari nol berdasarkan
      kebutuhan yang sudah tervalidasi, bukan restore skema lama ini.

'''
}

Enum user_role {
USER
ADMIN
}

Enum pipeline_stage {
NEW
CONTACTED
REPLIED
CALL_SCHEDULED
CLOSED_WON
CLOSED_LOST
}

Enum contact_channel {
EMAIL
LINKEDIN
PHONE
OTHER
}

Enum activity_outcome {
sent
replied
no_response
}

Table users {
id uuid [pk, default: `gen_random_uuid()`]
email varchar [not null, unique]
name varchar
username varchar
password_hash varchar
google_id varchar [unique]
role user_role [not null, default: 'USER']
is_demo boolean [not null, default: false]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]

Note: '''
Tabel asli self-managed (bukan referensi provider auth pihak ketiga).
name/username: opsional, dipakai buat tampilan (mis. greeting dashboard —
kalau kosong, UI jatuh ke bagian sebelum "@" di email).
password_hash: nullable, kosong kalau user hanya pakai Google OAuth.
google_id: nullable+unique, kosong kalau user hanya pakai email+password.
Invariant aplikasi (bukan DB constraint): password_hash dan google_id tidak
boleh KEDUANYA null — divalidasi di business logic layer, bukan di skema ini.
is_demo: hanya TEPAT SATU row bernilai true — dipakai endpoint publik /api/demo/\*.
'''
}

Table refresh_tokens {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [not null, ref: > users.id]
token_hash varchar [not null, unique]
expires_at timestamp [not null]
revoked_at timestamp
created_at timestamp [default: `now()`]

indexes {
user_id
}

Note: 'Sesi login. Token disimpan sebagai hash (bukan raw) — sama alasannya dengan password_reset_tokens. Dirotasi tiap dipakai (revoked_at diisi saat token lama diganti token baru); logout mengisi revoked_at secara eksplisit.'
}

Table password_reset_tokens {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [not null, ref: > users.id]
token_hash varchar [not null, unique]
expires_at timestamp [not null]
used_at timestamp
created_at timestamp [default: `now()`]

indexes {
user_id
}

Note: 'Alur forgot/reset password (PRD §7, §15). token_hash unik karena berasal dari token acak kriptografis.'
}

Table role_change_logs {
id uuid [pk, default: `gen_random_uuid()`]
actor_id uuid [not null, ref: > users.id]
target_id uuid [not null, ref: > users.id]
from_role user_role [not null]
to_role user_role [not null]
created_at timestamp [default: `now()`]

indexes {
target_id
}

Note: 'Audit trail "siapa mengubah role siapa" — dicatat cuma saat nilai benar-benar berubah (no-op tidak dicatat), dalam transaksi yang sama dengan perubahan role-nya.'
}

Table demo_change_logs {
id uuid [pk, default: `gen_random_uuid()`]
actor_id uuid [not null, ref: > users.id]
target_id uuid [not null, ref: > users.id]
from_demo boolean [not null]
to_demo boolean [not null]
created_at timestamp [default: `now()`]

indexes {
target_id
}

Note: 'Audit trail perubahan status akun demo, termasuk efek samping saat menyalakan demo di satu user otomatis mematikannya di user lain (invariant "paling banyak satu is_demo=true").'
}

Table prospects {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [not null, ref: > users.id]
name varchar [not null]
company varchar
channel contact_channel
stage pipeline_stage [not null, default: 'NEW']
notes text
follow_up_date date
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]

indexes {
user_id
(user_id, stage)
(user_id, follow_up_date) [name: 'idx_followup_due']
}

Note: 'Entitas utama. notes jadi input konteks untuk AI drafting (PRD §7, §17) — juga dipakai bareng 3 aktivitas terakhir untuk konteks draft yang lebih personal. stage berpindah bebas antar-nilai, tidak ada state machine yang membatasi urutan (PRD §14).'
}

Table activities {
id uuid [pk, default: `gen_random_uuid()`]
prospect_id uuid [not null, ref: > prospects.id]
user_id uuid [not null, ref: > users.id]
channel contact_channel [not null]
outcome activity_outcome [not null]
message_text text
activity_date date [not null]
created_at timestamp [default: `now()`]

indexes {
prospect_id
user_id
activity_date
}

Note: 'message_text opsional — teks pesan (draft AI yang sudah diedit, atau ditulis manual) yang benar-benar dipakai. Riwayat kronologis per prospek = query WHERE prospect_id = X ORDER BY activity_date. activity_date ditolak kalau lebih dari 1 hari ke depan (PRD §7) — validasi di level aplikasi, bukan constraint database.'
}

TableGroup mvp_core {
users
refresh_tokens
password_reset_tokens
role_change_logs
demo_change_logs
prospects
activities
}
