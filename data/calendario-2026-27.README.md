# Calendário AF Braga 1ª Divisão Série A 2026/27 — extração zerozero

**Estado: NÃO EXTRAÍDO — acesso ao zerozero.pt bloqueado no proxy.**

- Data da tentativa: 2026-10-01
- Edição: `id_edicao=226029` (https://www.zerozero.pt/edicao/af-braga-1-divisao-serie-a-2026-2027/226029)
- `fase`: **por descobrir** (a página não chegou a ser descarregada)

## O que aconteceu
O primeiro pedido (`curl` com User-Agent Chrome e `Accept-Language: pt-PT,pt;q=0.9`)
falhou com `CONNECT tunnel failed, response 403`. O estado do proxy da sessão regista:

```
kind: connect_rejected
detail: gateway answered 403 to CONNECT (policy denial or upstream failure)
host: www.zerozero.pt:443
```

É uma recusa da política de rede do ambiente cloud (não do zerozero). Conforme instruído,
a extração parou aqui e não se tentou contornar o bloqueio. Por isso **não existe**
`data/calendario-2026-27.json` — não foi gerado nenhum calendário (nem parcial nem inventado).

## Extrator / validação
Não testados: sem HTML não foi possível confirmar se o `parseGames` de
`docs/zerozero-robot.md` ainda casa com o HTML, nem correr a validação
(14 equipas, 7 jogos por jornada, 1 jogo por equipa/jornada, cada par 2x).

## Para desbloquear
Permitir `www.zerozero.pt` nas definições de rede do ambiente (Network access →
domínio permitido ou nível de acesso mais amplo) e voltar a correr a tarefa,
ou correr a extração a partir de outra máquina com acesso ao site.
