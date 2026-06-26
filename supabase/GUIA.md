# Configurar o Supabase — TotoGraça

Segue por ordem. Demora ~10 minutos.

## 1. Criar o projeto
1. Vai a https://supabase.com → **Sign in** (entra com o GitHub ou email).
2. **New project** → dá um nome (ex: `totograca`), escolhe a região **West EU (London)** ou **Frankfurt**, define uma password da base de dados (guarda-a) → **Create**.
3. Espera 1–2 min até o projeto ficar pronto.

## 2. Criar as tabelas
1. No menu lateral: **SQL Editor** → **New query**.
2. Abre o ficheiro [`schema.sql`](./schema.sql), copia **tudo** e cola.
3. Clica **Run**. Deve dizer "Success".

## 3. Criar as 3 contas
1. Menu lateral: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Cria as 3 contas (liga a opção **Auto Confirm User** em cada uma):
   - **admin** — email e password à tua escolha (esta é a tua conta de gestão)
   - **leo** — email e password
   - **leonel** — email e password
3. Volta ao **SQL Editor** → **New query**, cola o [`contas.sql`](./contas.sql).
   - **Ajusta os 3 emails** no script para os que usaste no passo anterior.
   - **Run**. A última linha mostra as 3 contas com os papéis (admin/user).

## 4. Dar os dados à app
1. Menu lateral: **Project Settings** (engrenagem) → **API**.
2. Copia dois valores:
   - **Project URL**
   - **anon public** key
3. Envia-mos (são seguros para partilhar) — eu ligo a app ao Supabase.
   - Localmente vão para `app/.env`
   - No Vercel vão em **Settings → Environment Variables** (as mesmas duas variáveis).

Quando tiveres o passo 1–3 feitos e me deres os valores do passo 4, eu trato de ligar a app à nuvem.
