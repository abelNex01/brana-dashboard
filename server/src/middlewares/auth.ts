import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable, usersTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string | null;
    avatar: string | null;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const token = authHeader.slice(7);
    if (!token) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const now = new Date();
    const [session] = await db
      .select({
        userId: sessionsTable.userId,
        expiresAt: sessionsTable.expiresAt,
      })
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.token, token),
          gt(sessionsTable.expiresAt, now),
        ),
      )
      .limit(1);

    if (!session) {
      res.status(401).json({ error: "Invalid or expired session." });
      return;
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        role: usersTable.role,
        avatar: usersTable.avatar,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found." });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
