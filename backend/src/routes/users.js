import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireActiveSubscription } from "../middleware/subscription.js";
import { hashPassword } from "../utils/password.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireActiveSubscription);

usersRouter.get("/", requireRole("CLUB_ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { clubId: req.user.clubId },
    select: { id: true, name: true, email: true, role: true, active: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

usersRouter.post("/", requireRole("CLUB_ADMIN"), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["CLUB_ADMIN", "CASHIER", "WAITER"]),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const password = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      clubId: req.user.clubId,
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      role: parsed.data.role,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  res.status(201).json(user);
});

usersRouter.patch("/:id/status", requireRole("CLUB_ADMIN"), async (req, res) => {
  const { active } = req.body || {};
  if (typeof active !== "boolean") {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { active },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  res.json(user);
});
