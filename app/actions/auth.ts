"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase";
import { clearAuthCookies, setAuthCookies } from "@/lib/session";
import { slugify } from "@/lib/slug";

export type AuthFormState = {
  error: string | null;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return fallback;
}

async function uniqueOrganizationSlug(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  base: string
) {
  let slug = base;
  let suffix = 2;

  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

async function establishSession(email: string, password: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Не удалось создать сессию");
  }

  setAuthCookies(data.session.access_token, data.session.refresh_token);
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const companyName = readString(formData, "companyName");
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!companyName) {
    return { error: "Укажите название компании" };
  }

  if (!email) {
    return { error: "Укажите email" };
  }

  if (password.length < 6) {
    return { error: "Пароль должен быть не короче 6 символов" };
  }

  const supabase = createSupabaseAdmin();
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return {
      error: createError?.message ?? "Не удалось зарегистрировать пользователя",
    };
  }

  const userId = created.user.id;
  let organizationId: string | undefined;

  try {
    const slug = await uniqueOrganizationSlug(supabase, slugify(companyName));

    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: companyName, slug })
      .select("id")
      .single();

    if (orgError || !organization) {
      throw orgError ?? new Error("Не удалось создать организацию");
    }

    organizationId = organization.id;

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      org_id: organization.id,
      role: "owner",
      email,
    });

    if (userError) {
      throw userError;
    }

    const { error: boardError } = await supabase.from("boards").insert({
      org_id: organization.id,
      name: "Feature Requests",
      slug: "feedback",
    });

    if (boardError) {
      throw boardError;
    }
  } catch (error) {
    if (organizationId) {
      await supabase.from("boards").delete().eq("org_id", organizationId);
      await supabase.from("users").delete().eq("org_id", organizationId);
      await supabase.from("organizations").delete().eq("id", organizationId);
    }
    await supabase.auth.admin.deleteUser(userId);
    return { error: toErrorMessage(error, "Ошибка при создании аккаунта") };
  }

  try {
    await establishSession(email, password);
  } catch (error) {
    return {
      error: toErrorMessage(error, "Регистрация прошла, но вход не удался"),
    };
  }

  redirect("/admin");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!email || !password) {
    return { error: "Укажите email и пароль" };
  }

  try {
    await establishSession(email, password);
  } catch (error) {
    return { error: toErrorMessage(error, "Неверный email или пароль") };
  }

  redirect("/admin");
}

export async function signOut() {
  clearAuthCookies();
  redirect("/login");
}
