# Tarefas — Vinicius de Morais Franzen Cordeiro

**Responsabilidade:** Busca por endereço/região (texto e voz) e Filtros de busca
**Requisitos:** RF03, RF07, RF16 (RNF01, RNF02, RNF09)
**Branch:** `feature/vinicius-busca-filtros`

## Contexto
Você faz o fluxo "quero estacionar perto do meu destino": o usuário digita um endereço, o app geocodifica, recentra a busca nesse ponto e permite refinar com filtros. Sua parte **estende** a rota `GET /parkings` e o mapa/lista que o Artur constrói. Combinem cedo o contrato dos parâmetros.

## Dependências
- **Precisa de:** rota `GET /parkings` e tabela `parkings` (Artur); tabela `parking_hours` (Vitor) para o filtro "aberto agora"; middleware JWT (Lucas).
- **Enquanto isso:** trabalhe com dados mockados no app e teste os filtros com SQL direto no Supabase.
- **Entrega para:** Artur (a Home passa a aceitar um ponto de busca e filtros).

## 1. Contrato dos parâmetros (combinar com o Artur no primeiro dia)
`GET /parkings` aceita, além de `lat`, `lng` e `radius`:

| Param | Tipo | Regra |
|---|---|---|
| `maxPrice` | número | preço máximo por hora |
| `status` | `disponivel` \| `poucas_vagas` \| `lotado` (repetível ou separado por vírgula) | filtra pelo status calculado |
| `openNow` | `true`/`false` | só estacionamentos abertos no momento |
| `radius` | metros | já existe, vira o filtro de distância |
| `sort` | `distance` \| `price` | opcional; padrão `distance` |

Registrar o contrato em um comentário no topo da rota ou em `backend/README.md`.

## 2. Backend (Express)
- [ ] Estender o handler de `GET /parkings` para aplicar os filtros acima.
- [ ] **Validação** de todos os params (tipo, faixa, valores permitidos), retornando `400` com mensagem clara. Nada de interpolar string em SQL: usar parâmetros.
- [ ] **Filtro de status:** reutilizar a função de status do Artur (não duplicar a regra).
- [ ] **Filtro "aberto agora":** comparar o dia da semana e a hora atual com `parking_hours`, no fuso do projeto (definir e documentar, ex.: `America/Sao_Paulo`). Cuidar do caso de horário que passa da meia-noite e de estacionamento 24h.
- [ ] **Geocodificação:** a chamada ao Nominatim pode ser feita pelo app ou por uma rota `GET /geocode?q=` no backend. Recomendado no backend, para mandar o `User-Agent` exigido pelo Nominatim e limitar chamadas. A política de uso pede no máximo 1 requisição por segundo, então aplicar *debounce* no app e *rate limit* na rota.
- [ ] Resposta de `/geocode`: lista de até 5 itens `{ label, lat, lng }`, restrita ao Brasil (`countrycodes=br`).
- [ ] Tratar erro/timeout do Nominatim sem derrubar a rota.

## 3. App (Expo)
Conferir a versão do `expo` no `package.json` e a doc dessa versão antes de usar APIs novas.

- [ ] **Barra de busca** no topo da Home (combinar o encaixe com o Artur), com ícone de busca e botão de limpar.
- [ ] Digitação com *debounce* (~500 ms) e mínimo de 3 caracteres antes de consultar.
- [ ] **Lista de sugestões** abaixo da barra, com estado de carregando e "nenhum endereço encontrado".
- [ ] Ao escolher uma sugestão: guardar o ponto de busca, recentrar o mapa e recarregar `GET /parkings` com `lat`/`lng` do destino.
- [ ] Indicar visualmente que a busca está centrada no destino (ex.: chip "Perto de: <endereço>" com X para voltar à localização atual) e marcar o destino no mapa.
- [ ] **Modal/bottom sheet de filtros** com: distância (slider ou opções 500 m / 1 km / 2 km / 5 km), preço máximo, disponibilidade (chips: Disponível, Poucas vagas) e switch "Aberto agora".
- [ ] Botões **Aplicar** e **Limpar filtros**; mostrar um contador de filtros ativos no botão que abre o modal.
- [ ] Estado de busca/filtros compartilhado com a Home (contexto ou *params* de rota). Combinar com o Artur onde ele fica.
- [ ] Resultado vazio com sugestão ("tente aumentar a distância").
- [ ] Reutilizar `ParkingCard` e `StatusBadge` do Artur para os resultados. Reaproveitar `Input`, `Button` e `Checkbox` de `src/components/ui/`.

## 4. Pesquisa por voz — RF16
A **tela de permissão de microfone** é do **Lucas** (RF17). Você faz o botão de microfone e o reconhecimento de fala.

- [ ] **Decidir a biblioteca de reconhecimento de fala no primeiro dia, junto com o Lucas.** O Expo não traz reconhecimento de fala pronto no SDK; as opções costumam ser módulos nativos (ex.: `expo-speech-recognition`) que **não rodam no Expo Go** e exigem *development build*. Conferir em https://docs.expo.dev/llms.txt e na doc da versão do `expo` do projeto antes de escolher, e avisar o grupo do impacto na demo.
- [ ] Botão de **microfone** dentro da barra de busca, ao lado do botão de limpar, com `accessibilityLabel`.
- [ ] Fluxo ao tocar: se a permissão estiver concedida, começa a ouvir; se não, abre a tela do Lucas (usar o hook `useMicPermission` dele) e, concedida, começa a ouvir.
- [ ] Estado **"ouvindo"** visível (ícone/animação, texto "Fale o endereço…") e botão para cancelar.
- [ ] Idioma `pt-BR`. Mostrar o texto parcial na barra enquanto a pessoa fala, se a biblioteca permitir.
- [ ] Ao finalizar, o texto reconhecido entra na barra e dispara a **mesma busca por texto** (Nominatim) já feita, mostrando as sugestões. Não criar um segundo fluxo.
- [ ] Tratar: nada reconhecido, erro do serviço de fala, sem internet, permissão negada. Em todos, mensagem curta e a busca por texto continua disponível.
- [ ] Parar de ouvir ao sair da tela ou ao app ir para segundo plano.
- [ ] O áudio não deve ser gravado nem enviado ao nosso backend; só o texto resultante é usado (RNF06).

## 5. Critérios de aceite
- [ ] Tocar no microfone, falar "Avenida Paulista" e ver as sugestões de endereço como se tivesse digitado.
- [ ] Negar o microfone mantém a busca por texto funcionando.
- [ ] Digitar um bairro/endereço mostra sugestões e, ao escolher, a lista e o mapa passam a ser do novo ponto.
- [ ] Cada filtro funciona sozinho e combinado com os outros.
- [ ] "Aberto agora" não mostra estacionamento fechado, nem fora do horário nem em dia sem funcionamento.
- [ ] Param inválido retorna `400`, sem erro `500`.
- [ ] Não passa de 1 requisição/s ao Nominatim.
- [ ] `npx expo lint` e `npx tsc --noEmit` sem erros.

## 6. Entrega
PR de `feature/vinicius-busca-filtros` para `develop`, com o contrato dos params documentado e prints do app (busca e modal de filtros).
