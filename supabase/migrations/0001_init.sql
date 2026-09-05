-- =============================================================
-- TCI Operacional · esquema inicial
-- Ejecuta este SQL una sola vez en:
--   Supabase Dashboard → SQL Editor → New query → pega y Run
-- =============================================================

-- Enums
do $$ begin
  create type rol_usuario as enum ('monitor','colportor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_contacto as enum ('contacted','interested','follow_up','attending','not_interested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_evento as enum ('created','status_changed','note_added','deleted');
exception when duplicate_object then null; end $$;

-- Iglesias: una fila por (departamento, ciudad). Los usuarios del mismo
-- departamento/ciudad comparten iglesia automáticamente.
create table if not exists iglesias (
  id uuid primary key default gen_random_uuid(),
  departamento text not null,
  ciudad text not null,
  nombre text not null default 'TCI',
  created_at timestamptz not null default now(),
  unique (departamento, ciudad)
);

-- Profiles: extiende auth.users con datos de dominio
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol rol_usuario not null,
  iglesia_id uuid not null references iglesias(id) on delete restrict,
  departamento text,
  ciudad text,
  ubicacion_lat double precision,
  ubicacion_lng double precision,
  ubicacion_actualizada_en timestamptz,
  created_at timestamptz not null default now()
);

-- Contactos (SIN ubicación por diseño)
create table if not exists contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  estado estado_contacto not null default 'contacted',
  nota text not null default '',
  colportor_id uuid not null references profiles(id) on delete cascade,
  iglesia_id uuid not null references iglesias(id) on delete cascade,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Eventos: auditoría / feed de actividad
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  contacto_id uuid not null,
  actor_id uuid references profiles(id) on delete set null,
  iglesia_id uuid not null references iglesias(id) on delete cascade,
  tipo tipo_evento not null,
  payload jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);

create index if not exists idx_contactos_iglesia_creado on contactos (iglesia_id, creado_en desc);
create index if not exists idx_contactos_colportor_creado on contactos (colportor_id, creado_en desc);
create index if not exists idx_eventos_iglesia_creado on eventos (iglesia_id, creado_en desc);
create index if not exists idx_profiles_iglesia on profiles (iglesia_id);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table iglesias  enable row level security;
alter table profiles  enable row level security;
alter table contactos enable row level security;
alter table eventos   enable row level security;

-- Helpers (security definer para leer sin depender de las políticas)
create or replace function mi_iglesia_id() returns uuid
  language sql stable security definer set search_path = public as
$$ select iglesia_id from profiles where id = auth.uid() $$;

create or replace function soy_monitor() returns boolean
  language sql stable security definer set search_path = public as
$$ select coalesce((select rol = 'monitor' from profiles where id = auth.uid()), false) $$;

-- Upsert de iglesia usado en el signup (evita que los usuarios necesiten
-- permiso de INSERT sobre iglesias)
create or replace function get_or_create_iglesia(p_departamento text, p_ciudad text)
  returns uuid language plpgsql security definer set search_path = public as
$$
declare v_id uuid;
begin
  select id into v_id from iglesias
   where departamento = p_departamento and ciudad = p_ciudad;
  if v_id is null then
    insert into iglesias (departamento, ciudad)
    values (p_departamento, p_ciudad)
    returning id into v_id;
  end if;
  return v_id;
end $$;

revoke all on function get_or_create_iglesia(text, text) from public;
grant execute on function get_or_create_iglesia(text, text) to authenticated;

-- ---------- Políticas ----------
-- Iglesias: cualquier autenticado puede leer (la función definer inserta)
drop policy if exists "iglesias read" on iglesias;
create policy "iglesias read" on iglesias for select to authenticated using (true);

-- Profiles: uno mismo siempre; el monitor ve toda su iglesia
drop policy if exists "profiles read self or monitor" on profiles;
create policy "profiles read self or monitor" on profiles for select to authenticated
  using (id = auth.uid() or (soy_monitor() and iglesia_id = mi_iglesia_id()));

drop policy if exists "profiles insert self" on profiles;
create policy "profiles insert self" on profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles update self" on profiles;
create policy "profiles update self" on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Contactos: colportor solo los suyos; monitor todos los de su iglesia
drop policy if exists "contactos read" on contactos;
create policy "contactos read" on contactos for select to authenticated
  using (colportor_id = auth.uid() or (soy_monitor() and iglesia_id = mi_iglesia_id()));

drop policy if exists "contactos insert own" on contactos;
create policy "contactos insert own" on contactos for insert to authenticated
  with check (colportor_id = auth.uid() and iglesia_id = mi_iglesia_id());

drop policy if exists "contactos update" on contactos;
create policy "contactos update" on contactos for update to authenticated
  using (colportor_id = auth.uid() or (soy_monitor() and iglesia_id = mi_iglesia_id()));

drop policy if exists "contactos delete" on contactos;
create policy "contactos delete" on contactos for delete to authenticated
  using (colportor_id = auth.uid() or (soy_monitor() and iglesia_id = mi_iglesia_id()));

-- Eventos: misma regla
drop policy if exists "eventos read" on eventos;
create policy "eventos read" on eventos for select to authenticated
  using (actor_id = auth.uid() or (soy_monitor() and iglesia_id = mi_iglesia_id()));

drop policy if exists "eventos insert own" on eventos;
create policy "eventos insert own" on eventos for insert to authenticated
  with check (actor_id = auth.uid() and iglesia_id = mi_iglesia_id());

-- =============================================================
-- Realtime
-- =============================================================
do $$ begin
  perform 1 from pg_publication where pubname = 'supabase_realtime';
  if found then
    execute 'alter publication supabase_realtime add table profiles';
    execute 'alter publication supabase_realtime add table contactos';
    execute 'alter publication supabase_realtime add table eventos';
  end if;
exception when others then null;  -- ya añadidas
end $$;
