"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

type PasswordMode = "login" | "signup";

const COMPANY_EMAIL_DOMAIN = "seon.co.kr";

function isCompanyEmail(value: string): boolean {
  return value.trim().toLowerCase().endsWith(`@${COMPANY_EMAIL_DOMAIN}`);
}

function friendlyAuthErrorMessage(message: string): string {
  if (message.includes("signup_domain_not_allowed")) {
    return `회사 이메일(@${COMPANY_EMAIL_DOMAIN})만 가입할 수 있습니다.`;
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();

  const [passwordMode, setPasswordMode] = useState<PasswordMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading">("idle");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [magicEmail, setMagicEmail] = useState("");
  const [magicStatus, setMagicStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [magicError, setMagicError] = useState<string | null>(null);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordStatus("loading");
    setPasswordError(null);
    setPasswordMessage(null);

    if (passwordMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setPasswordError(friendlyAuthErrorMessage(error.message));
        setPasswordStatus("idle");
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    if (!isCompanyEmail(email)) {
      setPasswordError(`회사 이메일(@${COMPANY_EMAIL_DOMAIN})만 가입할 수 있습니다.`);
      setPasswordStatus("idle");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setPasswordError(friendlyAuthErrorMessage(error.message));
      setPasswordStatus("idle");
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setPasswordMessage("확인 이메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해주세요.");
    setPasswordStatus("idle");
  }

  async function handleMagicLinkSubmit(e: FormEvent) {
    e.preventDefault();
    setMagicStatus("loading");
    setMagicError(null);

    if (!isCompanyEmail(magicEmail)) {
      setMagicError(`회사 이메일(@${COMPANY_EMAIL_DOMAIN})만 가입할 수 있습니다.`);
      setMagicStatus("idle");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (error) {
      setMagicError(friendlyAuthErrorMessage(error.message));
      setMagicStatus("idle");
      return;
    }
    setMagicStatus("sent");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-[-0.96px] text-ink">
          입찰 공고 분석기
        </h1>
        <p className="mb-6 text-sm text-body">로그인하고 계속하세요.</p>

        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPasswordMode("login")}
              className={
                passwordMode === "login"
                  ? "text-sm font-medium text-ink"
                  : "text-sm font-medium text-mute hover:text-body"
              }
            >
              로그인
            </button>
            <span className="text-hairline-strong">·</span>
            <button
              type="button"
              onClick={() => setPasswordMode("signup")}
              className={
                passwordMode === "signup"
                  ? "text-sm font-medium text-ink"
                  : "text-sm font-medium text-mute hover:text-body"
              }
            >
              회원가입
            </button>
          </div>

          {passwordMode === "signup" && (
            <p className="-mt-1 text-xs text-mute">
              회사 이메일(@{COMPANY_EMAIL_DOMAIN})만 가입할 수 있습니다.
            </p>
          )}

          <form className="flex flex-col gap-3" onSubmit={handlePasswordSubmit}>
            <input
              type="email"
              required
              placeholder={passwordMode === "signup" ? `you@${COMPANY_EMAIL_DOMAIN}` : "이메일"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
            />

            {passwordError && <p className="text-sm text-error">{passwordError}</p>}
            {passwordMessage && <Badge tone="blue">{passwordMessage}</Badge>}

            <Button type="submit" disabled={passwordStatus === "loading"}>
              {passwordStatus === "loading"
                ? "처리 중…"
                : passwordMode === "login"
                  ? "로그인"
                  : "회원가입"}
            </Button>
          </form>
        </Card>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-xs text-mute">또는</span>
          <div className="h-px flex-1 bg-hairline" />
        </div>

        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-medium text-ink">매직 링크로 로그인</h2>
          <p className="text-sm text-mute">
            비밀번호 없이 이메일로 받은 링크를 눌러 로그인합니다. (회사 이메일 @{COMPANY_EMAIL_DOMAIN}만 가능)
          </p>

          {magicStatus === "sent" ? (
            <Badge tone="blue" className="self-start">
              {magicEmail}로 로그인 링크를 보냈습니다. 메일을 확인해주세요.
            </Badge>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={handleMagicLinkSubmit}>
              <input
                type="email"
                required
                placeholder="이메일"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm text-ink focus:border-link focus:outline-none focus:ring-1 focus:ring-link"
              />
              {magicError && <p className="text-sm text-error">{magicError}</p>}
              <Button type="submit" variant="secondary" disabled={magicStatus === "loading"}>
                {magicStatus === "loading" ? "전송 중…" : "로그인 링크 보내기"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
