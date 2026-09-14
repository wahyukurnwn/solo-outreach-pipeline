Project solo_outreach_pipeline {
database_type: 'PostgreSQL'
Note: '''
ERD — Solo Outreach Pipeline (PRD terbaru — auth self-managed: email+password
bcrypt + Google OAuth, menggantikan rencana magic link sebelumnya)

    Prinsip desain:
    - users sekarang tabel ASLI, self-managed sepenuhnya — bukan lagi referensi ke
      Supabase auth.users (Supabase sudah dihapus total dari arsitektur).
    - password_hash NULLABLE: user yang signup lewat Google OAuth saja tidak punya
      password sama sekali.
    - google_id NULLABLE UNIQUE: user yang signup lewat email+password saja tidak
      punya ini.
    - Invariant di level APLIKASI (bukan constraint database): setiap user wajib
      punya minimal satu dari password_hash atau google_id — tidak boleh dua-duanya
      kosong. Kalau seseorang signup pakai Google dengan email yang sama dengan akun
      email+password yang sudah ada, keduanya disambungkan jadi satu row (password_hash
      dan google_id terisi bersamaan pada user yang sama).
    - password_reset_tokens MENGGANTIKAN magic_link_tokens dari desain sebelumnya —
      skemanya identik (token sekali-pakai, hash tersimpan, dikirim via email),
      hanya tujuannya berubah: dulu untuk login, sekarang untuk reset password.
    - Setiap tabel data punya user_id langsung (termasuk activities, meski bisa
      didapat lewat join ke prospects) untuk kebutuhan otorisasi per-request di
      business logic layer. TIDAK ada Row Level Security di level database (Supabase
      sudah dihapus) — filtering user_id 100% tanggung jawab kode di apps/api.
    - response_rate & conversion_rate SENGAJA tidak punya tabel sendiri — dihitung
      on-the-fly dari activities (PRD §7, §12). Menyimpannya sebagai tabel agregat
      terpisah berisiko data tidak sinkron.
    - Tidak ada tabel ai_drafts — draft AI stateless (generate, review, pakai atau
      buang). Kalau dipakai, teksnya masuk ke activities.message_text.
    - Grup "post_mvp" untuk fitur Nice-to-have (PRD §9) — jangan diimplementasikan
      sampai ada kebutuhan nyata, bukan dibangun di depan karena "sudah ada di ERD".

'''
}

Enum user_role {
user
admin
}

Enum pipeline_stage {
new
contacted
replied
call_scheduled
closed_won
closed_lost
}

Enum contact_channel {
email
linkedin
phone
other
}

Enum activity_outcome {
sent
replied
no_response
}

Table users {
id uuid [pk, default: `gen_random_uuid()`]
email varchar [not null, unique]
password_hash varchar
google_id varchar [unique]
role user_role [not null, default: 'user']
is_demo boolean [not null, default: false]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]

Note: '''
Tabel asli self-managed (bukan lagi referensi Supabase auth.users).
password_hash: nullable, kosong kalau user hanya pakai Google OAuth.
google_id: nullable+unique, kosong kalau user hanya pakai email+password.
Invariant aplikasi (bukan DB constraint): password_hash dan google_id tidak
boleh KEDUANYA null — divalidasi di business logic layer, bukan di skema ini.
is_demo: hanya TEPAT SATU row bernilai true — dipakai endpoint publik /api/demo/\*.
'''
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

Note: 'Menggantikan magic_link_tokens dari desain sebelumnya — skema identik, sekarang dipakai untuk alur forgot/reset password (PRD §7, §15). token_hash unik karena berasal dari token acak kriptografis.'
}

Table prospects {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [not null, ref: > users.id]
name varchar [not null]
company varchar
channel contact_channel
stage pipeline_stage [not null, default: 'new']
notes text
follow_up_date date
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]

indexes {
user_id
(user_id, stage)
(user_id, follow_up_date) [name: 'idx_followup_due']
}

Note: 'Entitas utama. notes jadi input konteks untuk AI drafting (PRD §7). stage berpindah bebas antar-nilai, tidak ada state machine yang membatasi urutan (PRD §14).'
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

Note: 'message_text opsional — teks pesan (draft AI yang sudah diedit, atau ditulis manual) yang benar-benar dipakai. Riwayat kronologis per prospek = query WHERE prospect_id = X ORDER BY activity_date.'
}

// ---------------------------------------------------------------------
// Post-MVP / Nice-to-have (PRD §9) — jangan dibuat di MVP.
// ---------------------------------------------------------------------

Table tags {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [not null, ref: > users.id]
name varchar [not null]
created_at timestamp [default: `now()`]
}

Table prospect_tags {
prospect_id uuid [not null, ref: > prospects.id]
tag_id uuid [not null, ref: > tags.id]

indexes {
(prospect_id, tag_id) [pk]
}

Note: 'Junction table many-to-many, hanya relevan kalau fitur tag (PRD §9, Nice-to-have) diaktifkan.'
}

TableGroup mvp_core {
users
password_reset_tokens
prospects
activities
}

TableGroup post_mvp {
tags
prospect_tags
}
