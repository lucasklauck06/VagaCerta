## Como Rodar?
1. cd backend
2. copie o .env.example para .env
   ```
   PORT=3000
   CORS_ORIGIN=http://localhost:8081
   SUPABASE_URL= Supabase: tela inicial, copy, project url;
   SUPABASE_SECRET_KEY= Supabase: Project Settings → API Keys;
   CLERK_PUBLISHABLE_KEY= Clerk: Project Settings → API Keys;
   CLERK_SECRET_KEY= Clerk: Project Settings → API Keys;
   ```
   
3. Instalar dependências: `npm install`
4. Rodar: `npm run dev`

## Como chamar uma rota protegida?
Rotas protegidas exigem o token do Clerk no cabeçalho `Authorization`:

```
Authorization: Bearer <token>
```

Sem token, ou com token inválido, a resposta é `401 {"error":"Não autenticado"}`. Com token válido, a rota recebe o id do usuário em `req.userId`.

**No app**, use a função `api` de `src/lib/api.ts`. Ela já anexa o token e a URL base:

```ts
import { api } from '@/lib/api';

const { userId } = await api<{ userId: string }>('/me');
await api('/favoritos', { method: 'POST', body: { vagaId } });
```

**Para proteger a sua rota no backend**, crie `routes/<recurso>.js` com um `Router` e monte-o no `index.js` com o `requireAuth`:

```js
app.use('/vagas', requireAuth, require('./routes/vagas'));
```

Dentro da rota, use `req.userId` para saber quem está chamando. Rotas públicas (como `/health`) são montadas sem o `requireAuth`.

**Teste rápido** (deve responder `401`):

```bash
curl -i http://localhost:3000/me
```

## Como o celular acessa o backend?
No celular, `localhost` aponta para o **próprio celular**, não para o seu computador. O app precisa usar o **IP do computador na rede Wi-Fi**.

1. Descubra o seu IP:
   - **Windows:** `ipconfig` → procure o "Endereço IPv4" do adaptador Wi-Fi (ex.: `192.168.0.15`)
   - **Mac:** `ipconfig getifaddr en0`
2. No `.env` da **raiz do app** (não o do backend), coloque:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.15:3000
   ```
   Reinicie o `npx expo start` depois de mudar o `.env`.
3. Celular e computador precisam estar **na mesma rede Wi-Fi**.
4. **Teste:** abra `http://SEU-IP:3000/health` no navegador do celular. Deve aparecer `{"status":"ok"}`.

Se não conectar:
- **Windows:** o firewall costuma bloquear o Node. Aceite o aviso para **redes privadas** ou libere a porta 3000 no Firewall do Windows.
- Redes de faculdade/empresa às vezes isolam os aparelhos entre si. Nesse caso, use o roteador do celular (hotspot).
- O IP muda quando você troca de rede. Se parou de funcionar, rode o comando do passo 1 de novo.
