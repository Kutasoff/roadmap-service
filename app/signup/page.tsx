import type { Metadata } from "next";
import { AuthCard, AuthLink } from "@/components/auth-card";
import { SignupForm } from "./signup-form";
import { getAuthUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Регистрация",
};

export default async function SignupPage() {
  const user = await getAuthUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <AuthCard
      title="Регистрация"
      description="Создайте аккаунт компании. После регистрации откроется админка."
      footer={
        <>
          Уже есть аккаунт? <AuthLink href="/login">Войти</AuthLink>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
