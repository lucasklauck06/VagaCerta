-- 001_parkings_seed.sql — estacionamentos fictícios para a demo.
-- Região: Av. Paulista e arredores (Bela Vista, Jardins, Consolação, Paraíso) — São Paulo/SP.
-- Centro padrão do app quando não há localização: MASP (-23.5614, -46.6559).
-- Só insere se a tabela estiver vazia, então pode ser rodado de novo sem duplicar.
-- Depois deste, rodar 002_parking_hours.sql (Vitor), que gera os horários a partir destas linhas.

insert into parkings (name, address, location, price_per_hour, total_spots, free_spots)
select v.name, v.address, st_setsrid(st_makepoint(v.lng, v.lat), 4326)::geography, v.price, v.total, v.free
from (values
  -- name,                          address,                                       lat,      lng,      price, total, free
  ('Estacionamento Paulista Center', 'Av. Paulista, 1578 - Bela Vista',              -23.5616, -46.6563, 18.00, 120,  48),
  ('Park MASP',                      'Al. Santos, 1100 - Jardim Paulista',           -23.5627, -46.6550, 20.00,  60,   0), -- lotado
  ('Garagem Trianon',                'Rua Pamplona, 145 - Jardim Paulista',          -23.5640, -46.6547, 15.00,  45,   4), -- poucas vagas
  ('Auto Park Consolação',           'Rua da Consolação, 2310 - Consolação',         -23.5555, -46.6610, 12.00,  80,  35),
  ('Estapark Augusta',               'Rua Augusta, 1520 - Consolação',               -23.5582, -46.6588, 14.00,  50,   9), -- poucas vagas (18%)
  ('Vaga Fácil Frei Caneca',         'Rua Frei Caneca, 569 - Consolação',            -23.5530, -46.6545, 10.00,  70,  52),
  ('Park Brigadeiro',                'Av. Brigadeiro Luís Antônio, 2367 - Bela Vista', -23.5668, -46.6486, 13.00,  90,  60),
  ('Garagem Paraíso',                'Rua Tutóia, 55 - Paraíso',                      -23.5735, -46.6458, 11.00,  40,   1), -- poucas vagas
  ('Estacionamento Haddock Lobo',    'Rua Haddock Lobo, 745 - Cerqueira César',      -23.5603, -46.6650, 22.00,  35,  12),
  ('Center Park Oscar Freire',       'Rua Oscar Freire, 410 - Jardins',              -23.5660, -46.6660, 25.00,  30,   7),
  ('Park Joaquim Eugênio',           'Rua Joaquim Eugênio de Lima, 680 - Jardim Paulista', -23.5675, -46.6530, 12.50,  55,  30),
  ('Garagem Bela Cintra',            'Rua Bela Cintra, 1200 - Consolação',           -23.5590, -46.6620, 16.00,  65,   0), -- lotado
  ('Estacionamento Treze de Maio',   'Rua Treze de Maio, 1020 - Bela Vista',         -23.5622, -46.6450,  9.00, 100,  77),
  ('Auto Park Itapeva',              'Rua Itapeva, 286 - Bela Vista',                -23.5598, -46.6522, 13.50,  40,  15),
  ('Vaga Certa Ministro Rocha Azevedo', 'Al. Min. Rocha Azevedo, 900 - Cerqueira César', -23.5629, -46.6611, 19.00,  25,   3), -- poucas vagas
  ('Park Hospital Santa Catarina',   'Av. Paulista, 200 - Bela Vista',               -23.5703, -46.6465, 17.00, 150,  95),
  ('Estacionamento Peixoto Gomide',  'Rua Peixoto Gomide, 1300 - Jardim Paulista',   -23.5645, -46.6585, 15.50,  45,  20),
  ('Garagem Rua Maria Paula',        'Rua Maria Paula, 120 - Bela Vista',            -23.5502, -46.6400,  8.00,  60,  41)
) as v(name, address, lat, lng, price, total, free)
where not exists (select 1 from parkings);
