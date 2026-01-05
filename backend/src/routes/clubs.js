import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { hashPassword } from "../utils/password.js";

export const clubsRouter = Router();

const createClubSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  planoSaasId: z.string().min(1),
  currentPeriodEnd: z.string().datetime(),
  admin: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

clubsRouter.use(requireAuth, requireRole("SUPER_ADMIN"));

clubsRouter.get("/", async (req, res) => {
  const clubs = await prisma.club.findMany({
    include: { assinatura: true },
  });
  res.json(clubs);
});

clubsRouter.post("/", async (req, res) => {
  const parsed = createClubSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const { admin, ...clubData } = parsed.data;

  const password = await hashPassword(admin.password);
  const club = await prisma.club.create({
    data: {
      name: clubData.name,
      slug: clubData.slug,
      users: {
        create: {
          name: admin.name,
          email: admin.email,
          password,
          role: "CLUB_ADMIN",
        },
      },
      assinatura: {
        create: {
          planoSaasId: clubData.planoSaasId,
          status: "ACTIVE",
          currentPeriodEnd: new Date(clubData.currentPeriodEnd),
          paymentProvider: "manual",
        },
      },
    },
    include: { assinatura: true },
  });

  return res.status(201).json(club);
});

clubsRouter.patch("/:id/status", async (req, res) => {
  const schema = z.object({
    status: z.enum(["ACTIVE", "BLOCKED"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const club = await prisma.club.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  return res.json(club);
});
