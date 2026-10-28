# Tarefas — Artur Zanoello

**Responsabilidade:** Home (mapa + lista de estacionamentos próximos) e disponibilidade de vagas em tempo real
**Requisitos:** RF02, RF04, RF05, RF12 (RNF02, RNF05, RNF07)
**Branch:** `feature/artur-home`

## Contexto

A tela Home é o centro do app: tudo parte dela (busca, filtros, detalhes e favoritos). Você também é dono do **schema do banco de `parkings` e do seed**, que os outros 3 alunos esperam para ligar suas telas ao backend real. Entregue o schema e o seed cedo.

## Dependências

- **Precisa de:** esqueleto do Express e middleware JWT (Lucas) para expor a rota. Enquanto não sair, rode a rota sem auth localmente.
- **Entrega para:** Vinicius (filtros em cima da sua rota), Vitor (detalhes usa sua tabela), Erico (favoritos referencia `parkings.id`).

## 1. Banco de dados (Supabase) — fazer primeiro

- [x] Habilitar a extensão **PostGIS** no projeto Supabase.
- [x] Criar a tabela `parkings`:
  - `id` uuid PK (default `gen_random_uuid()`)
  - `name` text, `address` text
  - `location` `geography(Point, 4326)` + índice GIST
  - `price_per_hour` numeric(8,2)
  - `total_spots` int, `free_spots` int (check `free_spots between 0 and total_spots`)
  - `image_path` text (caminho no Storage, preenchido pelo Vitor)
  - `updated_at` timestamptz
- [x] Salvar o SQL em um arquivo versionado (ex.: `backend/sql/001_parkings.sql`) para a equipe recriar o banco.
- [x] **Seed:** _(`backend/sql/001_parkings_seed.sql`, Av. Paulista/SP, 18 itens)_ 15 a 20 estacionamentos fictícios na mesma região (escolha uma cidade/bairro conhecido do grupo para a demo), com preços e lotações variados, incluindo pelo menos um lotado e um com poucas vagas.
- [x] Avisar o grupo quando o schema estiver no ar.
- [x] Habilitar **Realtime** na tabela `parkings` (Database → Replication).

## 2. Backend (Express)

- [x] `GET /parkings?lat=&lng=&radius=` retornando estacionamentos ordenados do mais próximo para o mais distante. Usar `ST_Distance` / `ST_DWithin` (geography, resultado em metros) via função SQL (RPC) ou query direta.
- [x] Resposta de cada item: `id, name, address, lat, lng, distanceM, pricePerHour, totalSpots, freeSpots, status, imageUrl`.
- [x] **Regra de status** (função isolada, com teste simples):
  - `freeSpots == 0` → `lotado`
  - `freeSpots / totalSpots <= 0.2` → `poucas_vagas`
  - caso contrário → `disponivel`
  - (o limite de 20% é uma sugestão; combinem com o grupo e registrem no código)
- [x] Validar `lat`/`lng`/`radius` (números dentro do intervalo, `radius` com valor padrão e máximo).
- [x] Combinar com o Vinicius o formato final dos query params, já que ele estende esta rota com os filtros.
- [x] **Job de simulação:** `setInterval` no backend que, a cada 10–30 s, altera `free_spots` de alguns estacionamentos aleatoriamente (±1 a 5, respeitando 0 e `total_spots`). Ligar/desligar por variável de ambiente.

## 3. App (Expo)

Antes de escrever código com APIs do Expo/`react-native-maps`, conferir a versão do `expo` no `package.json` e a doc dessa versão (https://docs.expo.dev/versions/).

- [x] Instalar com `npx expo install react-native-maps` e `npx expo install @supabase/supabase-js`. O Expo Go só roda os módulos nativos que já inclui, então confirmar que o mapa funciona nele.
- [x] Substituir o template em `src/app/(tabs)/home.tsx` (hoje só tem o texto de "get started").
- [x] Obter a posição do usuário com `expo-location`. **A permissão real é implementada pelo Lucas**; use um hook compartilhado de localização combinado com ele. Se negada, centralizar o mapa na cidade do seed.
- [x] **Mapa:** marcador por estacionamento, cor do marcador conforme o status, marcador da posição do usuário.
- [x] **Lista:** card com nome, distância, preço/hora, badge de status e "N vagas livres" (RF05) quando houver dado.
- [x] **Toggle mapa/lista** (RF12) no topo, mantendo os mesmos dados carregados nas duas visões.
- [x] Tocar em um card ou marcador navega para a tela de detalhes (rota do Vitor, ex.: `/parking/[id]`). Enquanto ela não existir, deixar o `router.push` pronto.
- [x] Estados de **carregando**, **erro** (com botão de tentar de novo) e **lista vazia**.
- [x] **Realtime:** assinar as mudanças da tabela `parkings` com o Supabase e atualizar `freeSpots`/`status` do item na tela sem recarregar. Cancelar a assinatura ao sair da tela.
- [x] Criar um componente reutilizável `StatusBadge` e um `ParkingCard`. O Vinicius (resultados da busca) e o Erico (favoritos) vão reutilizá-los, então coloque em `src/components/` e avise o grupo.

## 4. Critérios de aceite

- [ ] Ao abrir o app logado, aparecem os estacionamentos mais próximos em mapa e em lista.
- [x] Alternar entre mapa e lista não refaz a busca.
- [x] A lista está ordenada por distância e mostra a distância correta.
- [ ] Quando o job altera as vagas, o badge muda na tela em segundos, sem recarregar.
- [x] Sem permissão de localização o app continua funcionando.
- [x] Nenhuma chave de serviço do Supabase no app (só a chave anon).
- [x] `npx expo lint` e `npx tsc --noEmit` sem erros.

## 5. Entrega

PR de `feature/artur-home` para `develop`, com o SQL do schema e do seed e um print do app em Expo Go (mapa e lista).
