"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionStore } from "@/stores/session";
import { ArrowRight, Skull } from "@phosphor-icons/react";

export function OfficeCodeScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createSession = useSessionStore((s) => s.createSession);
  const loading = useSessionStore((s) => s.loading);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (loading) return;
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) {
      setError("type the damn code");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    try {
      await createSession(trimmed);
    } catch (err) {
      setError("server didn't buy it");
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-accent border-2 border-black shadow-chunky-sm flex items-center justify-center">
            <Skull size={24} weight="fill" className="text-black" />
          </div>
          <div>
            <div className="text-2xl font-bold uppercase tracking-tight">
              chaos chat
            </div>
            <div className="font-mono text-2xs uppercase tracking-widest text-ink-muted">
              anonymous office hell
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border-2 border-black shadow-chunky p-6 sm:p-8">
          <div className="font-mono text-2xs uppercase tracking-[0.3em] text-accent mb-3">
            [ private access ]
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase leading-none mb-2">
            join the chaos
          </h1>
          <p className="text-ink-muted text-sm mb-6">
            type the office code. no accounts. no names. just vibes.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label
                htmlFor="office-code"
                className="block font-mono text-2xs uppercase tracking-wider text-ink-dim mb-2"
              >
                office code
              </label>
              <Input
                id="office-code"
                ref={inputRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="________________"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={loading}
              />
              {error && (
                <div className="mt-2 font-mono text-2xs uppercase text-danger tracking-wider">
                  ! {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "loading..." : "enter"}
              {!loading && <ArrowRight size={16} weight="bold" />}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
