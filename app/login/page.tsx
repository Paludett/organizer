"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await sendMagicLink(email);
      if (result.error) {
        setErrorMsg(result.error);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Organizer</h1>
        <p className="mt-1 text-sm text-muted">Entre com seu email para continuar</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {status === "sent" ? (
            <p className="text-sm text-muted">
              Link enviado. Confira seu email.
            </p>
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Enviando..." : "Enviar link mágico"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
