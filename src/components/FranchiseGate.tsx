"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const NAVY = "#0D1B2A";
const GOLD = "#F5A623";

interface Props {
  personKey: string;
  passwordHash: string;
  children: React.ReactNode;
}

async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function FranchiseGate({ personKey, passwordHash, children }: Props) {
  const storageKey = `franchiseAuth_${personKey}`;
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true") {
      setAuthed(true);
    }
    setChecking(false);
  }, [storageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");

    const salted = `cship-v1:${personKey}:${password}`;
    const hash = await sha256Hex(salted);

    if (hash === passwordHash) {
      sessionStorage.setItem(storageKey, "true");
      setAuthed(true);
    } else {
      setError("Incorrect password. Please try again.");
      setShaking(true);
      setPassword("");
      setTimeout(() => {
        setShaking(false);
        inputRef.current?.focus();
      }, 600);
    }

    setLoading(false);
  };

  if (checking) return null;
  if (authed) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100vh", background: NAVY,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Arial, Helvetica, sans-serif", padding: "24px",
    }}>
      <div style={{ marginBottom: 40 }}>
        <Image
          src="/logo-nav.png"
          alt="CODEship Academy"
          width={160}
          height={160}
          style={{ height: 80, width: "auto", objectFit: "contain" }}
          priority
        />
      </div>

      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16, padding: "44px 48px", maxWidth: 400, width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>
            Private — Invitation Only
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.3 }}>
            Franchise Opportunity Kit
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 10, lineHeight: 1.6 }}>
            Enter the access password to view your personalized franchise proposal.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={shaking ? "shake" : ""} style={{ marginBottom: 16 }}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 10,
                border: `2px solid ${error ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                background: "rgba(255,255,255,0.07)", color: "#ffffff",
                fontSize: 15, fontWeight: 600, outline: "none",
                boxSizing: "border-box", letterSpacing: 2,
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#f87171", fontSize: 12, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: loading || !password.trim() ? "rgba(245,166,35,0.5)" : GOLD,
              color: NAVY, fontSize: 14, fontWeight: 900,
              cursor: loading || !password.trim() ? "not-allowed" : "pointer",
              letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s",
            }}
          >
            {loading ? "Verifying…" : "Access Kit →"}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 36, textAlign: "center" }}>
        codeshipacademy.com/franchise
      </p>
    </div>
  );
}
