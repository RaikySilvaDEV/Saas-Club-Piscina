import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireActiveSubscription } from "../middleware/subscription.js";

export const pagamentosRouter = Router();

pagamentosRouter.use(requireAuth, requireActiveSubscription);

pagamentosRouter.post("/", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const schema = z.object({
    comandaId: z.string().min(1),
    amount: z.number().positive(),
    method: z.enum(["PIX", "CARD", "CASH"]),
    type: z.enum(["ENTRY", "CONSUMPTION", "BOTH"]),
    status: z.enum(["PAID", "PENDING", "FAILED"]).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const comanda = await prisma.comanda.findFirst({
    where: { id: parsed.data.comandaId, clubId: req.user.clubId },
  });
  if (!comanda) {
    return res.status(404).json({ error: "comanda_not_found" });
  }

  const pagamento = await prisma.pagamento.create({
    data: {
      clubId: req.user.clubId,
      comandaId: comanda.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      type: parsed.data.type,
      status: parsed.data.status || "PAID",
    },
  });

  res.status(201).json(pagamento);
});

pagamentosRouter.get("/", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const pagamentos = await prisma.pagamento.findMany({
    where: { clubId: req.user.clubId },
    orderBy: { createdAt: "desc" },
  });
  res.json(pagamentos);
});
