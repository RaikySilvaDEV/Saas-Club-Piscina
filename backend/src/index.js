import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { prisma } from "./services/prisma.js";
import { hashPassword } from "./utils/password.js";
import { getPreapproval } from "./services/mercadopago.js";
import { authRouter } from "./routes/auth.js";
import { clubsRouter } from "./routes/clubs.js";
import { sociosRouter } from "./routes/socios.js";
import { comandasRouter } from "./routes/comandas.js";
import { menuRouter } from "./routes/menu.js";
import { pagamentosRouter } from "./routes/pagamentos.js";
import { reportsRouter } from "./routes/reports.js";
import { webhookRouter } from "./routes/webhooks.js";
import { publicRouter } from "./routes/public.js";
import { usersRouter } from "./routes/users.js";
import { saasRouter } from "./routes/saas.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
app.use(limiter);

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/clubs", clubsRouter);
app.use("/api/socios", sociosRouter);
app.use("/api/comandas", comandasRouter);
app.use("/api/menu", menuRouter);
app.use("/api/pagamentos", pagamentosRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/public", publicRouter);
app.use("/api/users", usersRouter);
app.use("/api/saas", saasRouter);

async function ensureSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Owner";

  if (!email || !password) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "SUPER_ADMIN",
    },
  });
}

const port = process.env.PORT || 4000;
ensureSuperAdmin()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on :${port}`);
    });

    const pollingEnabled = process.env.MP_POLLING_ENABLED === "true";
    if (pollingEnabled) {
      const intervalMs = Number(process.env.MP_POLLING_INTERVAL_MS || 300000);
      setInterval(async () => {
        try {
          const pendings = await prisma.assinaturaSaas.findMany({
            where: { status: "PAST_DUE", paymentProvider: "mercadopago" },
          });
          for (const sub of pendings) {
            if (!sub.externalId) continue;
            const preapproval = await getPreapproval(sub.externalId);
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
              where: { clubId: sub.clubId },
              data: { status, currentPeriodEnd },
            });
            await prisma.club.update({
              where: { id: sub.clubId },
              data: { status: status === "ACTIVE" ? "ACTIVE" : "BLOCKED" },
            });
          }
        } catch (err) {
          console.error("Mercado Pago polling error", err);
        }
      }, intervalMs);
    }
  })
  .catch((err) => {
    console.error("Failed to bootstrap super admin", err);
    process.exit(1);
  });
