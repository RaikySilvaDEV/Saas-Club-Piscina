import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { apiFetch } from "../services/api.js";

export default function Comandas() {
  const [comandas, setComandas] = useState([]);
  const [socios, setSocios] = useState([]);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: "",
    visitorCount: "",
    entryType: "INDIVIDUAL",
    entryValue: "",
  });
  const [socioId, setSocioId] = useState("");

  useEffect(() => {
    apiFetch("/comandas")
      .then((data) => setComandas(data))
      .catch(() => {});
    apiFetch("/socios")
      .then((data) => setSocios(data))
      .catch(() => {});
  }, []);

  async function handleCreateVisitor(event) {
    event.preventDefault();
    if (!visitorForm.visitorName || !visitorForm.visitorCount || !visitorForm.entryValue) {
      return;
    }
    const payload = {
      visitorName: visitorForm.visitorName,
      visitorCount: Number(visitorForm.visitorCount),
      entryType: visitorForm.entryType,
      entryValue: Number(visitorForm.entryValue),
    };
    const comanda = await apiFetch("/comandas/visitor", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setComandas((prev) => [comanda, ...prev]);
    setVisitorForm({ visitorName: "", visitorCount: "", entryType: "INDIVIDUAL", entryValue: "" });
  }

  async function handleCreateSocio(event) {
    event.preventDefault();
    if (!socioId) {
      return;
    }
    const comanda = await apiFetch("/comandas/socio", {
      method: "POST",
      body: JSON.stringify({ socioId }),
    });
    setComandas((prev) => [comanda, ...prev]);
    setSocioId("");
  }

  async function handleClose(comandaId) {
    const updated = await apiFetch(`/comandas/${comandaId}/close`, { method: "PATCH" });
    setComandas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comandas digitais"
        subtitle="Acompanhe status e consumo em tempo real."
        action={<button className="btn-primary w-full md:w-auto">Abrir comanda</button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <form className="card-glass rounded-3xl p-5 space-y-3" onSubmit={handleCreateVisitor}>
          <h3 className="text-white font-semibold">Check-in visitante</h3>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Nome do responsavel"
            value={visitorForm.visitorName}
            onChange={(event) => setVisitorForm({ ...visitorForm, visitorName: event.target.value })}
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Quantidade de pessoas"
            value={visitorForm.visitorCount}
            onChange={(event) => setVisitorForm({ ...visitorForm, visitorCount: event.target.value })}
          />
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={visitorForm.entryType}
            onChange={(event) => setVisitorForm({ ...visitorForm, entryType: event.target.value })}
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="CASAL">Casal</option>
            <option value="GRUPO">Grupo</option>
          </select>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Valor da entrada"
            value={visitorForm.entryValue}
            onChange={(event) => setVisitorForm({ ...visitorForm, entryValue: event.target.value })}
          />
          <button className="btn-primary w-full" type="submit">
            Abrir comanda visitante
          </button>
        </form>

        <form className="card-glass rounded-3xl p-5 space-y-3" onSubmit={handleCreateSocio}>
          <h3 className="text-white font-semibold">Check-in socio</h3>
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={socioId}
            onChange={(event) => setSocioId(event.target.value)}
          >
            <option value="">Selecione o socio</option>
            {socios.map((socio) => (
              <option key={socio.id} value={socio.id}>
                {socio.name}
              </option>
            ))}
          </select>
          <button className="btn-outline w-full" type="submit">
            Abrir comanda socio
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {comandas.map((comanda) => (
          <div key={comanda.id} className="card-glass rounded-3xl p-5">
            <p className="text-sand-300 text-xs uppercase tracking-[0.3em]">{comanda.code}</p>
            <h3 className="mt-3 text-white font-semibold text-lg">
              {comanda.visitorName || comanda.socio?.name || "Comanda"}
            </h3>
            <p className="text-sm text-slate-400 mt-1">Status: {comanda.status}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-white font-semibold">
                {comanda.status === "OPEN" ? "Aberta" : "Fechada"}
              </span>
              <button className="btn-outline" onClick={() => handleClose(comanda.id)}>
                Fechar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glass rounded-3xl p-6">
        <h3 className="font-display text-xl text-white">Fila de pedidos</h3>
        <div className="mt-4 space-y-3">
          {[
            "Caipirinha sem alcool · mesa 4",
            "Porcao de fritas · comanda C-20435",
            "Sanduiche natural · socio Raul",
          ].map((item) => (
            <div key={item} className="flex items-center justify-between border border-slate-700 rounded-2xl p-4">
              <p className="text-white">{item}</p>
              <span className="text-xs text-emerald-200 bg-emerald-400/20 px-3 py-1 rounded-full">
                Em preparo
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
