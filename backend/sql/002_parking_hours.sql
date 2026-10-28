-- 002_parking_hours.sql — horários de funcionamento + bucket de imagens + RPC de detalhe.
-- Depende de 001_parkings.sql (Artur). Rodar no SQL Editor do Supabase.
--
-- DECISÃO (24 h): estacionamento 24 h = linhas 00:00 -> 23:59 em todos os dias (sem coluna extra).
-- DECISÃO (madrugada): se closes_at <= opens_at, o horário passa da meia-noite
-- (ex.: 18:00 -> 02:00 pertence ao dia `weekday` e termina na manhã seguinte).
-- Dia sem linha = fechado. Fuso do projeto: America/Sao_Paulo (backend/lib/hours.js).

create table if not exists parking_hours (
  id         uuid primary key default gen_random_uuid(),
  parking_id uuid not null references parkings(id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6), -- 0 = domingo ... 6 = sábado
  opens_at   time not null,
  closes_at  time not null,
  unique (parking_id, weekday)
);
create index if not exists parking_hours_parking_idx on parking_hours (parking_id);

-- Detalhe do estacionamento com lat/lng (o supabase-js não extrai coordenadas de geography).
create or replace function get_parking(p_id uuid, p_lat double precision default null, p_lng double precision default null)
returns table (
  id uuid, name text, address text, lat double precision, lng double precision,
  distance_m double precision, price_per_hour numeric, total_spots int, free_spots int, image_path text
)
language sql stable as $$
  select p.id, p.name, p.address, st_y(p.location::geometry), st_x(p.location::geometry),
         case when p_lat is null or p_lng is null then null
              else st_distance(p.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) end,
         p.price_per_hour, p.total_spots, p.free_spots, p.image_path
  from parkings p where p.id = p_id;
$$;

-- Bucket público de imagens. Convenção: parking-images/<parking_id>/<n>.jpg
insert into storage.buckets (id, name, public) values ('parking-images', 'parking-images', true)
on conflict (id) do nothing;

-- SEED de horários para os estacionamentos existentes (4 padrões rotacionando):
--   0 comercial seg-sex 08-18 | 1 24 h | 2 seg-sáb 07-22 (fecha domingo) | 3 18:00-02:00 todo dia (passa da meia-noite)
with numbered as (
  select id, (row_number() over (order by name) - 1) % 4 as pattern from parkings
), days as (select generate_series(0, 6) as weekday)
insert into parking_hours (parking_id, weekday, opens_at, closes_at)
select n.id, d.weekday,
  case n.pattern when 0 then '08:00' when 1 then '00:00' when 2 then '07:00' else '18:00' end::time,
  case n.pattern when 0 then '18:00' when 1 then '23:59' when 2 then '22:00' else '02:00' end::time
from numbered n cross join days d
where (n.pattern = 0 and d.weekday between 1 and 5)
   or (n.pattern = 2 and d.weekday between 1 and 6)
   or n.pattern in (1, 3)
on conflict (parking_id, weekday) do nothing;
