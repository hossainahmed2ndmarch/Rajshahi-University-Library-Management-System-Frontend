import { createAuthClient } from "better-auth/react";
import { phoneNumberClient, jwtClient } from "better-auth/client/plugins";

const getBaseAuthURL = (): string => {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    return apiBase.replace(/\/api\/v1\/?$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
};

export const authClient = createAuthClient({
  baseURL: getBaseAuthURL(),
  basePath: "/api/auth",
  plugins: [
    phoneNumberClient(),
    jwtClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

export default authClient;
