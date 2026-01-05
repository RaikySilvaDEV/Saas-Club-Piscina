import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireActiveSubscription } from "../middleware/subscription.js";
import QRCode from "qrcode";

export const comandasRouter = Router();

comandasRouter.use(requireAuth, requireActiveSubscription);

comandasRouter.get("/", requireRole("CLUB_ADMIN", "CASHIER", "WAITER"), async (req, res) => {
  const comandas = await prisma.comanda.findMany({
    where: { clubId: req.user.clubId },
    include: { socio: true, orders: { include: { items: true } } },
    orderBy: { openedAt: "desc" },
  });
  res.json(comandas);
});

comandasRouter.get("/:id", requireRole("CLUB_ADMIN", "CASHIER", "WAITER"), async (req, res) => {
  const comanda = await prisma.comanda.findFirst({
    where: { id: req.params.id, clubId: req.user.clubId },
    include: { socio: true, orders: { include: { items: true } }, pagamentos: true },
  });
  if (!comanda) {
    return res.status(404).json({ error: "comanda_not_found" });
  }
  res.json(comanda);
});

comandasRouter.post("/visitor", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const schema = z.object({
    visitorName: z.string().min(2),
    visitorCount: z.number().int().positive(),
    entryType: z.enum(["INDIVIDUAL", "CASAL", "GRUPO"]),
    entryValue: z.number().positive(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const code = `C-${Date.now()}`;
  const qrCode = await QRCode.toDataURL(`comanda:${code}`);

  const comanda = await prisma.comanda.create({
    data: {
      clubId: req.user.clubId,
      code,
      type: "VISITANTE",
      visitorName: parsed.data.visitorName,
      visitorCount: parsed.data.visitorCount,
      entryType: parsed.data.entryType,
      entryValue: parsed.data.entryValue,
      qrCode,
    },
  });

  res.status(201).json(comanda);
});

comandasRouter.post("/socio", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const schema = z.object({
    socioId: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const socio = await prisma.socio.findFirst({
    where: { id: parsed.data.socioId, clubId: req.user.clubId },
  });
  if (!socio || socio.status !== "ACTIVE") {
    return res.status(403).json({ error: "socio_inadimplente" });
  }

  const code = `S-${Date.now()}`;
  const qrCode = await QRCode.toDataURL(`comanda:${code}`);

  const comanda = await prisma.comanda.create({
    data: {
      clubId: req.user.clubId,
      code,
      type: "SOCIO",
      socioId: socio.id,
      qrCode,
    },
  });

  res.status(201).json(comanda);
});

comandasRouter.post("/:id/orders", requireRole("CLUB_ADMIN", "CASHIER", "WAITER"), async (req, res) => {
  const schema = z.object({
    notes: z.string().optional(),
    items: z.array(
      z.object({
        produtoId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    ),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const comanda = await prisma.comanda.findFirst({
    where: { id: req.params.id, clubId: req.user.clubId },
  });
  if (!comanda) {
    return res.status(404).json({ error: "comanda_not_found" });
  }

  const productIds = parsed.data.items.map((item) => item.produtoId);
  const produtos = await prisma.produto.findMany({
    where: { id: { in: productIds }, clubId: req.user.clubId, active: true },
  });
  if (produtos.length !== productIds.length) {
    return res.status(400).json({ error: "invalid_products" });
  }

  const discountPercent =
    comanda.type === "SOCIO" && comanda.socioId
      ? (
          await prisma.socio.findUnique({
            where: { id: comanda.socioId },
            include: { planoSocio: true },
          })
        )?.planoSocio?.discountPercent || 0
      : 0;

  const priceById = new Map(
    produtos.map((produto) => [
      produto.id,
      Number(produto.price) * (1 - discountPercent / 100),
    ])
  );

  const order = await prisma.order.create({
    data: {
      clubId: req.user.clubId,
      comandaId: comanda.id,
      notes: parsed.data.notes,
      items: {
        create: parsed.data.items.map((item) => ({
          clubId: req.user.clubId,
          produtoId: item.produtoId,
          quantity: item.quantity,
          price: Number(priceById.get(item.produtoId).toFixed(2)),
        })),
      },
    },
    include: { items: true },
  });

  res.status(201).json(order);
});

comandasRouter.patch("/:id/close", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const comanda = await prisma.comanda.findFirst({
    where: { id: req.params.id, clubId: req.user.clubId },
  });
  if (!comanda) {
    return res.status(404).json({ error: "comanda_not_found" });
  }

  const updated = await prisma.comanda.update({
    where: { id: comanda.id },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  res.json(updated);
});

comandasRouter.patch("/orders/:id/status", requireRole("CLUB_ADMIN", "CASHIER", "WAITER"), async (req, res) => {
  const schema = z.object({
    status: z.enum(["RECEIVED", "PREPARING", "DELIVERED"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const order = await prisma.order.findFirst({
    where: { id: req.params.id, clubId: req.user.clubId },
  });
  if (!order) {
    return res.status(404).json({ error: "order_not_found" });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: parsed.data.status },
  });

  res.json(updated);
});
