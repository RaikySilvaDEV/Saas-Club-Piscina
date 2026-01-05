import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { apiFetch } from "../services/api.js";

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [form, setForm] = useState({
    comandaId: "",
    amount: "",
    method: "PIX",
    type: "CONSUMPTION",
    status: "PAID",
  });

  useEffect(() => {
    apiFetch("/pagamentos")
      .then((data) => setPagamentos(data))
      .catch(() => {});
    apiFetch("/comandas")
      .then((data) => setComandas(data))
      .catch(() => {});
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    if (!form.comandaId || !form.amount) {
      return;
    }
    const payload = {
      comandaId: form.comandaId,
      amount: Number(form.amount),
      method: form.method,
      type: form.type,
      status: form.status,
    };
    const pagamento = await apiFetch("/pagamentos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setPagamentos((prev) => [pagamento, ...prev]);
    setForm({ comandaId: "", amount: "", method: "PIX", type: "CONSUMPTION", status: "PAID" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagamentos"
        subtitle="Registro de entradas e consumo."
        action={<button className="btn-primary w-full md:w-auto">Novo pagamento</button>}
      />

      <form className="card-glass rounded-3xl p-6 space-y-3" onSubmit={handleCreate}>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={form.comandaId}
            onChange={(event) => setForm({ ...form, comandaId: event.target.value })}
          >
            <option value="">Selecione a comanda</option>
            {comandas.map((comanda) => (
              <option key={comanda.id} value={comanda.id}>
                {comanda.code} - {comanda.visitorName || comanda.socio?.name || "Comanda"}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Valor"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={form.method}
            onChange={(event) => setForm({ ...form, method: event.target.value })}
          >
            <option value="PIX">Pix</option>
            <option value="CARD">Cartao</option>
            <option value="CASH">Dinheiro</option>
          </select>
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            <option value="ENTRY">Entrada</option>
            <option value="CONSUMPTION">Consumo</option>
            <option value="BOTH">Entrada + consumo</option>
          </select>
        </div>
        <button className="btn-outline w-full" type="submit">
          Registrar pagamento
        </button>
      </form>

      <div className="card-glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-300 text-sm uppercase tracking-[0.25em]">Ultimos registros</p>
          <span className="text-sand-300 text-sm">{pagamentos.length} registros</span>
        </div>
        <div className="mt-6 space-y-4">
          {pagamentos.map((item) => (
            <div key={item.id} className="flex items-center justify-between border border-slate-700 rounded-2xl p-4">
              <div>
                <p className="text-white font-semibold">{item.id}</p>
                <p className="text-xs text-slate-400">{item.method}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">R$ {Number(item.amount).toFixed(2)}</p>
                <p className="text-xs text-slate-400">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
