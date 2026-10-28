-- 001_parkings.sql — tabela de estacionamentos, busca por proximidade e Realtime.
-- Rodar no SQL Editor do Supabase ANTES de 001_parkings_seed.sql e 002_parking_hours.sql.
-- O script pode ser rodado de novo sem erro (idempotente).

-- PostGIS: distâncias em metros com geography(Point, 4326).
create extension if not exists postgis with schema extensions;

create table if not exists parkings (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  address        text not null,
  location       geography(Point, 4326) not null,
  price_per_hour numeric(8, 2) not null check (price_per_hour >= 0),
  total_spots    int not null check (total_spots >= 0),
  free_spots     int not null,
  image_path     text, -- caminho no bucket parking-images (preenchido pelo Vitor)
  updated_at     timestamptz not null default now(),
  constraint parkings_free_spots_range check (free_spots between 0 and total_spots)
);
create index if not exists parkings_location_idx on parkings using gist (location);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists parkings_set_updated_at on parkings;
create trigger parkings_set_updated_at before update on parkings
  for each row execute function set_updated_at();

-- RLS: o backend usa a chave secreta (ignora RLS). O app usa só a chave publishable,
-- e precisa de SELECT para receber o Realtime. Dados de estacionamento são públicos;
-- não há política de escrita, então o app não consegue alterar nada.
alter table parkings enable row level security;
drop policy if exists "parkings leitura publica" on parkings;
create policy "parkings leitura publica" on parkings for select to anon, authenticated using (true);

-- Realtime (equivale a Database → Replication → parkings).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'parkings'
  ) then
    alter publication supabase_realtime add table parkings;
  end if;
end;
$$;

-- Estacionamentos dentro de p_radius_m metros do ponto, do mais próximo ao mais distante.
-- Usada por GET /parkings (backend/routes/parkings.js). O Vinicius estende com os filtros.
create or replace function nearby_parkings(
  p_lat double precision,
  p_lng double precision,
  p_radius_m double precision,
  p_limit int default 50
)
returns table (
  id uuid, name text, address text, lat double precision, lng double precision,
  distance_m double precision, price_per_hour numeric, total_spots int, free_spots int, image_path text
)
language sql stable
set search_path = public, extensions
as $$
  with origin as (select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as g)
  select p.id, p.name, p.address, st_y(p.location::geometry), st_x(p.location::geometry),
         st_distance(p.location, o.g) as distance_m,
         p.price_per_hour, p.total_spots, p.free_spots, p.image_path
  from parkings p, origin o
  where st_dwithin(p.location, o.g, p_radius_m)
  order by distance_m
  limit p_limit;
$$;
