"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError, hasSessionToken } from "@/lib/api";

const AuthContext = createContext(null);

/**
 * Session state for the whole app. The backend keeps the JWT in an httpOnly
 * cookie, so the browser never sees the token: we just ask /api/auth/me.
 */
const USER_KEY = "course_user";
function readCachedUser() {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}
function writeCachedUser(user) {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    /* storage blocked */
  }
}

export function AuthProvider({ children }) {
  // Never block the UI on the backend: render "logged out" instantly (so the
  // Login button is always visible), hydrate from the cached user right after
  // mount, then confirm with /api/auth/me in the background.
  const [user, setUserState] = useState(null);
  const [loading] = useState(false);
  // `ready` flips to true once we know who is (probably) asking: right after
  // the saved session is read, or, when there is a token but no saved user,
  // after the first session check. Guards (members-only pages) must wait for
  // it, otherwise a signed-in member is bounced through /login on every load.
  const [ready, setReady] = useState(false);
  // false when the last session check could not reach the backend at all.
  const [backendReachable, setBackendReachable] = useState(true);

  const setUser = useCallback((u) => {
    setUserState(u);
    writeCachedUser(u);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.me();
      setUser(data.user);
      setBackendReachable(true);
      return data.user;
    } catch (err) {
      const notSignedIn = err instanceof ApiError && err.status === 401;
      const unreachable = !notSignedIn && err instanceof ApiError && (err.isNetwork || err.status >= 500);
      setBackendReachable(!unreachable);
      // Only a real 401 signs the user out; a sleeping backend keeps the cached session.
      if (notSignedIn) setUser(null);
      return unreachable ? "retry" : null;
    }
  }, [setUser]);

  // Initial session check with background retries while the backend wakes up.
  useEffect(() => {
    let active = true;
    const cached = readCachedUser();
    (async () => {
      if (cached && active) setUserState(cached);
      const mustConfirm = !cached && hasSessionToken();
      if (!mustConfirm && active) setReady(true);
      for (let attempt = 0; attempt < 4 && active; attempt++) {
        const r = await refresh();
        if (active) setReady(true);
        if (r !== "retry") break;
        await new Promise((res) => setTimeout(res, 1500 * 2 ** attempt));
      }
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.login(email, password);
    setUser(data.user);
    setBackendReachable(true);
    return data.user;
  }, [setUser]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.register(name, email, password);
    setUser(data.user);
    setBackendReachable(true);
    return data.user;
  }, [setUser]);

  /** Google popup → backend session. Returns { user, created }. */
  const loginWithGoogle = useCallback(async () => {
    const { getGoogleIdToken } = await import("@/lib/firebase"); // lazy: keeps firebase out of the main bundle
    const idToken = await getGoogleIdToken();
    const { data } = await api.googleLogin(idToken);
    setUser(data.user);
    setBackendReachable(true);
    return data;
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const value = useMemo(
    () => ({ user, loading, ready, backendReachable, isAuthenticated: Boolean(user), login, register, loginWithGoogle, logout, refresh }),
    [user, loading, ready, backendReachable, login, register, loginWithGoogle, logout, refresh]
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
