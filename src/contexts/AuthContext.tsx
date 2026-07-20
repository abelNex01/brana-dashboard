import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

/* ─── Types ────────────────────────────────────────── */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: string;
    avatar?: string;
  }) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
  signIn: (email: string, password: string) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
  signOut: () => void | Promise<void>;
  isAtCapacity: boolean;
  resetAllData: () => void;
  serverAvailable: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const STORAGE_TOKEN = "brana_session_token";
const STORAGE_USERS = "brana_users_v2";
const STORAGE_CURRENT = "brana_current_user";
const MAX_USERS = 4;

/* ─── Helpers ──────────────────────────────────────── */
function loadToken(): string | null {
  try { return localStorage.getItem(STORAGE_TOKEN); } catch { return null; }
}

function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_TOKEN, token);
    else localStorage.removeItem(STORAGE_TOKEN);
  } catch (err) {
    console.error("Failed to save session token:", err);
  }
}

function loadLocalUsers(): (AuthUser & { passwordHash: string })[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalUsers(users: (AuthUser & { passwordHash: string })[]) {
  try { localStorage.setItem(STORAGE_USERS, JSON.stringify(users)); }
  catch (err) { console.error("Failed to save users:", err); }
}

function loadCurrentEmail(): string | null {
  try { return localStorage.getItem(STORAGE_CURRENT); } catch { return null; }
}

function saveCurrentEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(STORAGE_CURRENT, email);
    else localStorage.removeItem(STORAGE_CURRENT);
  } catch (err) { console.error("Failed to save current user:", err); }
}

function generateLocalId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return `u_${Date.now()}_${Array.from(arr, b => b.toString(16).padStart(2, "0")).join("")}`;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = loadToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("__SERVER_UNREACHABLE__");
  }

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try { data = JSON.parse(text); }
    catch { throw new Error("Server returned an invalid response."); }
  }

  if (!res.ok) {
    throw new Error((data.error as string) ?? `Request failed (${res.status}).`);
  }
  return data as T;
}

/* ─── Context ──────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAtCapacity, setIsAtCapacity] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);

  // Detect server availability and load session
  useEffect(() => {
    const token = loadToken();

    apiFetch<{ user: AuthUser }>("/api/auth/me")
      .then(({ user }) => {
        setServerAvailable(true);
        setCurrentUser(user);
      })
      .catch(() => {
        // Server not available — fall back to localStorage auth
        setServerAvailable(false);
        saveToken(null);

        const email = loadCurrentEmail();
        if (email) {
          const users = loadLocalUsers();
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (user) {
            const { passwordHash: _, ...safeUser } = user;
            setCurrentUser(safeUser);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Check capacity
  useEffect(() => {
    if (serverAvailable) return;
    const users = loadLocalUsers();
    setIsAtCapacity(users.length >= MAX_USERS);
  }, [serverAvailable, currentUser]);

  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      role?: string;
      avatar?: string;
    }) => {
      // Try server first
      if (serverAvailable) {
        try {
          const result = await apiFetch<{
            user: AuthUser;
            session: { token: string };
          }>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
          });
          saveToken(result.session.token);
          setCurrentUser(result.user);
          return { ok: true as const };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Sign up failed.";
          if (msg !== "__SERVER_UNREACHABLE__") return { ok: false as const, error: msg };
          setServerAvailable(false);
        }
      }

      // Fallback: localStorage
      const existing = loadLocalUsers();
      if (existing.length >= MAX_USERS) {
        return { ok: false as const, error: "This application has reached its maximum capacity of 4 users." };
      }
      if (existing.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false as const, error: "An account with this email already exists." };
      }

      const passwordHash = await hashPassword(data.password);
      const newUser: AuthUser & { passwordHash: string } = {
        id: generateLocalId(),
        email: data.email.toLowerCase(),
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        avatar: data.avatar,
        createdAt: new Date().toISOString(),
        passwordHash,
      };

      const updated = [...existing, newUser];
      saveLocalUsers(updated);
      saveCurrentEmail(newUser.email);
      setIsAtCapacity(updated.length >= MAX_USERS);

      const { passwordHash: _, ...safeUser } = newUser;
      setCurrentUser(safeUser);
      return { ok: true as const };
    },
    [serverAvailable],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      // Try server first
      if (serverAvailable) {
        try {
          const result = await apiFetch<{
            user: AuthUser;
            session: { token: string };
          }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          saveToken(result.session.token);
          setCurrentUser(result.user);
          return { ok: true as const };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Invalid email or password.";
          if (msg !== "__SERVER_UNREACHABLE__") return { ok: false as const, error: msg };
          setServerAvailable(false);
        }
      }

      // Fallback: localStorage
      const passwordHash = await hashPassword(password);
      const users = loadLocalUsers();
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash,
      );
      if (!user) {
        return { ok: false as const, error: "Invalid email or password." };
      }

      saveCurrentEmail(user.email);
      const { passwordHash: _, ...safeUser } = user;
      setCurrentUser(safeUser);
      return { ok: true as const };
    },
    [serverAvailable],
  );

  const signOut = useCallback(async () => {
    if (serverAvailable) {
      try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    }
    saveToken(null);
    saveCurrentEmail(null);
    setCurrentUser(null);
  }, [serverAvailable]);

  const resetAllData = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setCurrentUser(null);
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      signUp,
      signIn,
      signOut,
      isAtCapacity,
      resetAllData,
      serverAvailable,
    }),
    [currentUser, signUp, signIn, signOut, isAtCapacity, resetAllData, serverAvailable],
  );

  if (isLoading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
