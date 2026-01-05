import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { hashPassword } from "../utils/password.js";
import { createPreapproval } from "../services/mercadopago.js";

export const publicRouter = Router();

publicRouter.get("/plans", async (req, res) => {
  const plans = await prisma.planoSaas.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(plans);
});

publicRouter.get("/menu/:code", async (req, res) => {
  const comanda = await prisma.comanda.findFirst({
    where: { code: req.params.code, status: "OPEN" },
  });
  if (!comanda) {
    return res.status(404).json({ error: "comanda_not_found" });
  }

  const categorias = await prisma.categoria.findMany({
    where: { clubId: comanda.clubId, active: true },
    include: { produtos: { where: { active: true } } },
  });

  return res.json({ comandaId: comanda.id, categorias });
});

publicRouter.post("/club-signup", async (req, res) => {
  const schema = z.object({
    clubName: z.string().min(2),
    slug: z.string().min(2),
    planoSaasId: z.string().min(1),
    adminName: z.string().min(2),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const plan = await prisma.planoSaas.findFirst({
    where: { id: parsed.data.planoSaasId, active: true },
  });
  if (!plan) {
    return res.status(400).json({ error: "invalid_plan" });
  }

  const existing = await prisma.club.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return res.status(409).json({ error: "slug_taken" });
  }

  const userExists = await prisma.user.findUnique({
    where: { email: parsed.data.adminEmail },
  });
  if (userExists) {
    return res.status(409).json({ error: "email_taken" });
  }

  const password = await hashPassword(parsed.data.adminPassword);
  const now = new Date();

  const club = await prisma.club.create({
    data: {
      name: parsed.data.clubName,
      slug: parsed.data.slug,
      status: "BLOCKED",
      users: {
        create: {
          name: parsed.data.adminName,
          email: parsed.data.adminEmail,
          password,
          role: "CLUB_ADMIN",
        },
      },
      assinatura: {
        create: {
          planoSaasId: plan.id,
          status: "PAST_DUE",
          currentPeriodEnd: now,
          paymentProvider: "mercadopago",
        },
      },
    },
    include: { assinatura: true },
  });

  const frequencyType = plan.interval === "yearly" ? "years" : "months";
  const preapproval = await createPreapproval({
    reason: `Plano ${plan.name} - ${club.name}`,
    payerEmail: parsed.data.adminEmail,
    externalReference: club.id,
    frequency: 1,
    frequencyType,
    transactionAmount: Number(plan.price),
    backUrl: process.env.PUBLIC_WEB_URL || "http://localhost:5173/club/login",
  });

  await prisma.assinaturaSaas.update({
    where: { clubId: club.id },
    data: {
      externalId: preapproval.id,
    },
  });

  return res.status(201).json({ clubId: club.id, checkoutUrl: preapproval.init_point });
});

publicRouter.post("/order/:code", async (req, res) => {
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
    where: { code: req.params.code, status: "OPEN" },
  });
  if (!comanda) {
    return res.status(404).json({ error: "comanda_not_found" });
  }

  const productIds = parsed.data.items.map((item) => item.produtoId);
  const produtos = await prisma.produto.findMany({
    where: { id: { in: productIds }, clubId: comanda.clubId, active: true },
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
      clubId: comanda.clubId,
      comandaId: comanda.id,
      notes: parsed.data.notes,
      items: {
        create: parsed.data.items.map((item) => ({
          clubId: comanda.clubId,
          produtoId: item.produtoId,
          quantity: item.quantity,
          price: Number(priceById.get(item.produtoId).toFixed(2)),
        })),
      },
    },
    include: { items: true },
  });

  return res.status(201).json(order);
});
