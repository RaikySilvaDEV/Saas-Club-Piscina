import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { apiFetch } from "../services/api.js";

export default function Saas() {
  const [dashboard, setDashboard] = useState(null);
  const [plans, setPlans] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [planForm, setPlanForm] = useState({ name: "", interval: "monthly", price: "" });
  const [clubForm, setClubForm] = useState({
    name: "",
    slug: "",
    planoSaasId: "",
    currentPeriodEnd: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  useEffect(() => {
    apiFetch("/saas/dashboard")
      .then((data) => setDashboard(data))
      .catch(() => {});
    apiFetch("/saas/plans")
      .then((data) => setPlans(data))
      .catch(() => {});
    apiFetch("/clubs")
      .then((data) => setClubs(data))
      .catch(() => {});
  }, []);

  async function handleCreatePlan(event) {
    event.preventDefault();
    if (!planForm.name || !planForm.price) {
      return;
    }
    const plan = await apiFetch("/saas/plans", {
      method: "POST",
      body: JSON.stringify({ ...planForm, price: Number(planForm.price) }),
    });
    setPlans((prev) => [plan, ...prev]);
    setPlanForm({ name: "", interval: "monthly", price: "" });
  }

  async function handleCreateClub(event) {
    event.preventDefault();
    if (
      !clubForm.name ||
      !clubForm.slug ||
      !clubForm.planoSaasId ||
      !clubForm.currentPeriodEnd ||
      !clubForm.adminName ||
      !clubForm.adminEmail ||
      !clubForm.adminPassword
    ) {
      return;
    }
    const payload = {
      name: clubForm.name,
      slug: clubForm.slug,
      planoSaasId: clubForm.planoSaasId,
      currentPeriodEnd: new Date(clubForm.currentPeriodEnd).toISOString(),
      admin: {
        name: clubForm.adminName,
        email: clubForm.adminEmail,
        password: clubForm.adminPassword,
      },
    };
    const club = await apiFetch("/clubs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setClubs((prev) => [club, ...prev]);
    setClubForm({
      name: "",
      slug: "",
      planoSaasId: "",
      currentPeriodEnd: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Console SaaS" subtitle="Gestao de clubes, planos e assinaturas." />

      {dashboard && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-glass rounded-2xl p-5">
            <p className="text-xs uppercase text-slate-400 tracking-[0.3em]">Clubes</p>
            <p className="text-3xl text-white font-display mt-2">{dashboard.clubsTotal}</p>
            <p className="text-sm text-slate-400">
              {dashboard.clubsActive} ativos · {dashboard.clubsBlocked} bloqueados
            </p>
          </div>
          <div className="card-glass rounded-2xl p-5">
            <p className="text-xs uppercase text-slate-400 tracking-[0.3em]">Assinaturas</p>
            <p className="text-3xl text-white font-display mt-2">
              {dashboard.subscriptions?.reduce((sum, item) => sum + item._count.status, 0) || 0}
            </p>
            <p className="text-sm text-slate-400">Resumo por status</p>
          </div>
          <div className="card-glass rounded-2xl p-5">
            <p className="text-xs uppercase text-slate-400 tracking-[0.3em]">Planos</p>
            <p className="text-3xl text-white font-display mt-2">{plans.length}</p>
            <p className="text-sm text-slate-400">Ativos no SaaS</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <form className="card-glass rounded-3xl p-6 space-y-3" onSubmit={handleCreatePlan}>
          <h3 className="font-display text-xl text-white">Novo plano SaaS</h3>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Nome"
            value={planForm.name}
            onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })}
          />
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={planForm.interval}
            onChange={(event) => setPlanForm({ ...planForm, interval: event.target.value })}
          >
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Preco"
            value={planForm.price}
            onChange={(event) => setPlanForm({ ...planForm, price: event.target.value })}
          />
          <button className="btn-outline w-full" type="submit">
            Criar plano
          </button>
        </form>

        <form className="card-glass rounded-3xl p-6 space-y-3" onSubmit={handleCreateClub}>
          <h3 className="font-display text-xl text-white">Novo clube</h3>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Nome do clube"
            value={clubForm.name}
            onChange={(event) => setClubForm({ ...clubForm, name: event.target.value })}
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Slug"
            value={clubForm.slug}
            onChange={(event) => setClubForm({ ...clubForm, slug: event.target.value })}
          />
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={clubForm.planoSaasId}
            onChange={(event) => setClubForm({ ...clubForm, planoSaasId: event.target.value })}
          >
            <option value="">Plano SaaS</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={clubForm.currentPeriodEnd}
            onChange={(event) =>
              setClubForm({ ...clubForm, currentPeriodEnd: event.target.value })
            }
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Admin nome"
            value={clubForm.adminName}
            onChange={(event) => setClubForm({ ...clubForm, adminName: event.target.value })}
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Admin email"
            value={clubForm.adminEmail}
            onChange={(event) => setClubForm({ ...clubForm, adminEmail: event.target.value })}
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Admin senha"
            value={clubForm.adminPassword}
            onChange={(event) =>
              setClubForm({ ...clubForm, adminPassword: event.target.value })
            }
          />
          <button className="btn-primary w-full" type="submit">
            Criar clube
          </button>
        </form>
      </div>

      <div className="card-glass rounded-3xl p-6">
        <h3 className="font-display text-xl text-white">Clubes cadastrados</h3>
        <div className="mt-4 space-y-3">
          {clubs.map((club) => (
            <div key={club.id} className="flex items-center justify-between border border-slate-700 rounded-2xl p-4">
              <div>
                <p className="text-white font-semibold">{club.name}</p>
                <p className="text-xs text-slate-400">{club.slug}</p>
              </div>
              <span className="text-xs text-slate-300">{club.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
