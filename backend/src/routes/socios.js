import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireActiveSubscription } from "../middleware/subscription.js";
import QRCode from "qrcode";

export const sociosRouter = Router();

sociosRouter.use(requireAuth, requireActiveSubscription);

sociosRouter.get("/planos", requireRole("CLUB_ADMIN"), async (req, res) => {
  const planos = await prisma.planoSocio.findMany({
    where: { clubId: req.user.clubId },
  });
  res.json(planos);
});

sociosRouter.post("/planos", requireRole("CLUB_ADMIN"), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    monthlyPrice: z.number().positive(),
    maxPeople: z.number().int().positive(),
    discountPercent: z.number().min(0).max(100).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const plano = await prisma.planoSocio.create({
    data: {
      clubId: req.user.clubId,
      ...parsed.data,
    },
  });

  res.status(201).json(plano);
});

sociosRouter.get("/", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  await prisma.socio.updateMany({
    where: { clubId: req.user.clubId, status: "ACTIVE", dueDate: { lt: new Date() } },
    data: { status: "INADIMPLENTE" },
  });

  const socios = await prisma.socio.findMany({
    where: { clubId: req.user.clubId },
    include: { planoSocio: true, dependentes: true },
  });
  res.json(socios);
});

sociosRouter.post("/", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    cpf: z.string().min(11),
    planoSocioId: z.string().min(1),
    dueDate: z.string().datetime(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const plano = await prisma.planoSocio.findFirst({
    where: { id: parsed.data.planoSocioId, clubId: req.user.clubId, active: true },
  });
  if (!plano) {
    return res.status(400).json({ error: "invalid_plano" });
  }

  const qrCode = await QRCode.toDataURL(`socio:${parsed.data.cpf}`);
  const socio = await prisma.socio.create({
    data: {
      clubId: req.user.clubId,
      name: parsed.data.name,
      cpf: parsed.data.cpf,
      planoSocioId: plano.id,
      dueDate: new Date(parsed.data.dueDate),
      qrCode,
    },
  });

  res.status(201).json(socio);
});

sociosRouter.post("/:id/dependentes", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    document: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const socio = await prisma.socio.findFirst({
    where: { id: req.params.id, clubId: req.user.clubId },
  });
  if (!socio) {
    return res.status(404).json({ error: "socio_not_found" });
  }

  const dependente = await prisma.dependente.create({
    data: {
      clubId: req.user.clubId,
      socioId: socio.id,
      ...parsed.data,
    },
  });

  res.status(201).json(dependente);
});

sociosRouter.patch("/:id/status", requireRole("CLUB_ADMIN", "CASHIER"), async (req, res) => {
  const schema = z.object({
    status: z.enum(["ACTIVE", "INADIMPLENTE"]),
    dueDate: z.string().datetime().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const socio = await prisma.socio.findFirst({
    where: { id: req.params.id, clubId: req.user.clubId },
  });
  if (!socio) {
    return res.status(404).json({ error: "socio_not_found" });
  }

  const updated = await prisma.socio.update({
    where: { id: socio.id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.dueDate ? { dueDate: new Date(parsed.data.dueDate) } : {}),
    },
  });

  res.json(updated);
});
