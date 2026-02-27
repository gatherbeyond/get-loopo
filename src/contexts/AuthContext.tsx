import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getPostAuthRedirect } from "@/lib/onboarding";

type UserRole = "parent" | "kid";

interface AuthUser {
  role: UserRole;
  name: string;
  familyName?: string;
  kidId?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginAsParent: (name: string, familyName: string) => void;
  loginAsKid: (name: string, kidId: string, avatar?: string) => void;
  logout: () => void;
}

const AUTH_KEY = "loopo_auth";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persist = (u: AuthUser | null) => {
    if (u) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
    setUser(u);
  };

  const loginAsParent = useCallback((name: string, familyName: string) => {
    persist({ role: "parent", name, familyName });
  }, []);

  const loginAsKid = useCallback((name: string, kidId: string, avatar?: string) => {
    persist({ role: "kid", name, kidId, avatar });
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut();
    persist(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginAsParent, loginAsKid, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Wrapper that listens for Supabase OAuth callbacks and redirects accordingly.
 * Place inside BrowserRouter so useNavigate works.
 */
export const OAuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsParent } = useAuth();

  useEffect(() => {
    // Check for existing session on mount (catches OAuth redirects)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirect = await getPostAuthRedirect();
        if (redirect === "/parent") {
          const name = session.user.user_metadata?.full_name || "Parent";
          loginAsParent(name, "My Family");
        }
        navigate(redirect, { replace: true });
      }
    };
    checkExistingSession();

    // Also listen for future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const redirect = await getPostAuthRedirect();
        if (redirect === "/parent") {
          const name = session.user.user_metadata?.full_name || "Parent";
          loginAsParent(name, "My Family");
        }
        navigate(redirect, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loginAsParent]);

  return null;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
