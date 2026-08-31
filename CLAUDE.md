# NRoutine

Gerenciador de tarefas de uso interno: organizar e priorizar tarefas,
acompanhar progresso de projetos, centralizar informações.

Este arquivo é a porta de entrada do projeto — leia sempre que esta pasta
for aberta. Os detalhes vivem em:

- **[specs/site.md](specs/site.md)** — o que precisa ser construído (escopo,
  funcionalidades, stack, requisitos).
- **[specs/design.md](specs/design.md)** — a identidade visual (paleta,
  tipografia, componentes, o que evitar).
- **[memoria.md](memoria.md)** — histórico vivo de decisões, problemas,
  soluções e pendências.
- **[Referencias/](Referencias/)** — imagens de referência visual; consultar
  antes de mudanças de UI/UX (ver `Referencias/README.md`).

## Regra mais importante

**Se algum pedido do usuário contradisser uma decisão registrada em
[specs/site.md](specs/site.md), [specs/design.md](specs/design.md) ou
[memoria.md](memoria.md), pare e avise antes de realizar qualquer
alteração. Explique qual decisão seria afetada e pergunte se o usuário
deseja substituí-la.**

## Regras gerais de trabalho

- Não altere a stack técnica sem autorização explícita do usuário.
- Não remova uma decisão aprovada (em specs/ ou memoria.md) silenciosamente
  — isso conta como contradição e cai na regra acima.
- Não invente informações comerciais, técnicas ou de produto que não
  estejam confirmadas — registre como pendência em memoria.md em vez de
  supor.
- Preserve consistência visual e estrutural entre seções (mesmos tokens de
  design, mesmos padrões de componente — ver specs/design.md).
- Antes de uma mudança grande (nova feature, redesign, mudança de schema),
  apresente um plano resumido antes de implementar.
- Depois de uma decisão importante aprovada, atualize memoria.md.

## Instruções essenciais do projeto

- Stack: Next.js 16 (App Router) + React 19 + Tailwind v4 + Supabase
  (client-side, sem servidor próprio) + `lucide-react`. Deploy automático
  na Vercel a cada `git push` na branch `main`.
- Mudanças de schema no Supabase usam o MCP configurado em
  `/home/igorr/.mcp.json` (fora do repo — contém token, nunca commitar).
  Sempre testar contra o banco real via MCP antes de considerar uma
  feature pronta, e limpar dados de teste depois.
- Validar toda mudança com `npx tsc --noEmit`, `npm run lint` e
  `npm run build` antes de commitar.
- `agentRules: false` está setado em `next.config.ts` de propósito — sem
  isso, o Next.js sobrescreve este arquivo a cada `dev`/`build`.
