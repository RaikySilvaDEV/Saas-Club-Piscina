import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { apiFetch } from "../services/api.js";

export default function Socios() {
  const [socios, setSocios] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    planoSocioId: "",
    dueDate: "",
  });
  const [planForm, setPlanForm] = useState({
    name: "",
    monthlyPrice: "",
    maxPeople: "",
    discountPercent: "",
  });

  useEffect(() => {
    apiFetch("/socios")
      .then((data) => setSocios(data))
      .catch(() => {});
    apiFetch("/socios/planos")
      .then((data) => setPlanos(data))
      .catch(() => {});
  }, []);

  async function handleCreateSocio(event) {
    event.preventDefault();
    if (!form.name || !form.cpf || !form.planoSocioId || !form.dueDate) {
      return;
    }
    const payload = {
      ...form,
      dueDate: new Date(form.dueDate).toISOString(),
    };
    const socio = await apiFetch("/socios", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setSocios((prev) => [socio, ...prev]);
    setForm({ name: "", cpf: "", planoSocioId: "", dueDate: "" });
  }

  async function handleCreatePlan(event) {
    event.preventDefault();
    if (!planForm.name || !planForm.monthlyPrice || !planForm.maxPeople) {
      return;
    }
    const payload = {
      name: planForm.name,
      monthlyPrice: Number(planForm.monthlyPrice),
      maxPeople: Number(planForm.maxPeople),
      discountPercent: planForm.discountPercent ? Number(planForm.discountPercent) : 0,
    };
    const plan = await apiFetch("/socios/planos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setPlanos((prev) => [plan, ...prev]);
    setPlanForm({ name: "", monthlyPrice: "", maxPeople: "", discountPercent: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Socios e dependentes"
        subtitle="Controle de mensalistas e carteirinhas digitais."
        action={<button className="btn-primary w-full md:w-auto">Novo socio</button>}
      />

      <div className="card-glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-300 text-sm uppercase tracking-[0.25em]">Lista principal</p>
          <span className="text-sand-300 text-sm">{socios.length} registros</span>
        </div>
        <div className="mt-6 space-y-4">
          {socios.map((socio) => (
            <div key={socio.id} className="flex items-center justify-between border border-slate-700 rounded-2xl p-4">
              <div>
                <p className="text-white font-semibold">{socio.name}</p>
                <p className="text-xs text-slate-400">
                  {socio.cpf} · {socio.planoSocio?.name || "Plano"}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  socio.status === "ACTIVE"
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-rose-400/20 text-rose-200"
                }`}
              >
                {socio.status === "ACTIVE" ? "Ativo" : "Inadimplente"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-glass rounded-3xl p-6">
          <h3 className="font-display text-lg text-white">Planos de socio</h3>
          <p className="text-sm text-slate-400 mt-2">Configure limites e descontos.</p>
          <form className="mt-4 space-y-3" onSubmit={handleCreatePlan}>
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              placeholder="Nome do plano"
              value={planForm.name}
              onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })}
            />
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              placeholder="Valor mensal"
              value={planForm.monthlyPrice}
              onChange={(event) => setPlanForm({ ...planForm, monthlyPrice: event.target.value })}
            />
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              placeholder="Max pessoas"
              value={planForm.maxPeople}
              onChange={(event) => setPlanForm({ ...planForm, maxPeople: event.target.value })}
            />
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              placeholder="Desconto (%)"
              value={planForm.discountPercent}
              onChange={(event) =>
                setPlanForm({ ...planForm, discountPercent: event.target.value })
              }
            />
            <button className="btn-outline w-full" type="submit">
              Criar plano
            </button>
          </form>
        </div>
        <div className="card-glass rounded-3xl p-6">
          <h3 className="font-display text-lg text-white">Cadastrar socio</h3>
          <p className="text-sm text-slate-400 mt-2">Crie mensalistas e gere QR automaticamente.</p>
          <form className="mt-4 space-y-3" onSubmit={handleCreateSocio}>
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              placeholder="Nome completo"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <input
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              placeholder="CPF"
              value={form.cpf}
              onChange={(event) => setForm({ ...form, cpf: event.target.value })}
            />
            <select
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              value={form.planoSocioId}
              onChange={(event) => setForm({ ...form, planoSocioId: event.target.value })}
            >
              <option value="">Selecione o plano</option>
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
            <button className="btn-primary w-full" type="submit">
              Salvar socio
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
