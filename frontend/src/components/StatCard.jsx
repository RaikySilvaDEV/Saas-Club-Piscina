export default function StatCard({ title, value, helper }) {
  return (
    <div className="card-glass rounded-2xl p-5">
      <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-3 text-3xl font-display text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-400">{helper}</p>}
    </div>
  );
}