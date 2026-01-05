import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../services/prisma.js";
import { getPreapproval } from "../services/mercadopago.js";

export const webhookRouter = Router();

webhookRouter.post("/payments", async (req, res) => {
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
  const allowNoSecret = process.env.WEBHOOK_ALLOW_NO_SECRET === "true";
  const rawSecretHeader = req.headers["x-webhook-secret"];
  const mpSignature = req.headers["x-signature"];

  if (secret && rawSecretHeader) {
    if (rawSecretHeader !== secret) {
      return res.status(401).json({ error: "invalid_signature" });
    }
  } else if (secret && mpSignature) {
    const [tsPart, sigPart] = String(mpSignature).split(",");
    const ts = tsPart?.split("=")[1];
    const v1 = sigPart?.split("=")[1];
    const bodyId = req.body?.data?.id || req.query?.["data.id"] || req.body?.id;
    if (!ts || !v1 || !bodyId) {
      return res.status(401).json({ error: "invalid_signature" });
    }
    const payload = `${ts}.${bodyId}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (expected !== v1) {
      return res.status(401).json({ error: "invalid_signature" });
    }
  } else if (secret && !allowNoSecret) {
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

  let preapproval;
  try {
    preapproval = await getPreapproval(preapprovalId);
  } catch (err) {
    console.error("Mercado Pago preapproval fetch failed", err);
    return res.json({ ok: false, error: "preapproval_not_found" });
  }
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
