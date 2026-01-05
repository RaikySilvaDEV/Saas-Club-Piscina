export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-display text-2xl text-white">{title}</h2>
        {subtitle && <p className="text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="w-full md:w-auto">{action}</div>}
    </div>
  );
}
