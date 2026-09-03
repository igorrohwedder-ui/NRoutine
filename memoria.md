# Memória do projeto — NRoutine

Histórico vivo de decisões e aprendizados. Ver [CLAUDE.md](CLAUDE.md) para
as regras de trabalho e [specs/](specs/) para as especificações atuais.

## Decisões aprovadas

- Escopo destes documentos (CLAUDE.md/specs) = o app interno que já existe,
  não um site institucional/marketing (esse ficaria fora de escopo por
  enquanto).
- Identidade do produto é **NRoutine**, uso interno da empresa do usuário
  (não um produto de terceiros por ora) — plano de integração futura com
  "outro software", ainda não especificado.
- Público-alvo: equipe/empresa do usuário (multiusuário), não uso
  individual — implica que autenticação real vai ser necessária eventual-
  mente.
- Paleta de cor modelada a partir do site da NewByte (`#015eea`→`#00c0fa`
  original, adaptada para tons mais restritos no produto — ver
  design.md), mas sem confirmação formal de que NewByte é a empresa que
  vai usar o produto.
- Tema escuro fixo, sem modo claro.
- Tipo (Tarefa/Projeto) escolhido via toggle no formulário, em vez de usar
  o campo de categoria/tag para diferenciar — mais robusto.
- Tags substituíram completamente a categoria de texto livre; categoria
  antiga e campo "horário" continuam existindo no banco (não removidos),
  só pararam de ser usados pelo app — reversível.
- Edição/exclusão de recorrência com só 2 escopos ("esta ocorrência" /
  "toda a série") em vez de 3 — não há pré-geração de ocorrências
  futuras, então "esta e as futuras" seria idêntico a "toda a série".
- `agentRules: false` em `next.config.ts` — necessário para o Next.js não
  sobrescrever este conjunto de documentos a cada `dev`/`build`.
- Evolução visual a partir de `Referencias/` (ago/2026): cabeçalhos de
  seção com contador, tags com cor própria derivada do nome, tags no topo
  do card, bloco de tags na sidebar com contagem, fração `X/Y` no card de
  projeto.
- Filtro por tag consolidado na sidebar — os chips de tag do FilterBar
  foram removidos para não existirem dois controles do mesmo estado.
- **Exceção à regra "evitar gradientes"**: aprovado um brilho radial de
  7% da cor de marca na área de conteúdo (`.app-canvas`). Registrado em
  specs/design.md como a única exceção.
- Aba **"Próximas"** (set/2026) para tarefas com data futura. Critérios de
  agrupamento escolhidos: *Esta semana* = amanhã até hoje+7; *Este mês* =
  hoje+8 até o fim do mês corrente; *Mais adiante* = depois disso. Quando a
  janela de 7 dias já passa do fim do mês (ex: dia 28), o grupo "Este mês"
  fica vazio e o excedente cai em "Mais adiante" — sem contagem dupla.
- "Próximas" aparece também na aba **Todas** (não só na própria aba), para
  que a visão padrão não esconda nada. Os filtros de status (Pendentes/
  Concluídas/Atrasadas) são um eixo diferente e não se aplicam a ela.
- Tarefas de projeto **não** entram em "Próximas" — elas já são visíveis
  dentro do card do projeto, e incluí-las duplicaria a exibição.
- Descrição + histórico de atualizações da tarefa (set/2026). Decisões:
  - **Tabela separada** `routine_item_updates` em vez de array JSON dentro
    da task. O schema do projeto é todo normalizado (`tags`,
    `routine_item_tags`, `recurrences`), e um array exigiria
    read-modify-write — duas pessoas anotando ao mesmo tempo sobrescreveriam
    uma à outra. Custo: uma query a mais no carregamento.
  - **Descrição faz parte do molde da série**: `recurrences.description`
    existe, então a próxima ocorrência gerada herda os detalhes de execução,
    igual a título/prioridade. Já o log de atualizações é **por ocorrência**
    — uma anotação se refere àquele dia específico.
  - **Atualizações salvam na hora**, fora do fluxo Salvar/Cancelar do
    formulário: são fatos que aconteceram, não rascunho. Cancelar a edição
    não desfaz uma atualização registrada.
  - Descrição **não** entra no formulário de criação rápida, para não
    sobrecarregá-lo (regra já existente em design.md); adiciona-se ao abrir
    a tarefa.
  - Carregamento: todas as atualizações vêm no load inicial, como o resto do
    app. Se o volume crescer muito, será o primeiro lugar a precisar de
    paginação.
  - Exclusão de uma atualização isolada segue o padrão de exclusão do app:
    lixeira revelada no hover e remoção imediata com rollback em caso de
    erro (mesmo comportamento de excluir uma tarefa avulsa), sem diálogo de
    confirmação. Editar o texto de uma entrada continua fora de escopo — um
    log deve registrar o que foi dito, não permitir reescrever.

## Decisões rejeitadas

- Nome "Anel X" mencionado em um prompt do usuário — confirmado como
  engano (resíduo de outro projeto), não usado.
- Sidebar com links reais para seções inexistentes (Painel, Tarefas,
  Calendário, Relatórios, Equipe, Configurações) — rejeitado por simular
  funcionalidade que não existe; ficam visíveis mas desabilitadas
  ("em breve").
- Site institucional/marketing do NRoutine — avaliado a pedido do usuário
  e descartado: um site de venda não faz sentido para uma ferramenta de
  uso interno, cujo público já é a própria equipe. Reavaliar só se o
  produto for oferecido a outras empresas.

## Alterações realizadas (ordem cronológica resumida)

1. Setup inicial: Next.js + Supabase, CRUD básico de tarefas.
2. Deploy: GitHub (`igorrohwedder-ui/NRoutine`) + Vercel
   (`n-routine.vercel.app`), MCP do Supabase conectado
   (`/home/igorr/.mcp.json`, fora do repo).
3. Redesign completo para visual "corporate productivity" escuro (sidebar,
   progresso, prioridade, vencimento).
4. Feature de tarefas recorrentes + projetos (tabelas `recurrences` e
   `projects`, motor de cálculo de próxima ocorrência).
5. Sistema de tags (substituiu categoria), remoção do campo "horário",
   nova recorrência "período do mês" (ex: dia 21 ao 31, com reset
   automático de ciclo).
6. Pasta `Referencias/` criada para imagens de UI/UX fornecidas pelo
   usuário (2 imagens salvas até agora — ver `Referencias/README.md`).
7. Documentação formal do projeto (este arquivo + CLAUDE.md + specs/).
8. Evolução visual inspirada em `Referencias/`: contadores por seção,
   cores de tag, hierarquia do card, bloco de tags na sidebar,
   gradiente sutil na área de conteúdo.
9. Aba "Próximas" com agrupamento por período (`groupUpcoming` em
   `lib/taskStatus.ts`, componente `UpcomingList`).
10. Campo de descrição e histórico de atualizações por tarefa
    (`routine_items.description`, tabela `routine_item_updates`).

## Problemas encontrados

- Estatísticas do topo contavam ocorrências recorrentes futuras (já
  geradas, mas ainda escondidas da tela) como "pendentes", distorcendo o
  progresso do dia.
- "Tarefas recorrentes" continuava mostrando a ocorrência já concluída em
  vez de só a próxima.
- `.mcp.json` precisa estar na raiz do **workspace** do VS Code
  (`/home/igorr`), não na raiz do repo (`/home/igorr/rotina-diaria`), para
  ser detectado.
- GitHub não aceita mais senha da conta para `git push` via HTTPS —
  precisa de token de acesso pessoal.
- **Dados expostos**: o app está publicado em `n-routine.vercel.app` com
  política pública no Supabase — qualquer pessoa com a URL lê, edita e
  apaga tudo. Sem login, sem isolamento por usuário.
- **Tarefas futuras inalcançáveis**: uma tarefa avulsa (não recorrente) com
  data futura não aparecia em nenhuma listagem — "Tarefas de hoje" filtra
  por `due_date <= hoje` e "Tarefas recorrentes" exige `recurrence_id`.
  Havia uma tarefa real nessa situação no banco (vencimento 07/09).
- **Título longo esticava o card**: a classe `truncate` no título aplica
  `white-space: nowrap`; como o pai é `flex-col items-start`, o texto
  crescia em vez de quebrar. Mesmo problema latente no nome do projeto.

## Soluções aplicadas

- Estatísticas recalculadas só sobre o conjunto exibido em "Tarefas de
  hoje" (due_date ≤ hoje, ou sem data, ou atrasado-e-pendente).
- "Tarefas recorrentes" filtrada por `!done` — mostra só a ocorrência em
  aberto de cada série (há sempre no máximo uma, por design).
- `.mcp.json` movido para `/home/igorr/.mcp.json`.
- Usuário gerou token de acesso pessoal do GitHub para autenticar o push.
- Criada a aba/seção "Próximas", reaproveitando `TaskList`/`TaskItem` —
  só o filtro e o agrupamento são novos, o visual do card é o mesmo.
- Título da tarefa passou de `truncate` para `line-clamp-3 break-words`
  (nome do projeto para `line-clamp-2`). Verificado renderizando o
  componente numa rota temporária e inspecionando o HTML.

## Pendências

- Confirmar nome oficial da empresa/cliente que vai usar o NRoutine.
- Definir qual software será integrado no futuro.
- Autenticação multiusuário (hoje é tabela pública compartilhada, sem
  contas).
- Metas de performance específicas (nenhuma definida ainda).

## Próximos passos

1. **Autenticação + RLS por usuário/empresa** (recomendado como prioridade:
   resolve a exposição pública dos dados e atende o público-alvo "equipe"
   registrado nas specs).
2. Tela de login — a única página pública que o produto precisa.
3. Definir o software que será integrado no futuro.
