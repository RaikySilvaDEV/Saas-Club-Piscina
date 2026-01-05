import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import Login from "./pages/Login.jsx";
import SaasLogin from "./pages/SaasLogin.jsx";
import ClubLogin from "./pages/ClubLogin.jsx";
import SaasHome from "./pages/SaasHome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Socios from "./pages/Socios.jsx";
import Comandas from "./pages/Comandas.jsx";
import Menu from "./pages/Menu.jsx";
import Pagamentos from "./pages/Pagamentos.jsx";
import QrMenu from "./pages/QrMenu.jsx";
import Saas from "./pages/Saas.jsx";
import RequireRole from "./components/RequireRole.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/saas/login" element={<SaasLogin />} />
      <Route path="/club/login" element={<ClubLogin />} />
      <Route path="/qr/:code" element={<QrMenu />} />
      <Route path="/" element={<SaasHome />} />
      <Route
        path="/club/dashboard"
        element={
          <RequireRole roles={["CLUB_ADMIN", "CASHIER", "WAITER"]}>
            <Shell>
              <Dashboard />
            </Shell>
          </RequireRole>
        }
      />
      <Route
        path="/socios"
        element={
          <RequireRole roles={["CLUB_ADMIN", "CASHIER"]}>
            <Shell>
              <Socios />
            </Shell>
          </RequireRole>
        }
      />
      <Route
        path="/comandas"
        element={
          <RequireRole roles={["CLUB_ADMIN", "CASHIER", "WAITER"]}>
            <Shell>
              <Comandas />
            </Shell>
          </RequireRole>
        }
      />
      <Route
        path="/menu"
        element={
          <RequireRole roles={["CLUB_ADMIN", "CASHIER", "WAITER"]}>
            <Shell>
              <Menu />
            </Shell>
          </RequireRole>
        }
      />
      <Route
        path="/pagamentos"
        element={
          <RequireRole roles={["CLUB_ADMIN", "CASHIER"]}>
            <Shell>
              <Pagamentos />
            </Shell>
          </RequireRole>
        }
      />
      <Route
        path="/saas"
        element={
          <RequireRole roles={["SUPER_ADMIN"]}>
            <Shell>
              <Saas />
            </Shell>
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
