import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireActiveSubscription } from "../middleware/subscription.js";

export const menuRouter = Router();

menuRouter.use(requireAuth, requireActiveSubscription);

menuRouter.get("/categorias", requireRole("CLUB_ADMIN", "CASHIER", "WAITER"), async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    where: { clubId: req.user.clubId, active: true },
    include: { produtos: { where: { active: true } } },
  });
  res.json(categorias);
});

menuRouter.post("/categorias", requireRole("CLUB_ADMIN"), async (req, res) => {
  const schema = z.object({ name: z.string().min(2) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const categoria = await prisma.categoria.create({
    data: { clubId: req.user.clubId, name: parsed.data.name },
  });
  res.status(201).json(categoria);
});

menuRouter.post("/produtos", requireRole("CLUB_ADMIN"), async (req, res) => {
  const schema = z.object({
    categoriaId: z.string().min(1),
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    photoUrl: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const categoria = await prisma.categoria.findFirst({
    where: { id: parsed.data.categoriaId, clubId: req.user.clubId, active: true },
  });
  if (!categoria) {
    return res.status(400).json({ error: "invalid_categoria" });
  }

  const produto = await prisma.produto.create({
    data: {
      clubId: req.user.clubId,
      categoriaId: categoria.id,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      photoUrl: parsed.data.photoUrl,
    },
  });

  res.status(201).json(produto);
});
