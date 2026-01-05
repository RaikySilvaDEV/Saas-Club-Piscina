import { prisma } from "../services/prisma.js";

export async function requireActiveSubscription(req, res, next) {
  if (!req.user || req.user.role === "SUPER_ADMIN") {
    return next();
  }

  const clubId = req.user.clubId;
  if (!clubId) {
    return res.status(403).json({ error: "club_required" });
  }

  const [club, assinatura] = await Promise.all([
    prisma.club.findUnique({ where: { id: clubId } }),
    prisma.assinaturaSaas.findUnique({ where: { clubId } }),
  ]);

  if (!club) {
    return res.status(403).json({ error: "club_not_found" });
  }

  if (club.status === "BLOCKED") {
    return res.status(402).json({ error: "club_blocked" });
  }

  if (!assinatura) {
    return res.status(403).json({ error: "subscription_required" });
  }

  const now = new Date();
  const isExpired = assinatura.currentPeriodEnd < now;
  const isActive = assinatura.status === "ACTIVE" && !isExpired;

  if (!isActive) {
    await prisma.club.update({
      where: { id: clubId },
      data: { status: "BLOCKED" },
    });
    return res.status(402).json({ error: "subscription_inactive" });
  }

  return next();
}
