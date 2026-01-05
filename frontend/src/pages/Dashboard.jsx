import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { apiFetch } from "../services/api.js";

const quickActions = [
  { title: "Check-in visitante", desc: "Gere comanda + QR na hora" },
  { title: "Entrada socio", desc: "Valide CPF ou QR pessoal" },
  { title: "Abrir comanda", desc: "Inicie pedidos e consumo" },
];

const openComandas = [
  { code: "C-20431", guest: "Fernanda S.", status: "Recebido", total: "R$ 84,00" },
  { code: "S-10912", guest: "Socio - Raul", status: "Em preparo", total: "R$ 56,00" },
  { code: "C-20435", guest: "Grupo 6 pessoas", status: "Aberta", total: "R$ 132,00" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    openComandas: 0,
    sociosAtivos: 0,
    sociosInadimplentes: 0,
    faturamento: 0,
    entradasHoje: 0,
  });

  useEffect(() => {
    apiFetch("/reports/dashboard")
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard do clube"
        subtitle="Resumo do dia, comandas abertas e faturamento."
      />
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Comandas abertas" value={stats.openComandas} helper="Ultimos 30 minutos" />
        <StatCard
          title="Faturamento dia"
          value={`R$ ${Number(stats.faturamento).toFixed(2)}`}
          helper="Atualizado agora"
        />
        <StatCard
          title="Socios ativos"
          value={stats.sociosAtivos}
          helper={`${stats.sociosInadimplentes} inadimplentes`}
        />
        <StatCard title="Entradas hoje" value={stats.entradasHoje ?? 0} helper="Visitantes hoje" />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card-glass rounded-3xl p-6">
          <h2 className="font-display text-xl text-white">Operacao em tempo real</h2>
          <p className="text-sm text-slate-400 mt-2">Visao rapida das comandas em andamento.</p>
          <div className="mt-6 space-y-4">
            {openComandas.map((item) => (
              <div key={item.code} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{item.guest}</p>
                  <p className="text-xs text-slate-400">{item.code} · {item.status}</p>
                </div>
                <span className="text-sand-300 font-semibold">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass rounded-3xl p-6">
          <h2 className="font-display text-xl text-white">Atalhos do caixa</h2>
          <div className="mt-6 space-y-4">
            {quickActions.map((action) => (
              <div key={action.title} className="border border-slate-700 rounded-2xl p-4">
                <p className="text-white font-semibold">{action.title}</p>
                <p className="text-sm text-slate-400 mt-1">{action.desc}</p>
                <button className="btn-primary mt-4 w-full">Iniciar</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
