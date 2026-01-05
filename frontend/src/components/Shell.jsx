import { NavLink, Navigate, useNavigate } from "react-router-dom";
import MobileNav from "./MobileNav.jsx";
import { clearToken, getToken, getUser } from "../services/api.js";

export default function Shell({ children }) {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const navItems = isSuperAdmin
    ? [{ to: "/saas", label: "SaaS" }]
    : [
        { to: "/club/dashboard", label: "Dashboard" },
        { to: "/socios", label: "Socios" },
        { to: "/comandas", label: "Comandas" },
        { to: "/menu", label: "Cardapio" },
        { to: "/pagamentos", label: "Pagamentos" },
      ];

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="app-shell min-h-screen pb-24">
      <header className="px-6 pt-6">
        <div className="card-glass rounded-3xl px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">ClubPiscina</p>
            <h1 className="font-display text-2xl text-white">
              {isSuperAdmin ? "Console SaaS" : "Controle total do clube"}
            </h1>
          </div>
          <div className="hidden md:flex gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-semibold transition ${
                    isActive ? "bg-sand-400 text-slate-900" : "text-slate-200 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="hidden md:flex gap-2">
            <button className="btn-outline">Novo check-in</button>
            <button className="btn-outline" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 pt-8">
        <div className="page-container">{children}</div>
      </main>

      <MobileNav items={navItems} />
    </div>
  );
}
