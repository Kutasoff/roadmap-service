import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies() {
  const store = cookies();
  store.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function getAuthUser(): Promise<User | null> {
  const store = cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  const supabase = createSupabaseAdmin();

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      return data.user;
    }
  }

  if (!refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    clearAuthCookies();
    return null;
  }

  setAuthCookies(data.session.access_token, data.session.refresh_token);
  return data.user;
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
