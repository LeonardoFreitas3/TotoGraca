# CLAUDE.md

> Ficheiro de contexto do projeto. Lido no início de cada sessão de trabalho com o Claude.
> Atualizado no fim de cada sessão. Nunca colocar aqui passwords, tokens, chaves de API ou connection strings reais.
>
> Objetivo deste ficheiro: qualquer sessão nova (mesmo noutra conta de Claude) consegue continuar o trabalho só a partir do repositório.

---

## 1. Visão geral

- **Nome:** TotoGraça
- **O que é:** PWA (app web instalável no telemóvel) de palpites tipo "totobola" para o clube **Águias da Graça** (ADAG — Associação Desportiva Águias da Graça Futebol Clube, última divisão distrital da AF Braga). Todas as semanas há uma jornada com os jogos da série; jogadores do plantel e adeptos apostam 1/X/2 em cada jogo; quem acertar **todos** os jogos é "Vencedor" da jornada. A app também gere as **multas e cotas do balneário** (plantel + equipa técnica) e as **cotas por jornada dos adeptos**.
- **Para quem:** jogadores do plantel (role `user`), adeptos que se registam na app (role `adepto`) e um único administrador (role `admin`, que não aposta, só gere).
- **Dono / utilizador principal:** Leonardo Freitas (leonardo@signa.pt), jogador do plantel. Perfil **não técnico**: guiar passo a passo em tudo o que for painel do Supabase/Vercel. Prefere receber SQL para correr ele próprio no SQL Editor do Supabase.
- **Estado:** **em produção** desde outubro de 2026, época 2026/2027 a decorrer (J1 fechou a 16/10/2026).
- **URL produção:** https://totograca.vercel.app
- **URL staging/teste:** não existe. Testes fazem-se em local (`npm run dev`, porta 3005) contra a **mesma** base de dados de produção (cuidado com dados de teste: apagar pela UI da app, linha a linha).
- **Repo:** https://github.com/LeonardoFreitas3/TotoGraca (branch `main`; Vercel faz deploy automático de cada push).
- **Supabase:** um projeto (região EU). A URL (que contém o ref do projeto) e a anon key estão em `app/.env` (não versionado) e nas Environment Variables do Vercel; o Leonardo tem acesso ao painel.

## 2. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + TypeScript, Vite, react-router-dom, vite-plugin-pwa (service worker `autoUpdate`, manifest) | React 19.2, Vite 8.1, TS 6.0, router 7.18, PWA plugin 1.3 |
| Backend | Não há backend próprio. A app fala diretamente com o Supabase (PostgREST + Auth) com a anon key; toda a lógica de permissões está em RLS e funções SQL `security definer` | supabase-js 2.108 |
| Base de dados | Supabase (PostgreSQL) — esquema em `supabase/*.sql`, aplicado manualmente no SQL Editor | — |
| Autenticação | Supabase Auth (email+password). Jogadores entram por **username** (`nome` ou `nome.apelido`), que a app converte em `username@totograca.local`; adeptos registam-se com email real. "Confirm email" está **desligado** | — |
| Alojamento / deploy | Vercel, projeto `totograca`, Root Directory = `app`, deploy automático por push no GitHub. `app/vercel.json` tem o rewrite SPA e headers de segurança | — |
| Armazenamento de ficheiros | Nenhum. PDF das multas é `window.print()` com CSS `@media print` (`.print-sheet` em `index.css`), sem biblioteca | — |
| Serviços externos / APIs | **zerozero.pt** (scraping, sem API) para resultados automáticos — corre no PC do Leonardo, não no Vercel (zerozero devolve 403 a IPs cloud). Google Fonts (Hanken Grotesk + Material Symbols Outlined), Tabler Icons via CDN (só 3 ícones residuais). Cloudflare Turnstile opcional (desligado) | — |
| Ferramentas | Node 24, npm 11, oxlint 1.69 (`npm run lint`). Sem framework de testes: `node scripts/zz.check.mjs` é o único check | — |

## 3. Estrutura do repositório

```
/
├── CLAUDE.md                     ← este ficheiro
├── .gitignore                    ← ignora .claude/, **/.env, **/.env.local, app/scripts/*.log
├── app/                          ← a aplicação (Root Directory no Vercel)
│   ├── .env.example              ← nomes das variáveis (sem valores)
│   ├── .env                      ← NÃO versionado: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (robô)
│   ├── index.html                ← fontes Google, Material Symbols, meta PWA/iOS
│   ├── vite.config.ts            ← porta 3005, host true (abrir no telemóvel na mesma rede), manifest PWA
│   ├── vercel.json               ← rewrite SPA + headers (nosniff, X-Frame DENY, Referrer, Permissions, HSTS)
│   ├── public/                   ← logo.jpg (emblema ADAG), icon-192.png, icon-512.png (maskable), favicon.svg, icons.svg
│   ├── scripts/                  ← robô de resultados (corre no PC, agendado no Windows)
│   │   ├── sync-results.mjs      ← lê jornadas fechadas sem resultado, vai ao zerozero, grava com a service key
│   │   ├── zz.js                 ← lógica pura: fetch da página da jornada, parser HTML, emparelhar equipas por nome (ZZ_EDICAO/ZZ_FASE aqui)
│   │   ├── zz.check.mjs          ← asserts do parser/emparelhamento (`node scripts/zz.check.mjs`)
│   │   └── sync-results.log      ← NÃO versionado; output das execuções agendadas
│   ├── prints/                   ← NÃO versionado (untracked): screenshots da app para divulgação (1-inicio, 2-taca, 3-vencedores)
│   └── src/
│       ├── main.tsx              ← BrowserRouter + App
│       ├── App.tsx               ← rotas; `Protected` (redireciona para /login; adminOnly)
│       ├── supabase.ts           ← createClient com as VITE_* (avisa na consola se faltarem)
│       ├── store.ts              ← TODA a camada de dados (cache local reativa + Supabase). Ver §7
│       ├── types.ts              ← tipos + constantes de produto (CURRENT_SEASON, CLUB_TEAM, FINE_TABLE, COTA_VALUE, ADEPTO_COTA, PRIZE, MBWAY_PHONE, PAY_HINT…)
│       ├── utils.ts              ← formatação de datas, countdown, `jornadaLabel` (número 0 = "Taça")
│       ├── index.css             ← design tokens (:root), shell da app, componentes, `.print-sheet` + @media print
│       ├── App.css               ← resíduo do template Vite (praticamente não usado)
│       ├── components/
│       │   ├── Layout.tsx        ← topbar (emblema, título, ícone de perfil com ponto vermelho se deve) + bottom nav (Jornada / Vencedores / Histórico ou Admin)
│       │   ├── JornadaPanel.tsx  ← ecrã da jornada: regras ("Como funciona"), avisos, jogos com PickSelector/PickReview, vencedores, grelha
│       │   ├── Picks.tsx         ← PickSelector (botões V1/X/V2 com nomes das equipas) e PickReview (leitura, certo/errado)
│       │   ├── PicksGrid.tsx     ← tabela "Palpites de todos" (plantel) + "Palpites dos adeptos" (com coluna ADAG); admin vê sempre, outros após o fecho
│       │   ├── AdeptoTag.tsx     ← pastilha "Adepto" só visível ao admin (+ `adeptoSuffix`)
│       │   ├── InstallHint.tsx   ← overlay "como instalar no iPhone/Android"; `isStandalone()`
│       │   └── Crest.tsx         ← emblema
│       └── pages/
│           ├── Login.tsx         ← login por username/email; modo "Sou adepto, quero criar conta" (nome, email, pass ≥ 8); Turnstile opcional; link "Como instalar a app"
│           ├── Home.tsx          ← jornada da semana (JornadaPanel) + banner da última jornada terminada
│           ├── Jornadas.tsx      ← "Vencedores": classificação da época (nº de jornadas ganhas) + cartão por jornada com estado e vencedores
│           ├── JornadaView.tsx   ← /jornada/:id → JornadaPanel de uma jornada qualquer
│           ├── Historico.tsx     ← histórico do próprio (jogadores/adeptos; admin não tem)
│           ├── Perfil.tsx        ← username, dívida de multas/cotas (só role user), mudar nome, mudar password, sair
│           └── admin/
│               ├── Admin.tsx     ← /admin: CTA "Lançar resultados", stats, separadores Jornadas / Plantel / Adeptos / Equipas / Multas
│               ├── AdminJornada.tsx ← /admin/jornada/:id: resultados (grava no blur), adiado, fecho das apostas, jogos (add/remove), apagar jornada
│               └── Multas.tsx    ← separador Multas: mês, lançar cota mensal a todos, nova multa (A–Q), lista por pessoa com "paga", folha de impressão (PDF)
├── supabase/                     ← SQL a correr À MÃO no SQL Editor (ordem em §5) + GUIA.md (criar projeto, contas, chaves)
└── docs/
    └── zerozero-robot.md         ← investigação/plano original do robô zerozero (parte já desatualizada: o robô corre no PC, não no Vercel)
```

**ATENÇÃO — repositório git aninhado:** existe `app/.git` (repo antigo com o mesmo remoto). Fazer **sempre** `git` a partir da raiz `C:\Projetos\totograca`. Nunca correr git dentro de `app/`.

`.claude/` está no `.gitignore`. O `.claude/launch.json` local tem esta configuração (recriar se faltar):
```json
{ "version": "0.0.1", "configurations": [ { "name": "totograca", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "cwd": "app", "port": 3005 } ] }
```

## 4. Como correr localmente

```bash
# instalar dependências
cd app && npm install

# variáveis de ambiente necessárias em app/.env (só os NOMES, nunca os valores)
#   VITE_SUPABASE_URL           Supabase → Project Settings → API → Project URL
#   VITE_SUPABASE_ANON_KEY      Supabase → Project Settings → API → anon public
#   VITE_TURNSTILE_SITE_KEY     opcional; só com "Captcha protection" ligado no Supabase (está desligado)
#   SUPABASE_SERVICE_ROLE_KEY   só para o robô scripts/sync-results.mjs; NUNCA no cliente nem no git; nunca pedir o valor no chat

# correr (porta 3005, acessível no telemóvel pela mesma rede Wi-Fi)
npm run dev

# build de produção (tsc -b && vite build) e lint
npm run build
npm run lint

# testes (único check existente: parser + emparelhamento do robô)
node scripts/zz.check.mjs

# robô de resultados à mão (a partir de app/)
node scripts/sync-results.mjs --dry    # só mostra
node scripts/sync-results.mjs          # grava
```

Fluxo típico de desenvolvimento: editar → `npm run build` (apanha erros TS) → testar em local com a conta admin ou uma conta de teste → commit na raiz → push (Vercel publica sozinho em ~1 min).

## 5. Deploy

- **Como é feito:** CI/CD do Vercel ligado ao GitHub. Cada push para `main` publica em https://totograca.vercel.app. Root Directory = `app`; build `npm run build`; output `dist/`.
- **Pipeline:** não há ficheiro de workflow. `app/vercel.json` só tem o rewrite `/(.*) → /index.html` (SPA, evita 404 ao recarregar) e os headers de segurança. Env vars no Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (e `VITE_TURNSTILE_SITE_KEY` se um dia se ligar o captcha) → depois de mudar variáveis é preciso **redeploy**.
- **Base de dados — não há migrações automáticas.** Alterações de esquema/policies/funções fazem-se com ficheiros em `supabase/` que o Leonardo cola no SQL Editor. Todos são idempotentes (seguro repetir). **Ordem histórica de aplicação** (tudo já corrido em produção):
  1. `schema.sql` — tabelas base, `is_admin()`, `match_deadline()`, trigger `handle_new_user`, RLS inicial, trigger `protect_profile_fields`
  2. `contas.sql` — primeiras contas (histórico)
  3. `admin-nao-aposta.sql` — policies de tips excluem o admin (substituído depois)
  4. `importar-epoca-2627.sql` — 14 equipas (sem a Águias), 30 jornadas (fecho sáb 09:00), 182 jogos (função `tid()`)
  5. `admin-username.sql` — admin entra com `admin` (email `admin@totograca.local`)
  6. `criar-jogadores.sql` — plantel com `username@totograca.local`, password inicial comum (está no próprio ficheiro; cada jogador muda-a em /perfil), status approved (padrão para criar novos jogadores)
  7. `correcoes.sql` — trigger de proteção role/status + deadlines para 09:00 hora de Lisboa
  8. `multas.sql` — tabela `fines` + `fines_own_read`
  9. `apostar-so-jornada-atual.sql` — `can_bet()` v1 + policies de tips passam a usar `can_bet`
  10. `equipa-tecnica.sql` — tabela `staff`; `fines.user_id` XOR `fines.staff_id`
  11. `adiados.sql` — `matches.postponed`
  12. `cota-para-apostar.sql` — role `adepto` (default), `adepto_contacts()`, `fines.jornada_id`, `can_bet()` v2
  13. `adeptos-jogo-aguias.sql` — equipa Águias em `teams`, 28 jogos dela, `fans_only()`, `can_bet()` v3
  14. `adeptos-sem-taca.sql` — `can_bet()` v4 (Taça não bloqueia adeptos)
  15. `seguranca.sql` — `is_approved()`, policies por conta ativa, `can_bet()` v5 (**versão final em vigor**), `delete_user()`, nome ≤ 40, revokes
  - `exemplo-jornadas.sql` / `apagar-exemplos.sql` — só para dados de exemplo (não usar em produção; o `apagar-exemplos` apaga TODA a época 2026/2027).
- **Cuidados:**
  - A `can_bet()` existe em 5 ficheiros; a que vale é a de `seguranca.sql`. Qualquer alteração futura deve ser um ficheiro novo que a recrie por completo.
  - DDL e policies só pelo SQL Editor (o Leonardo). Correções de **dados** podem ser feitas via REST com a service key (PATCH/insert/delete pontuais); `DELETE` em massa via REST é bloqueado — apagar pela UI.
  - Service worker `autoUpdate`: os telemóveis apanham a versão nova ao reabrir a app.
  - Vercel/Cloud não chega ao zerozero (403) nem à FPF (Cloudflare) → o robô fica no PC.

## 6. Modelo de dados

Modelos TS em `app/src/types.ts`; mapeamento snake_case → camelCase feito em `loadAll()` no `store.ts`. Esquema SQL em `supabase/schema.sql` + ficheiros incrementais.

| Entidade | Campos principais | Relações / notas |
|---|---|---|
| `profiles` (User) | `id` (= auth.users.id), `name` (≤ 40), `role` ∈ admin/user/adepto (default `adepto`), `status` ∈ pending/approved/rejected (default `pending`), `created_at` | Criado por trigger `handle_new_user` ao criar login (nome vem de `raw_user_meta_data.name`). Trigger `protect_profile_fields`: só admin muda role/status. Pode existir coluna `birthday` sem uso. Email **nunca** sai para a app exceto via `adepto_contacts()` (só admin) |
| `teams` | `id`, `name`, `season` | `season = '2026/2027'` para a série; `season = 'Taça'` para os 13 adversários da Taça (não aparecem na lista de equipas, `listTeams` filtra por época; `teamName` procura em todas; **não apagar**, os jogos da Taça referenciam-nas). A **Águias da Graça** existe em `teams` só para o jogo dos adeptos |
| `jornadas` | `id`, `number`, `season`, `deadline` (timestamptz, fecho das apostas) | `number = 0` → **Taça** (`jornadaLabel`). Fecho por norma **sábado 09:00 Lisboa**; exceções: J1 sexta 16/10/2026 09:00 (Águias jogou à sexta), J28 quinta 27/05/2027 09:00. Listadas ascendente 1→30 |
| `matches` | `id`, `jornada_id`, `home_team_id`, `away_team_id`, `home_score`, `away_score` (null = sem resultado), `postponed` (bool), `created_at` | Ordem fixa `order(created_at).order(id)` para "Jogo N" não mudar. Jogo com a Águias = "só adeptos" (`fans_only()` / `isFansOnly`); jogadores não o veem nem conta na chave deles. Adiado não conta e o robô ignora-o |
| `tips` | `id`, `user_id`, `match_id`, `pick` ∈ V1/X/V2 | `unique(user_id, match_id)`; upsert. RLS: próprio sempre; dos outros só após `match_deadline` e para contas ativas; inserir/alterar só se `can_bet(match_id)` e não admin |
| `fines` | `id`, `user_id` **ou** `staff_id` (exatamente um), `code`, `amount` numeric(6,2), `date`, `paid`, `jornada_id` (só code JORNADA), `created_at` | `code`: `A`..`Q` (catálogo `FINE_TABLE`), `COTA` (cota mensal 5 €, uma linha por pessoa por mês, data `YYYY-MM-01`), `JORNADA` (cota de 2 € do adepto, criada já paga pelo admin). RLS: admin tudo; cada um lê as suas |
| `staff` | `id`, `name` | Equipa técnica **sem conta**: só para multas/cotas. RLS só admin. Nomes iniciais: Mister Zequinha, Mister Edu Pinto, Mister Mauro, Dir. Desp. Artur Borges |

Funções SQL (`security definer`): `is_admin()`, `is_approved()` (approved ou admin), `match_deadline(m)`, `fans_only(m)`, `can_bet(m)` (regra completa de aposta, ver §7), `tid(name, season)`, `adepto_contacts()` (emails, só admin), `delete_user(uid)` (admin apaga `auth.users`, cascade apaga perfil/palpites/cotas; não apaga admin).

**Regra `can_bet(m)` em vigor (seguranca.sql):** conta `approved` **e** jornada ainda aberta **e** é a primeira jornada aberta da época (para adeptos a Taça não conta como anterior) **e** (se adepto: jornada ≠ 0 e tem linha `fines` JORNADA paga para essa jornada; senão: o jogo não é o da Águias).

## 7. Convenções e regras

- **Língua:** toda a UI, comentários e commits em **português de Portugal**. Mensagens de commit **sem acentos** (padrão existente: "Aguias", "Taca", "Seguranca") e sem prefixo tipo feat/fix.
- **Nomes:** ficheiros de páginas/componentes em PascalCase (`JornadaPanel.tsx`); rotas em minúsculas (`/jornada/:id`, `/admin/jornada/:id`); BD em snake_case, TS em camelCase; constantes de produto em `types.ts` (nunca números mágicos na UI: usar `PRIZE`, `ADEPTO_COTA`, `COTA_VALUE`, `PAY_HINT`, `CLUB_FULL_NAME`…).
- **Organização do código / padrão do store:** `store.ts` é a única porta para o Supabase. Leituras são **síncronas da cache** (`listJornadas()`, `currentUser()`, `userScore()`…), escritas são `async` que gravam e chamam `loadAll()`; `useDB()` (useSyncExternalStore) força re-render. Recarga automática: `visibilitychange`, a cada 5 min, `emit` por minuto (countdown/fecho sem reload), e poll de 15 s enquanto um adepto espera pagamento/aprovação. A lógica de negócio espelha a do servidor (`canBet` ↔ `can_bet`, `cotaPaid`, `isFansOnly` ↔ `fans_only`): **mudar uma implica mudar a outra**.
- **Estilo / UI:** mobile-first (telemóvel em modo retrato), tokens em `:root` de `index.css` (`--black`, `--white`, `--yellow #fdd000`, `--green`, `--red`, `--muted`…). Visual: **branco dominante, preto na estrutura, amarelo só em detalhes** (botões `btn-yellow`, badges, pastilha Adepto). Fonte Hanken Grotesk; ícones Material Symbols (`<span className="material-symbols-outlined">nome</span>`, `ms-fill` para preenchido). Reutilizar classes existentes: `card`, `card-title`, `list-item`, `badge badge-{green,grey,yellow,red}`, `notice`, `empty`, `btn btn-{yellow,ghost,danger,sm}`, `icon-only`, `spread`, `row`, `bento`/`stat`, `admin-cta`, `pgrid`, `print-sheet`. Nada de CSS-in-JS nem bibliotecas de UI.
- **Estilo de código (ponytail):** solução mais curta que funciona; sem abstrações especulativas, sem dependências novas (stdlib/plataforma primeiro); simplificações deliberadas marcadas com comentário `// ponytail: …` que diz o teto e o upgrade. Comentários explicam o "porquê", nunca histórico de alterações.
- **Regras de produto a respeitar sempre:**
  - Admin **não aposta** nem tem histórico; só gere. Só existe um admin (username `admin`).
  - Palpites só V1/X/V2; guardam-se automaticamente; alteráveis até ao fecho. Só se aposta na **jornada da semana** (primeira ainda aberta). Fecho validado no servidor (RLS), não só na UI.
  - Vencedor = acertou **todos** os jogos que contam (sem adiados, sem jogo da Águias para jogadores). Classificação da época = nº de jornadas ganhas. Prémio **25 €** por jornada, levantado na ADAG. Nos textos diz-se "Vencedor" (não "chave certa") desde 12/10/2026.
  - Jogadores (plantel) **nunca** veem o jogo da Águias; adeptos apostam nele (coluna "ADAG" na grelha). Adeptos **não** jogam a Taça (número 0) e enquanto a Taça está aberta já apostam na J1.
  - Adeptos: registam-se sozinhos (nome, email, pass ≥ 8), entram logo; sem a cota da jornada paga só veem "Como funciona" + aviso; cota **2 € por jornada**, "em mão ou por MBWay 912 501 015" (nunca dizer "só MBWay"); o admin marca a checkbox em Admin → Adeptos e o **1.º pagamento aprova a conta**; a app apanha a mudança em ≤ 15 s.
  - Plantel + equipa técnica: cota mensal **5 €** lançada a todos num clique (Admin → Multas), multas A–Q do catálogo; regra do clube: pagas na 1.ª quarta-feira após o salário, senão o total do mês dobra (**o dobro não é automatizado**). Equipa técnica não tem conta.
  - Novos jogadores do plantel: **só por SQL** no padrão de `criar-jogadores.sql` (username = primeiro nome se único, senão `nome.apelido`; password inicial igual à do ficheiro; approved). Não há registo de jogadores na app.
  - Emails **nunca** aparecem na app (exceção: admin vê o email dos adeptos no separador Adeptos).
  - Datas/horas em Europe/Lisbon; fecho padrão `nextSaturday9()`.
- **Coisas a NÃO fazer:**
  - Não pedir no chat passwords, service keys ou tokens; não gerar ficheiros com listas de passwords (bloqueado). A service key está em `app/.env` e usa-se de lá.
  - Não correr git dentro de `app/` (repo aninhado). Não commitar `.env`, `.env.local`, `dist/`, `app/prints/`, logs.
  - Não adicionar dependências sem necessidade real; não trocar `window.print()` por lib de PDF.
  - Não reintroduzir: registo de jogadores na app, aprovação separada de adeptos, aniversários, contas para a equipa técnica, cartão de cotas dos adeptos no Início, etiqueta "Só adeptos" — tudo já foi tentado e retirado a pedido.
  - Não apagar as equipas com `season = 'Taça'` nem a equipa "Águias da Graça".
  - Não mudar `CURRENT_SEASON`, `ZZ_EDICAO`/`ZZ_FASE` a meio da época.
  - Não usar o Vercel/Cloud para chegar ao zerozero (403).

## 8. Decisões tomadas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-06-26 | PWA (Vite+React+TS) em vez de app de loja; Supabase como backend sem servidor próprio | Instalável pelo browser, custo zero, RLS faz as permissões |
| 2026-06-29 | Admin não aposta nem vê histórico (UI + RLS) | Quem lança resultados não deve concorrer; evita conflito de interesses |
| 2026-06-29 | Águias da Graça nunca entra nos jogos a apostar pelo plantel | Jogadores não apostam no próprio jogo |
| 2026-06-30 | Layout "Stitch": Hanken Grotesk, preto/branco/amarelo, top bar + bottom nav; "Vencedores" por jornada em vez de leaderboard de pontos | Pontuação é tudo-ou-nada, ranking de pontos não fazia sentido |
| 2026-06-29 | Robô zerozero: sem API, scraping por `edition.php?id_edicao&fase&jornada_in=N`, pausa 1,2 s, emparelhar por nomes | Único dado disponível; emparelhar por equipas é robusto a renumerações |
| 2026-10-01 | Importação da época 2026/27 via SQL gerado (`id_edicao=226029`, `fase=250699`) | Calendário saiu; 30 jornadas, 14 equipas, 182 jogos sem a Águias |
| 2026-10-01 | Login por username (`nome.apelido@totograca.local` interno), nunca emails visíveis; página /perfil | Pedido explícito do Leonardo |
| 2026-10-01 | Fecho às 09:00 hora de Lisboa validado no servidor (`match_deadline`) | Antes estava 09:00 UTC |
| 2026-10-02 | Robô corre no PC (Tarefa Agendada Windows) e não no Vercel | zerozero devolve 403 a IPs cloud; FPF tem Cloudflare |
| 2026-10-08 | Multas/cotas na app: tabela `fines`, catálogo A–Q, cota mensal 5 € para todos, PDF por impressão | Substitui o Excel do delegado |
| 2026-10-08 | Equipa técnica SEM conta (tabela `staff`), só multas/cotas | "Não deve apostar" |
| 2026-10-08 | Registo de contas retirado; só admin cria jogadores por SQL | Controlo do plantel |
| 2026-10-08 | Só se aposta na jornada da semana (`can_bet`) | Evitar apostar em jornadas futuras |
| 2026-10-08 | Jogo adiado (`postponed`) não conta; aniversários retirados | Pedido do Leonardo ("para já") |
| 2026-10-08 | `matches` com ORDER BY fixo (created_at, id) | Bug: "Jogo N" trocava após updates |
| 2026-10-09 | Taça AF Braga = jornada `number 0`; adversários com `season='Taça'` | Conta para a classificação; não poluir a lista de equipas |
| 2026-10-09 | Usernames só primeiro nome quando único | Mais simples para os jogadores |
| 2026-10-09 | Novo papel `adepto`: registo aberto, cota 2 €/jornada em mão ou MBWay, sem Taça, aposta também no jogo da Águias, prémio 25 € | Alargar o jogo aos adeptos do clube |
| 2026-10-09 | Sem aprovação separada: 1.º pagamento aprova; "Confirm email" desligado | Menos fricção; o pagamento já é o filtro |
| 2026-10-09 | Grelha: tabela do plantel + tabela separada dos adeptos (com ADAG); etiqueta "Adepto" só para o admin na classificação/vencedores | Admin precisa de saber a quem pagar os 25 € |
| 2026-10-09 | `seguranca.sql`: RLS por conta ativa, `delete_user` apaga o login, Turnstile opcional, headers no Vercel | Registo aberto ao público |
| 2026-10-09 | J1 fecha sexta 16/10 09:00; J28 quinta 27/05/2027 | Dias reais dos jogos |
| 2026-10-12 | Texto "chave certa" → "Vencedor" em toda a app | Pedido do Leonardo |
| 2026-10-26 | Tarefa agendada do robô passa de segunda 13:00 para **segunda 08:30** | Resultados prontos de manhã |

Aviso dado e aceite (09/10/2026): apostas a dinheiro com prémio podem configurar apostas mútuas (Santa Casa); o Leonardo decidiu avançar na mesma.

## 9. Estado atual

Tudo abaixo está feito, publicado e confirmado "perfeito" pelo Leonardo (último commit 12/10/2026).

- [x] Login por username, perfil (nome, password, sair), link "Como instalar a app no telemóvel"
- [x] Jornada da semana com apostas 1/X/2, countdown, fecho no servidor, banner da última jornada terminada
- [x] Vencedores: classificação da época + vencedores por jornada; Histórico pessoal
- [x] Grelha de palpites (plantel + adeptos) após o fecho; admin sempre
- [x] Admin: lançar resultados (com adiado), fecho das apostas, jogos, equipas, Plantel (+ equipa técnica), Adeptos (cota por jornada, 1.º pagamento aprova, apagar), Multas (mês, cota mensal, A–Q, pago, PDF)
- [x] Adeptos: registo, "Como funciona", cota 2 €/jornada, jogo da Águias, sem Taça
- [x] Taça (jornada 0) criada com 13 jogos; época 2026/27 importada (30 jornadas, 182 jogos + 28 da Águias)
- [x] Robô de resultados no PC: `sync-results.mjs`, Tarefa Agendada Windows "TotoGraca - resultados" (segundas 08:30, StartWhenAvailable, `cmd /c cd /d C:\Projetos\totograca\app && node scripts\sync-results.mjs >> scripts\sync-results.log 2>&1`). Última execução registada: 19/10/2026 "nada por lançar"
- [x] Segurança: RLS por conta ativa, `delete_user`, headers Vercel, nome ≤ 40, pass ≥ 8 no registo
- [x] PWA: manifest, ícones 192/512 maskable com o emblema ADAG, service worker autoUpdate, InstallHint
- [x] Todos os SQL de `supabase/` corridos em produção (ordem em §5)

## 10. Em curso

- **Tarefa:** nada a meio. Última sessão (26/10/2026) só mudou a hora da tarefa agendada e criou este CLAUDE.md.
- **Ficheiros envolvidos:** —
- **Falta:** confirmar na segunda seguinte (02/11/2026) que o robô correu às 08:30 e gravou os resultados (ver `app/scripts/sync-results.log`). Se o PC estiver desligado à hora, a tarefa corre quando ligar (StartWhenAvailable); se falhar, o admin lança os resultados à mão em Admin → Jornadas.

## 11. Próximos passos

1. Acompanhar a época: verificar semanalmente que o robô preenche os resultados (segunda de manhã) e que os vencedores aparecem; corrigir emparelhamentos de nomes em `zz.js` (`STOP`, `similarity`) se algum jogo ficar "sem resultado ainda".
2. Se vierem mais eliminatórias da Taça a meio da época: hoje só há um número 0. Plano: coluna `jornadas.name` + ordenar por `deadline` (cliente `listJornadas`, SQL `can_bet` usa `number`); ver comentário `ponytail:` em `utils.ts`.
3. Pendentes no painel Supabase (só o Leonardo pode): Authentication → Email → Minimum password length = 8; "Allow anonymous sign-ins" desligado; rate limit de sign-ups se houver abuso; Turnstile (Captcha protection + `VITE_TURNSTILE_SITE_KEY` no Vercel + redeploy) só se aparecerem registos a brincar.
4. Nova época (verão 2027): descobrir `id_edicao`/`fase` no zerozero (perfil /equipa/aguias-da-graca/3678), atualizar `ZZ_EDICAO`/`ZZ_FASE` em `zz.js` e `CURRENT_SEASON` em `types.ts`, gerar novo `importar-epoca-XXYY.sql` (parser em `docs/zerozero-robot.md`), rever plantel (`criar-jogadores.sql`) e equipa técnica.
5. Opcional/ideias já faladas mas não pedidas: automatizar o "dobro" das multas; jantar na última quarta do mês (25 €/pessoa) que estava no Excel do delegado; aniversários (retirados "para já").

## 12. Problemas conhecidos / dívida técnica

| Problema | Onde | Prioridade |
|---|---|---|
| Repo git aninhado `app/.git` com o mesmo remoto — risco de commits no sítio errado | `app/.git` | Média (apagar a pasta `app/.git` quando o Leonardo confirmar; até lá, git só na raiz) |
| Robô depende do PC do Leonardo estar ligado à segunda; sem alerta se falhar | Tarefa Agendada Windows + `sync-results.log` | Média |
| Scraping do zerozero pode partir se o HTML mudar; `fetchJornadaPage(n)` traz N e N+1 e o script pede N-1 e N para cobrir desvios | `app/scripts/zz.js` | Baixa |
| `can_bet()` duplicada em 5 ficheiros SQL (histórico); a válida é a de `seguranca.sql` | `supabase/*.sql` | Baixa (documentado em §5) |
| `changePassword` exige ≥ 6 mas o registo exige ≥ 8; Supabase pode ainda estar com mínimo 6 no painel | `store.ts`, painel Supabase | Baixa |
| `importar-epoca-2627.sql` está gravado com BOM UTF-8 (funciona no SQL Editor; pode mostrar lixo em alguns editores) | `supabase/importar-epoca-2627.sql` | Baixa |
| 3 ícones Tabler residuais (`ti ti-loader-2`, `ti ti-ballpen`, `ti ti-arrow-left`) obrigam a carregar o CSS da Tabler por CDN; o resto usa Material Symbols | `App.tsx`, `Home.tsx`, `JornadaView.tsx`, `index.html` | Baixa |
| `docs/zerozero-robot.md` descreve a arquitetura Vercel Cron que foi abandonada (a parte do parser continua válida) | `docs/zerozero-robot.md` | Baixa |
| `app/README.md` é o template do Vite; `App.css` e `assets/react.svg|vite.svg|hero.png` são resíduos | `app/` | Baixa |
| Coluna `profiles.birthday` pode existir na BD sem uso | Supabase | Baixa |
| Teste em local usa a BD de produção; não há ambiente de staging | — | Aceite |

## 13. Registo de sessões

| Data | Resumo |
|---|---|
| 2026-06-25/26 | Arranque: PWA Vite+React+TS, store ligado ao Supabase, esquema com RLS e fecho ao sábado |
| 2026-06-29/30 | Admin só gere; Águias fora dos jogos; layout preto/branco/amarelo; investigação do robô zerozero (`docs/zerozero-robot.md`) |
| 2026-10-01 | Época 2026/27 importada do zerozero; login por username; perfil; admin redesenhado; ícones PWA; correções (hora de Lisboa, proteção role/status); robô v1 |
| 2026-10-02 | Robô passa a correr no PC (Vercel bloqueado pelo zerozero); plantel atualizado (21 jogadores) |
| 2026-10-08 | Multas e cotas (tabela, catálogo A–Q, cota mensal 5 €, PDF), equipa técnica sem conta, só jornada da semana, grelha de palpites, jogo adiado, classificação da época, registo retirado, ícones com o emblema ADAG; teste real completo (admin + conta `teste.app`); bug da ordem dos jogos corrigido |
| 2026-10-09 | Taça (jornada 0); usernames só primeiro nome; adeptos (registo, cota 2 €/jornada, jogo da Águias, sem Taça, 1.º pagamento aprova); separador Adeptos; `seguranca.sql`; etiqueta Adepto; grelha dos adeptos separada; J1 fecha sexta; link de instalação no login |
| 2026-10-12 | "chave certa" → "Vencedor" nos textos; prints da app para divulgação (`app/prints/`, não versionado) |
| 2026-10-26 | Tarefa agendada do robô para segundas 08:30; criado este CLAUDE.md com todo o contexto do projeto |
