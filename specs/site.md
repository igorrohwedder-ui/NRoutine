# NRoutine — Especificação do produto

Fonte de verdade sobre o que precisa ser construído. Ver também
[design.md](design.md) para a identidade visual e [memoria.md](../memoria.md)
para o histórico de decisões.

## Objetivo

Gerenciador de tarefas de uso interno para:
- Organizar e priorizar tarefas do dia a dia;
- Acompanhar o progresso de projetos de médio/longo prazo;
- Centralizar informações que hoje ficam espalhadas (planilhas, mensagens,
  memória).

## Público-alvo

Equipe interna da empresa do usuário — múltiplas pessoas, não uso
individual. **A definir**: nome oficial da empresa (a identidade visual foi
modelada a partir do site da NewByte, mas isso não foi formalmente
confirmado como sendo a mesma empresa que vai usar o produto).

## Produto e proposta de valor

Ferramenta interna, não um produto vendido a terceiros (ao menos por
enquanto — ver "Fora do escopo"). A proposta de valor é operacional: reduzir
fricção de organizar tarefas recorrentes e projetos, ter uma visão clara do
que precisa de atenção "hoje" sem se perder em tarefas futuras ou já
concluídas.

## Idiomas

Português (pt-BR). Sem plano de internacionalização.

## Quantidade de páginas

Uma única página funcional (`/`, "Minha Rotina"). A navegação lateral já
reserva espaço para futuras seções (ver abaixo), mas elas não existem
ainda — aparecem desabilitadas ("em breve") em vez de simular
funcionalidade que não existe.

## Seções (implementadas)

- **Tarefas de hoje** — tarefas avulsas e recorrentes com vencimento hoje,
  atrasadas (e ainda pendentes), ou sem data.
- **Tarefas recorrentes** — visão geral das séries recorrentes; mostra só a
  ocorrência em aberto de cada série (desaparece daqui ao ser concluída, a
  próxima ocorrência gerada assume o lugar).
- **Próximas** — tarefas com data futura (não concluídas), agrupadas por
  proximidade: *Esta semana* (próximos 7 dias), *Este mês* (do 8º dia até o
  fim do mês corrente) e *Mais adiante*. Existe porque "Tarefas de hoje" é
  estritamente do dia: sem esta seção, uma tarefa avulsa agendada para o
  futuro ficaria inalcançável até a data chegar.
- **Projetos ativos** — projetos com status, prazo, progresso e checklist de
  tarefas relacionadas.

## Seções reservadas para o futuro (nav desabilitada)

Painel, Tarefas (visão dedicada), Calendário, Relatórios, Equipe,
Configurações.

## Funcionalidades (implementadas)

- CRUD completo de tarefas: criar, editar, concluir/reabrir, excluir.
- Tarefas avulsas ou recorrentes (diária, semanal com múltiplos dias,
  mensal, anual, personalizada, e "período do mês" — ex: todo dia 21 ao
  31 de cada mês, com reset automático de ciclo).
- Edição/exclusão de recorrência com escopo "apenas esta ocorrência" ou
  "toda a série".
- Prioridade (baixa/média/alta), data de vencimento, detecção de atraso.
- **Descrição** da tarefa: campo de texto livre, sobrescrito a cada edição
  (não é histórico). Aparece resumida no card e editável ao abrir a tarefa.
- **Histórico de atualizações**: log por tarefa. Cada entrada tem texto
  livre + data/hora automática, exibidas da mais recente para a mais
  antiga. Entradas podem ser excluídas individualmente (ícone de lixeira no
  hover, como no resto do app); não é possível editar o texto de uma
  entrada já registrada.
- Sistema de tags reutilizáveis (substituiu categoria de texto livre);
  criação inline, múltiplas tags por tarefa, filtro dinâmico por tag.
- Projetos: nome, descrição, datas, prioridade, status, progresso
  (automático a partir das tarefas relacionadas, ou manual), checklist de
  tarefas do projeto (reaproveita o CRUD normal de tarefas).
- Filtros: Todas / Projetos / Recorrentes / Próximas / Pendentes /
  Concluídas / Atrasadas, combináveis com filtro por tag.
- Estatísticas do dia: concluídas / pendentes / atrasadas / progresso.
- Tema escuro fixo (ver design.md).

## Chamadas para ação

Não é uma landing page — não há CTAs de conversão. As ações primárias da
interface são: "Adicionar" (tarefa ou projeto), marcar como concluída,
editar, excluir.

## Informações que ainda precisam ser definidas

- Nome oficial da empresa/cliente (ver "Público-alvo").
- Qual software será integrado no futuro (usuário mencionou integração
  futura com "outro software", sem especificar qual).
- Se/quando entra autenticação multiusuário (hoje é uma tabela pública
  compartilhada no Supabase, sem contas — ver "Fora do escopo").
- Metas de performance específicas (hoje não há budget definido).

## Stack técnica

Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4 +
Supabase (Postgres + supabase-js, client-side, sem backend próprio) +
`lucide-react`. Deploy: Vercel (auto-deploy no push para `main`), repo no
GitHub (`igorrohwedder-ui/NRoutine`). **Não alterar sem autorização.**

## Responsividade

- Sidebar persistente em telas `md+`; em mobile vira topbar + menu gaveta.
- Grid de estatísticas: 2 colunas no mobile, 4 no desktop.
- Conteúdo principal com largura máxima (evita esticar em telas grandes).

## Acessibilidade

- `aria-label` em todos os botões de ícone (concluir, editar, excluir,
  menu).
- Estados de foco visíveis (`focus-visible` ring) em todo elemento
  interativo.
- HTML semântico: `nav`, `h1`/`h2`, `ul`/`li`.
- Status (prioridade, atrasado) nunca depende só de cor — sempre
  acompanhado de ícone e/ou texto.

## Desempenho

Sem servidor próprio (menos superfície de latência), dependências mínimas
(só `lucide-react` além do essencial). Sem budget de performance formal
definido ainda (ver "Informações a definir").

## Escopo

**Dentro do escopo:** tudo listado em "Funcionalidades" acima.

**Fora do escopo (por enquanto):**
- Autenticação / contas de usuário multiusuário (mencionado como "vira
  depois").
- Integração com outro software (mencionada como planejada, não
  especificada).
- App mobile nativo.
- Internacionalização.
- Site institucional/marketing público do NRoutine como produto (o escopo
  atual é só o app interno).
