import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const bootstrapSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post("/bootstrap", async (req, res) => {
  const parsed = bootstrapSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const existing = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (existing) {
    return res.status(409).json({ error: "super_admin_exists" });
  }

  const password = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      role: "SUPER_ADMIN",
    },
  });

  const token = signToken({ userId: user.id });
  return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const ok = await comparePassword(parsed.data.password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = signToken({ userId: user.id });
  return res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, clubId: user.clubId },
  });
});

authRouter.post("/logout", async (req, res) => {
  // For JWT, logout is handled on the client side by deleting the token.
  return res.json({ message: "logged_out" });
});

authRouter.get("/me", async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, clubId: true },
  });
  if (!user) {
    return res.status(404).json({ error: "user_not_found" });
  }

  return res.json({ user });
});

authRouter.get("/exists", async (req, res) => {
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  return res.json({ superAdminExists: !!superAdmin });
});

