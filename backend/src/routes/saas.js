import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

export const saasRouter = Router();

saasRouter.use(requireAuth, requireRole("SUPER_ADMIN"));

saasRouter.get("/dashboard", async (req, res) => {
  const [clubsTotal, clubsActive, clubsBlocked, subscriptions] = await Promise.all([
    prisma.club.count(),
    prisma.club.count({ where: { status: "ACTIVE" } }),
    prisma.club.count({ where: { status: "BLOCKED" } }),
    prisma.assinaturaSaas.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  res.json({ clubsTotal, clubsActive, clubsBlocked, subscriptions });
});

saasRouter.get("/plans", async (req, res) => {
  const plans = await prisma.planoSaas.findMany({ orderBy: { createdAt: "desc" } });
  res.json(plans);
});

saasRouter.post("/plans", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    interval: z.enum(["monthly", "yearly"]),
    price: z.number().positive(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const plan = await prisma.planoSaas.create({ data: parsed.data });
  res.status(201).json(plan);
});
