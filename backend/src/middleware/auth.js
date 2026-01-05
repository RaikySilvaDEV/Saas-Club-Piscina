import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../services/prisma.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "missing_token" });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.active) {
      return res.status(401).json({ error: "invalid_user" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      clubId: user.clubId,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}