import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


type UserRole = "parent" | "kid";

interface AuthUser {
  role: UserRole;
  name: string;
  familyName?: string;
  kidId?: string;
  avatar?: string;
  anonymousUid?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsParent: (name: string, familyName: string) => void;
  loginAsKid: (name: string, kidId: string, avatar?: string, anonymousUid?: string) => void;
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

  const loginAsKid = useCallback((name: string, kidId: string, avatar?: string, anonymousUid?: string) => {
    persist({ role: "kid", name, kidId, avatar, anonymousUid });
  }, []);

  const logout = useCallback(async () => {
    const currentRole = user?.role;
    
    if (currentRole === "kid") {
      // Sign out the kid's anonymous session
      await supabase.auth.signOut();
      
      // Restore parent session if available
      try {
        const stored = localStorage.getItem("loopo_parent_session");
        if (stored) {
          const { access_token, refresh_token } = JSON.parse(stored);
          await supabase.auth.setSession({ access_token, refresh_token });
          localStorage.removeItem("loopo_parent_session");
        }
      } catch (e) {
        console.error("Failed to restore parent session:", e);
      }
    } else {
      await supabase.auth.signOut();
    }
    
    persist(null);
  }, [user]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Skip session check for kid users — their anonymous session is independent
        if (user?.role === "kid") {
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && user?.role === "parent") {
          persist(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginAsParent, loginAsKid, logout }}>
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
  const location = useLocation();
  const { loginAsParent } = useAuth();
  const initialSessionHandled = useRef(false);

  const AUTH_PAGES = ["/", "/home", "/parent-auth", "/parent-login"];

  const isOnAuthPage = () =>
    AUTH_PAGES.includes(location.pathname) &&
    !location.pathname.startsWith("/signup");

  useEffect(() => {
    const resolvePostAuthRedirect = async (userId: string) => {
      const { data: family, error } = await supabase
        .from("families")
        .select("id")
        .eq("parent_id", userId)
        .maybeSingle();

      if (error) return "/signup?step=2";
      return family ? "/parent" : "/signup?step=2";
    };

    const handleSignedIn = async (session: any) => {
      // Only redirect if user is on an auth/home page
      if (!isOnAuthPage()) return;

      const redirect = await resolvePostAuthRedirect(session.user.id);
      if (redirect === "/parent") {
        const name = session.user.user_metadata?.full_name || "Parent";
        loginAsParent(name, "My Family");
      }
      navigate(redirect, { replace: true });
    };

    // Handle initial session check (runs once)
    if (!initialSessionHandled.current) {
      initialSessionHandled.current = true;
      const checkExistingSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !localStorage.getItem(AUTH_KEY)) {
          void handleSignedIn(session);
        }
      };
      void checkExistingSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setTimeout(() => {
          void handleSignedIn(session);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loginAsParent, location.pathname]);

  return null;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
