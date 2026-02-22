import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authAPI } from "./api";

interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token")
  );
  const [adminName, setAdminName] = useState<string | null>(() =>
    localStorage.getItem("admin_name")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { token: jwt, name: responseName } = res.data;
      localStorage.setItem("auth_token", jwt);
      setToken(jwt);
      // Use name from response first, then try JWT decode, fallback to email
      let displayName = responseName;
      if (!displayName) {
        try {
          const payload = JSON.parse(atob(jwt.split(".")[1]));
          displayName = payload.name || payload.email || email;
        } catch {
          displayName = email;
        }
      }
      localStorage.setItem("admin_name", displayName);
      setAdminName(displayName);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed. Check credentials.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        await authAPI.register({ name, email, password });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Registration failed.";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_name");
    setToken(null);
    setAdminName(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("auth_token"));
      setAdminName(localStorage.getItem("admin_name"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminName,
        token,
        login,
        register,
        logout,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
