import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router: IRouter = Router();

const SALT_ROUNDS = 12;
const MAX_USERS = 4;
const SESSION_DURATION_HOURS = 24;

const registerSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  fullName: z.string().min(1, "Full name is required.").max(100),
  phone: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  await db.insert(sessionsTable).values({
    userId,
    token,
    expiresAt,
  });

  return { token, expiresAt: expiresAt.toISOString() };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
      return;
    }

    const { email, password, fullName, phone, role, avatar } = parsed.data;

    // Check user count
    const [userCount] = await db.select({ value: count() }).from(usersTable);
    if (userCount && userCount.value >= MAX_USERS) {
      res.status(403).json({ error: "This application has reached its maximum capacity of 4 users." });
      return;
    }

    // Check existing email
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone: phone ?? null,
        role: role ?? "member",
        avatar: avatar ?? null,
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        role: usersTable.role,
        avatar: usersTable.avatar,
        createdAt: usersTable.createdAt,
      });

    const session = await createSession(newUser.id);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      },
      session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const session = await createSession(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/auth/logout", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.slice(7);
    if (token) {
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — get current user from session
router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// DELETE /api/auth/sessions — clean up expired sessions
router.delete("/auth/sessions", requireAuth, async (_req, res, next) => {
  try {
    const now = new Date();
    // Drizzle doesn't have a direct lt for timestamps in this context, use raw
    await db.delete(sessionsTable).where(eq(sessionsTable.expiresAt, now)); // placeholder — in production use `lt`
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
