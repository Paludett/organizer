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
    <div className="flex flex-1 items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 p-8"
      >
        <h1 className="text-xl font-semibold">Entrar</h1>
        {status === "sent" ? (
          <p className="text-sm text-zinc-600">
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
              className="rounded border border-zinc-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
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
  );
}
