# Tarefas — Lucas Sehn Klauck

**Responsabilidade:** Base do backend, Autenticação (login, criar conta, esqueci senha) e permissões de Localização, Notificações e Microfone
**Requisitos:** RF01, RF13, RF14, RF17 (RNF04, RNF06, RNF10; seção 5.10 de segurança)
**Branch:** `feature/lucas-auth-base`

## Contexto
O front de **Login**, **Localização** e **Notificações** já existe (`src/app/index.tsx`, `localizacao.tsx`, `notificacoes.tsx`) e hoje navega sem fazer nada real. Falta: ligar ao Clerk, criar as telas de cadastro e recuperação de senha, trocar os mocks pelas permissões reais e, principalmente, **montar a base do backend que todos os outros usam**.

## Prioridade
**O esqueleto do Express e o middleware JWT são pré-requisito dos outros 4 alunos. Entregue a Parte 1 primeiro, em um PR pequeno e separado**, e só depois siga para as telas.

## 1. Base do backend (Node + Express) — fazer primeiro
- [X] Criar a pasta `backend/` (ou o nome que o grupo escolher) com `package.json`, servidor Express e script `dev`.
- [x] Estrutura mínima para os outros plugarem rotas: `routes/`, `middleware/`, `lib/supabase.js` e `index.js`. O objetivo é cada aluno adicionar seu arquivo de rotas sem conflito.
- [x] Cliente do Supabase com a **chave de serviço**, lida de variável de ambiente e usada só no backend.
- [x] **Segurança (seção 5.10):** `helmet`, `cors` configurado, `express-rate-limit` e `express.json()` com limite de tamanho.
- [x] **Middleware JWT do Clerk** (`requireAuth`): valida o token do header `Authorization: Bearer ...` e coloca o `userId` em `req`. Responde `401` sem token ou com token inválido. Usar o SDK oficial do Clerk para Node/Express; conferir a doc atual antes de escrever.
- [x] Rota `GET /health` pública e `GET /me` protegida (retorna o `userId`), para todos testarem a autenticação.
- [x] Tratamento de erros centralizado (resposta JSON padronizada, sem vazar stack trace).
- [x] `.env.example` com os nomes das variáveis (sem valores), `.env` no `.gitignore`.
- [x] `backend/README.md` com: como rodar, variáveis necessárias e como chamar uma rota protegida. Lembrar que no Expo Go o celular acessa o backend pelo **IP da máquina na rede Wi-Fi**, não por `localhost`.
- [X] Avisar o grupo quando o PR estiver aprovado.

## 2. Autenticação com Clerk (app)
Conferir a versão do `expo` no `package.json` e a doc do Clerk para Expo antes de começar. O Expo Go limita alguns recursos nativos; confirmar o que funciona nele (ex.: login com Google pode exigir fluxo OAuth pelo navegador).

- [x] Criar a aplicação no Clerk, ativar e-mail/senha e Google, e guardar a *publishable key* em variável de ambiente do app.
- [x] Instalar com `npx expo install` e envolver o app com o `ClerkProvider` em `src/app/_layout.tsx`, com *token cache* seguro (`expo-secure-store`).
- [x] **Proteção de rotas:** usuário não logado vai para o login; logado vai direto para a Home. Quem já viu Localização/Notificações não precisa vê-las de novo (guardar essa flag localmente).
- [x] **Login** (`src/app/index.tsx`): ligar os campos de e-mail e senha ao Clerk, mostrar erros (credenciais inválidas, e-mail inexistente, sem conexão) e estado de carregando no botão. Hoje o botão "Entrar" só chama `router.replace('/localizacao')`.
- [x] Ligar o checkbox "Lembrar de mim" a algo real ou removê-lo (decidir com o grupo; a sessão do Clerk já persiste).
- [x] **Login com Google:** ligar o botão "Entrar com Google".
- [x] **Login com Apple:** ligar o botão "Entrar com Apple".
- [x] Adicionar uma função de `fetch` autenticado em `src/` (ex.: `lib/api.ts`) que anexa o token do Clerk e usa a URL base do backend por variável de ambiente. **Todos os alunos vão usar**, então avise quando estiver pronta.

## 3. Criar conta — RF13 (tela nova)
- [x] Nova rota (ex.: `src/app/cadastro.tsx`), com o mesmo visual do login (reaproveitar `Input`, `Button` e `Brand`).
- [x] Campos: nome, e-mail, senha e confirmar senha. Validar no app: e-mail válido, senha com tamanho mínimo, senhas iguais.
- [x] Fluxo do Clerk para e-mail/senha, incluindo a **verificação por código enviado ao e-mail**, se estiver ativada.
- [x] Botão "Criar com Google".
- [x] Botão "Criar com Apple".
- [x] Link "Criar conta" do login passa a navegar para essa tela, e a tela tem um "Já tenho conta".
- [x] Mensagens de erro claras (e-mail já cadastrado, senha fraca).

## 4. Esqueci minha senha — RF14 (tela nova)
- [x] Nova rota (ex.: `src/app/esqueci-senha.tsx`).
- [x] Passo 1: informar o e-mail e solicitar o código/link. Passo 2: informar o código e a nova senha.
- [x] Ligar o "Esqueci minha senha" do login a essa tela (hoje o `Pressable` não faz nada).
- [x] Não revelar se um e-mail existe ou não na mensagem de sucesso, se o Clerk permitir esse comportamento.
- [x] Voltar ao login com mensagem de sucesso ao final.

## 5. Permissão de localização — RF01 (`localizacao.tsx`)
- [x] Trocar o comentário "Somente frontend" por `expo-location`: pedir a permissão em primeiro plano ao tocar em "Permitir acesso à localização".
- [x] Seguir para Notificações tanto se aceitar quanto se negar ("Agora não" não pede nada).
- [x] Criar um hook compartilhado (ex.: `useUserLocation`) que retorna `status` da permissão e coordenadas. **O Artur usa na Home**, então combine a assinatura com ele.
- [x] Caso o usuário negue: não travar o app; a Home deve funcionar sem a posição.
- [x] Não armazenar a localização de forma permanente (RNF06).
- [x] Definir a mensagem de uso da localização na configuração do app (`app.json`/plugin), conforme a doc do Expo da versão usada.

## 6. Permissão de notificações (`notificacoes.tsx`)
- [x] O doc (seção 5.9) diz que push está **fora do escopo inicial**. Implementar só a **solicitação de permissão** com `expo-notifications`; não é preciso enviar push de verdade.
- [x] Guardar as preferências dos switches localmente (ex.: `AsyncStorage`) para o Erico poder mostrar/alterar no Perfil, se quiserem.
- [ ] O Expo Go tem restrições com notificações push remotas; se atrapalhar, deixar só a permissão local e registrar no README.
- [x] Ao terminar (aceitando ou não), marcar o onboarding como concluído e ir para a Home.

## 7. Permissão de microfone — RF17 (tela nova)
A pesquisa por voz (RF16) é feita pelo **Vinicius** na barra de busca; você entrega a **tela de permissão** e o **hook** que ele usa.

- [x] Nova rota (ex.: `src/app/microfone.tsx`), no mesmo padrão visual de `localizacao.tsx` e `notificacoes.tsx` (ícone grande, título, texto, card com benefícios, botões "Permitir" e "Agora não").
- [x] Texto deixando claro que o microfone é usado **só para pesquisar endereços por voz** e que a pesquisa por texto continua disponível.
- [x] "Permitir" dispara a permissão real do microfone. Qual API usar depende de como o Vinicius fará o reconhecimento de fala (veja o ponto sobre Expo Go abaixo); combinem a biblioteca **antes** de implementar, para pedirem a mesma permissão.
- [x] Criar um hook compartilhado (ex.: `useMicPermission`) que retorna `status` (`undetermined` / `granted` / `denied`) e `request()`. **O Vinicius usa no botão de microfone**, então combine a assinatura com ele.
- [ ] **Quando mostrar a tela:** decidam com o Vinicius entre (a) no onboarding, depois de Notificações, ou (b) **sob demanda**, na primeira vez que o usuário tocar no microfone. A (b) é a mais indicada por ser contextual e não pedir algo que o usuário talvez nunca use. Se for (b), a tela abre como modal/tela empilhada e volta para a busca ao terminar.
- [x] Se a permissão estiver **negada de forma permanente**, a tela deve oferecer "Abrir configurações" (`Linking.openSettings()`) em vez de pedir de novo.
- [x] Negar não trava nada: volta para a barra de busca com o teclado normal.
- [x] Declarar a mensagem de uso do microfone na configuração do app (`app.json`/plugin), conforme a doc do Expo da versão usada. No iOS, o reconhecimento de fala também pode exigir uma descrição própria.
- [ ] **Expo Go:** o reconhecimento de fala geralmente depende de módulo nativo que o Expo Go não traz, o que exigiria um *development build* (`npx expo run:android|ios` ou `eas build --profile development`). Confirmar na doc do Expo com o Vinicius **no primeiro dia** e avisar o grupo, porque a seção 5.2 do doc prevê demonstração só pelo Expo Go.
- [ ] Avisar o Erico para incluir o estado do microfone na seção de permissões do Perfil.

## 8. Critérios de aceite
- [ ] A tela de microfone aparece antes do primeiro uso do recurso e, negando, a busca por texto segue funcionando.
- [ ] Qualquer aluno consegue subir o backend seguindo o README e receber `401` sem token e `200` com token em `GET /me`.
- [ ] Cadastro → verificação → Home funciona; login e logout funcionam; sessão persiste ao reabrir o app.
- [ ] Recuperação de senha funciona de ponta a ponta com um e-mail real de teste.
- [ ] Negar a localização ou as notificações não quebra o fluxo.
- [ ] Nenhum segredo no Git (`.env` ignorado); a chave de serviço do Supabase só existe no backend.
- [ ] `npx expo lint` e `npx tsc --noEmit` sem erros.

## 9. Entrega
Dois PRs para `develop`: (1) `backend` base + JWT, (2) telas de autenticação e permissões. Incluir prints do fluxo no Expo Go.
