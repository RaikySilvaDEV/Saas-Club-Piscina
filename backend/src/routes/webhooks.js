import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { getPreapproval } from "../services/mercadopago.js";

export const webhookRouter = Router();

webhookRouter.post("/payments", async (req, res) => {
  const signature = req.headers["x-webhook-secret"];
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
  const allowNoSecret = process.env.WEBHOOK_ALLOW_NO_SECRET === "true";
  if (secret && signature && signature !== secret) {
    return res.status(401).json({ error: "invalid_signature" });
  }
  if (secret && !signature && !allowNoSecret) {
    return res.status(401).json({ error: "missing_signature" });
  }

  const body = req.body || {};

  if (body.clubId && body.status && body.currentPeriodEnd) {
    await prisma.assinaturaSaas.update({
      where: { clubId: body.clubId },
      data: {
        status: body.status,
        currentPeriodEnd: new Date(body.currentPeriodEnd),
      },
    });

    await prisma.club.update({
      where: { id: body.clubId },
      data: { status: body.status === "ACTIVE" ? "ACTIVE" : "BLOCKED" },
    });

    return res.json({ ok: true });
  }

  const eventType = body.type || body.action;
  const preapprovalId = body?.data?.id;

  if (!preapprovalId || !eventType) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  const preapproval = await getPreapproval(preapprovalId);
  const clubId = preapproval.external_reference;

  if (!clubId) {
    return res.status(400).json({ error: "missing_external_reference" });
  }

  const statusMap = {
    authorized: "ACTIVE",
    pending: "PAST_DUE",
    paused: "CANCELED",
    cancelled: "CANCELED",
  };

  const status = statusMap[preapproval.status] || "PAST_DUE";
  const currentPeriodEnd = preapproval.next_payment_date
    ? new Date(preapproval.next_payment_date)
    : new Date();

  await prisma.assinaturaSaas.update({
    where: { clubId },
    data: {
      status,
      currentPeriodEnd,
      externalId: preapproval.id,
      paymentProvider: "mercadopago",
    },
  });

  await prisma.club.update({
    where: { id: clubId },
    data: { status: status === "ACTIVE" ? "ACTIVE" : "BLOCKED" },
  });

  return res.json({ ok: true });
});
