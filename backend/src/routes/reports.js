import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireActiveSubscription } from "../middleware/subscription.js";

export const reportsRouter = Router();

reportsRouter.use(requireAuth, requireActiveSubscription);

reportsRouter.get("/dashboard", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const clubId = req.user.clubId;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [openComandas, sociosAtivos, sociosInadimplentes, faturamento, entradasHoje] =
    await Promise.all([
    prisma.comanda.count({ where: { clubId, status: "OPEN" } }),
    prisma.socio.count({ where: { clubId, status: "ACTIVE" } }),
    prisma.socio.count({ where: { clubId, status: "INADIMPLENTE" } }),
    prisma.pagamento.aggregate({
      where: { clubId },
      _sum: { amount: true },
    }),
    prisma.comanda.count({
      where: { clubId, type: "VISITANTE", openedAt: { gte: startOfDay } },
    }),
  ]);

  res.json({
    openComandas,
    sociosAtivos,
    sociosInadimplentes,
    faturamento: faturamento._sum.amount || 0,
    entradasHoje,
  });
});
