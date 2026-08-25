type Props = {
  total: number;
  completed: number;
};

export default function Header({ total, completed }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <header className="bg-gradient-to-br from-brand to-brand-light px-6 py-10 text-white sm:px-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-1">
        <span className="text-sm font-medium capitalize tracking-wide text-white/70">
          {today}
        </span>
        <h1 className="text-3xl font-bold sm:text-4xl">Minha Rotina</h1>
        <p className="mt-1 text-sm text-white/80 sm:text-base">
          {total === 0
            ? "Adicione a primeira tarefa do seu dia."
            : `${completed} de ${total} tarefas concluídas · ${pct}%`}
        </p>

        {total > 0 && (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
