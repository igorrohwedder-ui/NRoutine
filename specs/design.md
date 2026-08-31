# NRoutine — Especificação visual

Fonte de verdade da identidade visual. Ver também [site.md](site.md) e
[../Referencias/](../Referencias/) (imagens de referência — usadas como
direção de estrutura/atmosfera, não copiadas literalmente: nada de texto,
logotipo, nome ou layout idêntico de outra marca).

## Direção visual

Tema escuro fixo, estética "corporate productivity" (inspirado em
Linear/Notion/Microsoft To Do) — profissional, hierarquia clara, cor usada
com moderação. Identidade de cor herdada do site da NewByte (azul), mas
tratada de forma mais restrita/desaturada do que o original para não
competir com o conteúdo.

As referências em `Referencias/` (Syncboard, Trello dark mode) são mais
coloridas/gradiente do que a direção atual. Ao usá-las como inspiração,
adaptar **padrões** (badges de contagem, tags coloridas por categoria,
progresso visual, avatares) em vez de copiar o nível de saturação — a
menos que o usuário peça explicitamente um visual mais vibrante.

## Paleta

Tokens definidos em `app/globals.css` (`@theme inline`), usados como
classes Tailwind (`bg-surface`, `text-foreground`, etc.):

| Token | Valor | Uso |
|---|---|---|
| `background` | `#0b0e14` | fundo da página |
| `surface` | `#12151c` | cards, sidebar, formulários |
| `surface-2` | `#171b24` | inputs, hover, elementos elevados |
| `border` | `#232833` | bordas padrão |
| `border-strong` | `#323a48` | bordas em hover/ênfase |
| `foreground` | `#e7e9ec` | texto primário |
| `foreground-secondary` | `#9aa4b2` | texto secundário |
| `foreground-muted` | `#626b79` | texto terciário/desabilitado |
| `brand` | `#2f7bf6` | ações primárias, links, foco, progresso |
| `brand-soft` | `#1a2b4d` | fundo de destaque sutil (ex: item ativo) |
| `success` | `#34d399` | concluído |
| `success-soft` | `#113228` | fundo de badge de sucesso |
| `danger` | `#f87171` | atrasado, exclusão, erro |
| `danger-soft` | `#3a1a1a` | fundo de badge de perigo |

Não existe modo claro — o app assume tema escuro sempre (sem toggle).

## Tipografia

**Plus Jakarta Sans** (via `next/font/google`, variável `--font-jakarta`),
com fallback `ui-sans-serif, system-ui, sans-serif`.

Escala em uso (classes Tailwind, sem escala custom declarada):
- Título de página: `text-2xl`/`text-3xl` font-semibold (PageHeader).
- Título de seção: `text-sm` font-semibold.
- Corpo/cards: `text-sm`.
- Metadados/badges: `text-xs` / `text-[11px]`.

## Espaçamento

Escala padrão do Tailwind (múltiplos de 4px). Container principal com
`max-w-4xl`, padding `px-4 py-6` (mobile) / `sm:px-8` (desktop). Cards com
`px-4 py-3`. Gaps entre seções: `gap-6`/`gap-8`.

## Bordas e raios

- Cards e containers: `rounded-xl` (12px).
- Inputs, botões pequenos, badges: `rounded-lg`/`rounded-md`.
- Badges/pills (tag, prioridade, status): `rounded-full`.
- Bordas sempre 1px, cor `border` (ou `border-strong` em hover) — sem
  sombras pesadas (`shadow`), a separação vem de cor de fundo + borda.

## Estilo dos botões

- Primário: fundo `brand` sólido, texto branco, `hover:bg-brand/90`.
- Secundário/ghost: fundo `surface-2`, texto `foreground-secondary`,
  hover mais claro.
- Destrutivo: aparece só em hover/foco (ex: excluir tarefa), tom
  `danger`/`danger-soft`.
- Todo botão interativo tem `focus-visible:ring-2 ring-brand/60`.

## Estilo dos cards

Fundo `surface`, borda 1px `border` (`border-danger/30` quando atrasado),
`hover:border-border-strong`, sem sombra. Checkbox quadrado
(`rounded-md`), não circular — mais "enterprise" que "consumer".

## Tags, prioridade e status

Badges pequenos (`rounded-full`, `text-[11px]`), sempre ícone + texto —
nunca só cor (acessibilidade). Prioridade usa direção (seta pra baixo/
traço/seta pra cima), não semáforo de cores puro.

## Tratamento de fotografia / imagens do produto

Não há fotografia no produto (é uma ferramenta interna, não uma landing
page). Ícones vêm de `lucide-react` (estilo outline, consistente em toda a
interface).

## Movimento e animação

Mínimo e funcional: `transition` em hover/foco, barra de progresso anima
com `transition-all duration-500`. Sem animações decorativas.

## Regras para desktop e mobile

- **Desktop (`md+`)**: sidebar persistente à esquerda (`w-60`).
- **Mobile**: sidebar vira topbar compacta + menu gaveta (`fixed inset-0`
  overlay).
- Grid de estatísticas: `grid-cols-2` mobile → `sm:grid-cols-4` desktop.
- Formulários com campos opcionais ficam escondidos atrás de um toggle
  ("Tags, prioridade, vencimento, repetição") para não sobrecarregar a
  criação rápida.

## O que evitar

- Gradientes grandes/decorativos, sombras pesadas, excesso de cor —
  contraria a direção "profissional, não chamativo" já aprovada.
- Modo claro (não implementado, não solicitado).
- Emojis como substituto de ícone teu produto (ok em estado vazio
  pontual, não como padrão).
- Copiar layout, texto, logotipo ou identidade das imagens em
  `Referencias/` de forma literal — usar só como direção de estrutura e
  atmosfera.
