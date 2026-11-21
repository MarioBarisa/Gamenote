begin;

create table public.mfa_recovery_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  factor_id uuid not null,
  payload bytea not null check (octet_length(payload) between 29 and 512)
);

alter table public.mfa_recovery_codes enable row level security;
revoke all on table public.mfa_recovery_codes from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.mfa_recovery_codes to service_role;

commit;
