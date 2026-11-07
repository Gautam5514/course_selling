"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";

const AuthContext = createContext(null);

/**
 * Session state for the whole app. The backend keeps the JWT in an httpOnly
 * cookie, so the browser never sees the token: we just ask /api/auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // false when the last session check could not reach the backend at all.
  const [backendReachable, setBackendReachable] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.me();
      setUser(data.user);
      setBackendReachable(true);
      return data.user;
    } catch (err) {
      const notSignedIn = err instanceof ApiError && err.status === 401;
      setBackendReachable(notSignedIn || !(err instanceof ApiError && (err.isNetwork || err.status >= 500)));
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial session check. setState only runs inside the promise callbacks.
  useEffect(() => {
    let active = true;
    api
      .me()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        setBackendReachable(true);
      })
      .catch((err) => {
        if (!active) return;
        const notSignedIn = err instanceof ApiError && err.status === 401;
        setBackendReachable(notSignedIn || !(err instanceof ApiError && (err.isNetwork || err.status >= 500)));
        setUser(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.login(email, password);
    setUser(data.user);
    setBackendReachable(true);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.register(name, email, password);
    setUser(data.user);
    setBackendReachable(true);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, backendReachable, isAuthenticated: Boolean(user), login, register, logout, refresh }),
    [user, loading, backendReachable, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Build the login URL that returns the user to `path` after signing in. */
export function loginHref(path) {
  const safe = typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/login") ? path : "/";
  return `/login?next=${encodeURIComponent(safe)}`;
}
