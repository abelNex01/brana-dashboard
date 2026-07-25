import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  avatar?: string;
  createdAt: string;
}

interface SignUpResult {
  ok: boolean;
  error?: string;
  confirmEmail?: boolean;
}

interface SignInResult {
  ok: boolean;
  error?: string;
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
  }) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => void | Promise<void>;
  isAtCapacity: boolean;
  resetAllData: () => void;
  serverAvailable: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name || 'User',
          phone: session.user.user_metadata?.phone,
          role: session.user.user_metadata?.role || 'user',
          avatar: session.user.user_metadata?.avatar,
          createdAt: session.user.created_at,
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name || 'User',
          phone: session.user.user_metadata?.phone,
          role: session.user.user_metadata?.role || 'user',
          avatar: session.user.user_metadata?.avatar,
          createdAt: session.user.created_at,
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      role?: string;
      avatar?: string;
    }): Promise<SignUpResult> => {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
              role: data.role,
              avatar: data.avatar,
            },
          },
        });

        if (error) {
          logger.debug("Sign-up error", { detail: error.message });
          return { ok: false, error: error.message };
        }

        // Supabase returns a fake success with empty identities when the email
        // is already registered AND email confirmation is enabled. Detect this
        // case and surface a meaningful error to the user.
        if (
          authData?.user &&
          authData.user.identities &&
          authData.user.identities.length === 0
        ) {
          return {
            ok: false,
            error: "An account with this email already exists. Please sign in instead.",
          };
        }

        // If Supabase returned a session, the user is immediately logged in
        // (email confirmation is disabled on the project).
        if (authData?.session) {
          return { ok: true };
        }

        // No session means the user must confirm their email before they can
        // sign in.  Signal this to the UI so it can show a helpful message.
        if (authData?.user && !authData.session) {
          return { ok: true, confirmEmail: true };
        }

        return { ok: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        logger.debug("Sign-up exception", { detail: message });
        return { ok: false, error: message };
      }
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Provide friendlier error messages for common cases
          if (error.message === "Invalid login credentials") {
            return { ok: false, error: "Invalid email or password. Please try again." };
          }
          if (error.message.includes("Email not confirmed")) {
            return {
              ok: false,
              error: "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
            };
          }
          return { ok: false, error: error.message };
        }

        return { ok: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { ok: false, error: message };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetAllData = useCallback(() => {
    // Left for compatibility with older UI buttons
    logger.debug("resetAllData called");
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      signUp,
      signIn,
      signOut,
      isAtCapacity: false, // Not relevant with Supabase
      resetAllData,
      serverAvailable: true, // Server is always Supabase
    }),
    [currentUser, signUp, signIn, signOut, resetAllData],
  );

  if (isLoading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

