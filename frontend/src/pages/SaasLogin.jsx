import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setToken, setUser } from "../services/api.js";

export default function SaasLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.user.role !== "SUPER_ADMIN") {
        setError("Este acesso e exclusivo do SaaS.");
        return;
      }
      setToken(data.token);
      setUser(data.user);
      navigate("/saas");
    } catch (err) {
      setError("Credenciais invalidas.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center app-shell px-6">
      <div className="card-glass rounded-3xl p-8 w-full max-w-md">
        <h1 className="font-display text-3xl text-white">Login SaaS</h1>
        <p className="text-slate-400 mt-2">Acesso exclusivo do dono do SaaS.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-300">E-mail</label>
            <input
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
              placeholder="admin@saas.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Senha</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-white"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Entrar no SaaS
          </button>
        </form>
      </div>
    </div>
  );
}
