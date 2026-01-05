import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center app-shell px-6">
      <div className="card-glass rounded-3xl p-8 w-full max-w-md">
        <h1 className="font-display text-3xl text-white">Acessos</h1>
        <p className="text-slate-400 mt-2">Escolha o tipo de acesso.</p>
        <div className="mt-8 space-y-4">
          <Link className="btn-primary w-full inline-flex justify-center" to="/saas/login">
            Sou dono do SaaS
          </Link>
          <Link className="btn-outline w-full inline-flex justify-center" to="/club/login">
            Sou um clube assinante
          </Link>
        </div>
      </div>
    </div>
  );
}
