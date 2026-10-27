# Tarefas — Vitor Benedett Caldas

**Responsabilidade:** Detalhes do estacionamento e "Como chegar"
**Requisitos:** RF06, RF08, RF09 (RNF01, RNF09)
**Branch:** `feature/vitor-detalhes`

## Contexto
Quando o usuário toca em um estacionamento na Home, ele chega à sua tela. Ela precisa responder "vale a pena estacionar aqui?" (preço, vagas, horário, endereço, fotos) e levar o usuário até lá com o botão **Como chegar**, que abre o app de mapas do celular. Você também é dono do **horário de funcionamento** (tabela `parking_hours`) e das **imagens** (Storage), dos quais o Vinicius e o Artur dependem.

## Dependências
- **Precisa de:** tabela `parkings` e seed (Artur); middleware JWT e `lib/api` (Lucas).
- **Enquanto isso:** monte a tela com um objeto mockado idêntico ao da resposta final.
- **Entrega para:** Vinicius (`parking_hours` para o filtro "aberto agora"), Artur (a Home navega para a sua rota), Erico (coloca o botão de favoritar na sua tela).

## 1. Banco de dados e Storage (Supabase)
- [ ] Criar a tabela `parking_hours`: `id`, `parking_id` (FK para `parkings.id`, `on delete cascade`), `weekday` smallint (0 = domingo … 6 = sábado), `opens_at` time, `closes_at` time. Para 24 h, usar `00:00` a `23:59` ou uma coluna `is_24h`; **decidir e documentar**.
- [ ] Salvar o SQL versionado (ex.: `backend/sql/002_parking_hours.sql`) e **avisar o Vinicius** do formato assim que estiver pronto.
- [ ] Popular os horários dos estacionamentos do seed do Artur (variados: comercial, 24 h, fecha aos domingos, um que passa da meia-noite).
- [ ] Criar o *bucket* de **Storage** para as imagens (leitura pública é suficiente para a demo). Subir 1 a 3 fotos por estacionamento e preencher `parkings.image_path`.
- [ ] Imagens leves (redimensionar antes de subir), para respeitar o plano gratuito e o RNF02.

## 2. Backend (Express)
- [ ] `GET /parkings/:id` retornando: `id, name, address, lat, lng, distanceM (se lat/lng informados), pricePerHour, totalSpots, freeSpots, status, openNow, hours[], images[]`.
- [ ] Usar a **mesma função de status** do Artur (sem duplicar a regra).
- [ ] Calcular `openNow` no backend a partir de `parking_hours`, no fuso do projeto (combinar com o Vinicius, que usa a mesma lógica; **extrair uma função compartilhada**).
- [ ] `hours[]` devolvido de forma amigável para o app mostrar (ex.: dia da semana + abre/fecha), com "Fechado" nos dias sem registro.
- [ ] URLs das imagens montadas a partir do Storage.
- [ ] Validar o `id` (formato uuid); `404` se não existir, `400` se inválido.

## 3. App (Expo)
Conferir a versão do `expo` no `package.json` e a doc dessa versão antes de usar APIs novas.

- [ ] Criar a rota dinâmica `src/app/parking/[id].tsx` (ler o id com `useLocalSearchParams`). Registrar no layout como tela empilhada com botão de voltar.
- [ ] Conteúdo da tela (RF06):
  - galeria/carrossel de imagens (com placeholder se não houver foto)
  - nome e endereço
  - distância até o usuário
  - preço por hora
  - badge de disponibilidade (reutilizar `StatusBadge` do Artur) e "N vagas livres" quando houver
  - horário de funcionamento, com destaque para **Aberto agora / Fechado** e a lista da semana
- [ ] **Realtime opcional:** se sobrar tempo, assinar a linha do estacionamento para atualizar as vagas ao vivo, igual à Home do Artur.
- [ ] **Botão "Como chegar"** (RF09): abrir o app de mapas do dispositivo com o destino preenchido, **sem chave de API**.
  - Android: URL `geo:` ou `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`.
  - iOS: Apple Maps ou Google Maps via link universal.
  - Opção do Waze: `https://waze.com/ul?ll=<lat>,<lng>&navigate=yes`.
  - Usar `Linking.openURL` e tratar o erro caso nenhum app consiga abrir. Conferir na doc do Expo da versão usada se é necessário declarar esquemas de URL em `app.json` (principalmente no iOS).
- [ ] Oferecer a escolha entre Google Maps e Waze (ex.: dois botões ou menu de ação).
- [ ] Estados de **carregando**, **erro com "tentar de novo"** e **não encontrado**.
- [ ] **Espaço reservado para o botão de favoritar** (coração no cabeçalho) para o Erico encaixar. Combinar com ele o nome do componente.
- [ ] Acessibilidade: `accessibilityLabel` nos botões e imagens, contraste adequado (RNF09).

## 4. Critérios de aceite
- [ ] Tocar em um estacionamento na Home abre a tela correta, com todos os dados do RF06.
- [ ] "Aberto agora" confere com o horário e o dia reais, inclusive para quem fecha depois da meia-noite.
- [ ] "Como chegar" abre o Google Maps (e o Waze, se instalado) já com o destino correto.
- [ ] A tela não quebra sem imagens, sem horário cadastrado ou com a API fora do ar.
- [ ] `npx expo lint` e `npx tsc --noEmit` sem erros.

## 5. Entrega
PR de `feature/vitor-detalhes` para `develop`, com o SQL de `parking_hours`, a explicação de como subir imagens no Storage e prints da tela no Expo Go.
