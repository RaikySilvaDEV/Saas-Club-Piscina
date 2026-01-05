import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";

const highlights = [
  {
    title: "Entrada inteligente",
    desc: "Check-in rapido para visitantes e socios, com bloqueio automatico de inadimplentes.",
  },
  {
    title: "Comandas digitais",
    desc: "Pedidos via QR Code e status em tempo real para cozinha e bar.",
  },
  {
    title: "Financeiro do clube",
    desc: "Pagamentos Pix, cartao e dinheiro com fechamento de comanda na saida.",
  },
  {
    title: "SaaS recorrente",
    desc: "Planos mensais e anuais, webhook de pagamento e bloqueio automatico.",
  },
];

const modules = [
  "Dashboard do clube",
  "Gestao de socios e dependentes",
  "Planos de socio por clube",
  "Cardapio por categoria",
  "Comandas e pedidos",
  "Relatorios financeiros",
  "Controle de usuarios internos",
  "Console SaaS (Super Admin)",
];

export default function SaasHome() {
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState("");
  const [demoStep, setDemoStep] = useState(0);
  const [form, setForm] = useState({
    clubName: "",
    slug: "",
    planoSaasId: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  useEffect(() => {
    apiFetch("/public/plans")
      .then((data) => setPlans(data))
      .catch(() => {});
  }, []);

  const demoSteps = [
    {
      title: "Comanda aberta",
      desc: "O visitante recebe um QR Code na entrada.",
    },
    {
      title: "Pedido feito",
      desc: "O pedido chega direto no bar/cozinha.",
    },
    {
      title: "Pedido entregue",
      desc: "Status atualizado e pronto para fechar.",
    },
  ];

  async function handleSignup(event) {
    event.preventDefault();
    setStatus("");
    if (
      !form.clubName ||
      !form.slug ||
      !form.planoSaasId ||
      !form.adminName ||
      !form.adminEmail ||
      !form.adminPassword
    ) {
      setStatus("Preencha todos os campos obrigatorios.");
      return;
    }
    try {
      const data = await apiFetch("/public/club-signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setStatus("Cadastro realizado. Use o login do clube para acessar.");
      setForm({
        clubName: "",
        slug: "",
        planoSaasId: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
    } catch (err) {
      setStatus("Nao foi possivel cadastrar. Verifique os dados.");
    }
  }

  return (
    <div className="min-h-screen app-shell text-slate-100">
      <div className="px-6 pt-10 pb-16">
        <header className="card-glass hero-bg rounded-3xl p-6 md:p-10 flex flex-col gap-6">
          <div className="hero-bubble one" />
          <div className="hero-bubble two" />
          <div className="hero-bubble three" />
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.5em] text-sand-300">ClubPiscina SaaS</p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              O sistema premium para clubes com piscina.
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl">
              Experiencia moderna para socios e visitantes, com operacao impecavel para o clube.
              Controle de entrada, comandas digitais e cardapio por QR Code em tempo real.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/saas/login" className="btn-primary text-center pulse-ring">
              Entrar como dono do SaaS
            </Link>
            <Link to="/club/login" className="btn-outline text-center">
              Sou um clube assinante
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3 stagger">
          {highlights.map((item) => (
            <div key={item.title} className="card-glass rounded-3xl p-6">
              <h3 className="font-display text-xl text-white">{item.title}</h3>
              <p className="text-slate-400 mt-2">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="pool-panel rounded-3xl p-6">
            <h2 className="font-display text-2xl text-white">Ambiente de clube, operacao profissional</h2>
            <p className="text-slate-300 mt-2">
              Cada clube com sua identidade, socios, visitantes e cardapio isolados por club_id.
            </p>
            <div className="mt-6 grid gap-3">
              {modules.map((module) => (
                <div
                  key={module}
                  className="flex items-center justify-between border border-slate-700 rounded-2xl px-4 py-3"
                >
                  <span className="text-slate-200">{module}</span>
                  <span className="text-sand-300 text-xs uppercase tracking-[0.3em]">ativo</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass rounded-3xl p-6 flex flex-col gap-6">
            <div>
              <h2 className="font-display text-2xl text-white">Venda como SaaS premium</h2>
              <p className="text-slate-400 mt-2">
                Planos recorrentes, liberacao automatica e bloqueio por inadimplencia.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="deck-strip rounded-2xl p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Plano mensal</p>
                <p className="text-3xl font-display text-white mt-2">R$ 399</p>
                <p className="text-sm text-slate-200 mt-1">Por clube ativo</p>
              </div>
              <div className="deck-strip rounded-2xl p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Plano anual</p>
                <p className="text-3xl font-display text-white mt-2">R$ 3.990</p>
                <p className="text-sm text-slate-200 mt-1">Economia de 2 meses</p>
              </div>
            </div>
            <Link to="/saas/login" className="btn-primary text-center">
              Gerenciar planos agora
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card-glass rounded-3xl p-6">
            <h2 className="font-display text-2xl text-white">Como funciona (bem simples)</h2>
            <div className="mt-6 grid gap-3">
              {[
                "1. Visitante chega e faz check-in rapido",
                "2. QR Code abre o cardapio no celular",
                "3. Pedido vai direto para a equipe",
                "4. Pagamento e saida sem confusao",
              ].map((step) => (
                <div key={step} className="border border-slate-700 rounded-2xl px-4 py-3">
                  <p className="text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass rounded-3xl p-6">
            <h2 className="font-display text-2xl text-white">Simulador rapido</h2>
            <p className="text-slate-400 mt-2">
              Clique e veja o fluxo de uma comanda em 3 passos.
            </p>
            <div className="mt-6 border border-slate-700 rounded-2xl p-5">
              <p className="text-sand-300 text-xs uppercase tracking-[0.3em]">Comanda</p>
              <h3 className="text-white font-semibold text-xl mt-2">
                {demoSteps[demoStep].title}
              </h3>
              <p className="text-slate-400 mt-2">{demoSteps[demoStep].desc}</p>
              <div className="mt-4 flex gap-2">
                {demoSteps.map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs ${
                      demoStep === index ? "bg-sand-400 text-slate-900" : "bg-slate-800 text-slate-300"
                    }`}
                    onClick={() => setDemoStep(index)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="card-glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-2xl text-white">Cadastre seu clube</h2>
            <p className="text-slate-400 mt-2">
              Escolha o plano e crie o acesso do administrador do clube.
            </p>
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSignup}>
              <input
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
                placeholder="Nome do clube"
                value={form.clubName}
                onChange={(event) => setForm({ ...form, clubName: event.target.value })}
              />
              <input
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
                placeholder="Slug do clube"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
              />
              <select
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
                value={form.planoSaasId}
                onChange={(event) => setForm({ ...form, planoSaasId: event.target.value })}
              >
                <option value="">Selecione o plano</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - R$ {Number(plan.price).toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
                placeholder="Nome do administrador"
                value={form.adminName}
                onChange={(event) => setForm({ ...form, adminName: event.target.value })}
              />
              <input
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
                placeholder="Email do administrador"
                value={form.adminEmail}
                onChange={(event) => setForm({ ...form, adminEmail: event.target.value })}
              />
              <input
                type="password"
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
                placeholder="Senha do administrador"
                value={form.adminPassword}
                onChange={(event) => setForm({ ...form, adminPassword: event.target.value })}
              />
              <div className="md:col-span-2 flex flex-col gap-3">
                {status && <p className="text-slate-300 text-sm">{status}</p>}
                <button className="btn-primary w-full" type="submit">
                  Criar conta do clube
                </button>
                <Link to="/club/login" className="btn-outline w-full text-center">
                  Ja tenho acesso do clube
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
