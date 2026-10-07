export function PageHeader({
  eyebrow, title, description, action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b px-6 py-7 lg:px-9">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-medium tracking-[0.16em] text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
