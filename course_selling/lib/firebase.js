"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

/**
 * Firebase is used only for the Google sign-in popup. The resulting ID token
 * is sent to our backend, which creates the real session cookie.
 * Config comes from NEXT_PUBLIC_FIREBASE_* (Firebase console → Project settings → Your apps → Web).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const googleSignInEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

function app() {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export class GoogleSignInCancelled extends Error {
  constructor() {
    super("Google sign-in was cancelled.");
    this.name = "GoogleSignInCancelled";
  }
}

/** Open the Google popup and return a Firebase ID token for our backend. */
export async function getGoogleIdToken() {
  if (!googleSignInEnabled) throw new Error("Google sign-in is not configured.");
  const auth = getAuth(app());
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();
    // Firebase's own session is not needed once our cookie exists.
    signOut(auth).catch(() => {});
    return token;
  } catch (err) {
    const code = err?.code || "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request" || code === "auth/user-cancelled") throw new GoogleSignInCancelled();
    if (code === "auth/popup-blocked") throw new Error("Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.");
    if (code === "auth/unauthorized-domain") throw new Error("This website is not yet authorised for Google sign-in. (Add the domain in Firebase → Authentication → Settings → Authorized domains.)");
    if (code === "auth/network-request-failed") throw new Error("We couldn't reach Google. Check your connection and try again.");
    throw new Error("Google sign-in didn't go through. Please try again.");
  }
}
