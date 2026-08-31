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

## Decisões rejeitadas

- Nome "Anel X" mencionado em um prompt do usuário — confirmado como
  engano (resíduo de outro projeto), não usado.
- Sidebar com links reais para seções inexistentes (Painel, Tarefas,
  Calendário, Relatórios, Equipe, Configurações) — rejeitado por simular
  funcionalidade que não existe; ficam visíveis mas desabilitadas
  ("em breve").

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

## Soluções aplicadas

- Estatísticas recalculadas só sobre o conjunto exibido em "Tarefas de
  hoje" (due_date ≤ hoje, ou sem data, ou atrasado-e-pendente).
- "Tarefas recorrentes" filtrada por `!done` — mostra só a ocorrência em
  aberto de cada série (há sempre no máximo uma, por design).
- `.mcp.json` movido para `/home/igorr/.mcp.json`.
- Usuário gerou token de acesso pessoal do GitHub para autenticar o push.

## Pendências

- Confirmar nome oficial da empresa/cliente que vai usar o NRoutine.
- Definir qual software será integrado no futuro.
- Autenticação multiusuário (hoje é tabela pública compartilhada, sem
  contas).
- Metas de performance específicas (nenhuma definida ainda).

## Próximos passos

Aguardando indicação do usuário — nenhuma feature nova planejada até o
momento além do que está em "Pendências".
