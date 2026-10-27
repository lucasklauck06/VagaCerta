# Tarefas — Erico Campos Kempfer

**Responsabilidade:** Favoritos e Perfil
**Requisitos:** RF10, RF11, RF15 (RNF06; seção 5.10 de segurança)
**Branch:** `feature/erico-favoritos-perfil`

## Contexto
Você cuida de tudo que é **do usuário**: salvar estacionamentos, listar/gerenciar os favoritos e a tela de perfil. É o recurso que justifica a conta (seção 5.3 do doc) e o ponto onde a **segurança dos dados por usuário** (JWT + RLS) aparece de forma concreta.

## Dependências
- **Precisa de:** middleware JWT e `lib/api` com token (Lucas); tabela `parkings` (Artur) para a chave estrangeira.
- **Enquanto isso:** faça a tela com dados mockados e uma versão local do estado dos favoritos.
- **Entrega para:** Artur e Vitor, que vão colocar o botão de favoritar nos cards e nos detalhes.

## 1. Banco de dados (Supabase)
- [ ] Criar a tabela `favorites`:
  - `user_id` text (id do usuário no Clerk, ex.: `user_...`)
  - `parking_id` uuid FK para `parkings.id` (`on delete cascade`)
  - `created_at` timestamptz default now()
  - chave primária composta `(user_id, parking_id)`, o que impede favorito duplicado
- [ ] Índice por `user_id`.
- [ ] Salvar o SQL versionado (ex.: `backend/sql/003_favorites.sql`).
- [ ] **RLS:** ativar *Row Level Security* na tabela (seção 5.10). Como o backend usa a chave de serviço (que ignora a RLS), a regra efetiva é aplicada **no código do backend**, sempre filtrando por `req.userId`. Deixar a RLS ativada, com política que negue acesso direto à chave anon, e documentar essa decisão no README. Se o grupo quiser RLS com o JWT do Clerk de ponta a ponta, é preciso configurar a integração do Clerk com o Supabase; verificar a doc atual antes e combinar com o grupo.

## 2. Backend (Express)
Todas as rotas usam o middleware `requireAuth` do Lucas e o `userId` vindo do token, **nunca** do corpo ou da URL.

- [ ] `GET /favorites`: lista os estacionamentos favoritos do usuário, com os mesmos campos usados pelo card da Home (nome, endereço, preço, vagas, status, imagem). Aceitar `lat`/`lng` opcionais para calcular a distância.
- [ ] `POST /favorites/:parkingId`: adiciona. Idempotente (se já existir, retorna sucesso sem duplicar). `404` se o estacionamento não existir.
- [ ] `DELETE /favorites/:parkingId`: remove. Idempotente.
- [ ] `GET /favorites/ids`: só os ids favoritos do usuário, para o app pintar o coração dos cards sem carregar tudo.
- [ ] Validar `parkingId` (uuid) e retornar `400` para formato inválido.
- [ ] **Teste de isolamento:** garantir que o usuário A nunca vê nem remove favoritos do usuário B (testar com 2 contas).

## 3. App (Expo)
Conferir a versão do `expo` no `package.json` e a doc dessa versão antes de usar APIs novas.

### Favoritos (RF10, RF11)
- [ ] **Estado global dos favoritos** (contexto ou hook, ex.: `useFavorites`) com `ids`, `isFavorite(id)`, `toggle(id)`. Carregar ao logar e limpar ao deslogar.
- [ ] **Componente `FavoriteButton`** (coração) reutilizável, com *update otimista* (atualiza a tela na hora e desfaz se a API falhar). **Avisar o Artur e o Vitor** do nome e das props para encaixarem no `ParkingCard` e no cabeçalho da tela de detalhes.
- [ ] **Aba/tela Favoritos:** adicionar a aba em `src/components/app-tabs.tsx` e a rota em `src/app/(tabs)/` (hoje as abas são `home` e `explore`; o `explore` vem do template e pode ser substituído/removido, combinando com o grupo).
- [ ] Lista de favoritos reutilizando `ParkingCard` e `StatusBadge` do Artur; tocar abre os detalhes (rota do Vitor).
- [ ] Remover um favorito (pelo coração ou por deslizar/botão) com atualização imediata.
- [ ] **Estado vazio** ("Você ainda não salvou nenhum estacionamento") com botão para ir à Home.
- [ ] Estados de carregando e erro com "tentar de novo". Se não estiver logado, direcionar para o login (o Lucas faz a proteção de rotas).

### Perfil (RF15)
- [ ] Nova tela de perfil (aba ou acesso pelo cabeçalho, combinar com o grupo).
- [ ] Mostrar **nome, e-mail e foto** do usuário vindos do Clerk (`useUser`).
- [ ] Botão **Sair** (logout do Clerk) que limpa o estado de favoritos e volta ao login, com confirmação.
- [ ] Seção **Privacidade e localização**: texto curto explicando que a localização só é usada para buscar estacionamentos e não é armazenada de forma permanente (RNF06, LGPD).
- [ ] Mostrar o estado atual das permissões de localização, notificações e **microfone** (hook `useMicPermission` do Lucas) com um atalho para as configurações do sistema (`Linking.openSettings()`).
- [ ] Versão do app na parte de baixo.
- [ ] Reaproveitar `Brand`, `Button` e demais componentes de `src/components/ui/`.

## 4. Critérios de aceite
- [ ] Favoritar no card e nos detalhes reflete na aba Favoritos e vice-versa, sem recarregar tudo.
- [ ] Os favoritos permanecem após fechar e reabrir o app, e são por conta (logar com outro usuário mostra outra lista).
- [ ] Sem token, as rotas respondem `401`.
- [ ] Um usuário não consegue ler nem apagar favorito de outro (testado).
- [ ] O logout leva ao login e limpa os dados da sessão.
- [ ] `npx expo lint` e `npx tsc --noEmit` sem erros.

## 5. Entrega
PR de `feature/erico-favoritos-perfil` para `develop`, com o SQL de `favorites`, a explicação da decisão sobre RLS e prints do app (favoritos e perfil) no Expo Go.
