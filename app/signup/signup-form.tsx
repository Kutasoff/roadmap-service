"use client";

import { useFormState } from "react-dom";
import { signUp, type AuthFormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

const initialState: AuthFormState = { error: null };

export function SignupForm() {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Название компании</span>
        <input
          name="companyName"
          type="text"
          required
          autoComplete="organization"
          className="h-11 rounded-lg border border-black/[.08] bg-transparent px-3 outline-none ring-foreground/20 focus:ring-2 dark:border-white/[.145]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 rounded-lg border border-black/[.08] bg-transparent px-3 outline-none ring-foreground/20 focus:ring-2 dark:border-white/[.145]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Пароль</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 rounded-lg border border-black/[.08] bg-transparent px-3 outline-none ring-foreground/20 focus:ring-2 dark:border-white/[.145]"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton>Зарегистрироваться</SubmitButton>
    </form>
  );
}
