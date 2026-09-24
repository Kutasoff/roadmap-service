import type { Metadata } from "next";
import { AuthCard, AuthLink } from "@/components/auth-card";
import { LoginForm } from "./login-form";
import { getAuthUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Вход",
};

export default async function LoginPage() {
  const user = await getAuthUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <AuthCard
      title="Вход"
      description="Войдите по email и паролю."
      footer={
        <>
          Нет аккаунта? <AuthLink href="/signup">Зарегистрироваться</AuthLink>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
