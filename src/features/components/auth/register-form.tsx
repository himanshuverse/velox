"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Zap,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/themeprovider";

const registerSchema = z
  .object({
    email: z.string().email("Please provide a valid email"),
    password: z.string().min(6, "Password should be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        name: values.email,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  const handleSocial = async (provider: "google" | "github") => {
    setSocialLoading(provider);

    try {
      if (authClient.signIn.social) {
        await authClient.signIn.social(
          { provider, callbackURL: "/" },
          {
            onSuccess: () => {
              toast.success("Logged in successfully!");
              router.push("/");
            },
            // onError: (ctx) => toast.error(ctx.error.message),
          }
        );
      } else {
        await new Promise((r) => setTimeout(r, 800));
        router.push("/");
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const pending = form.formState.isSubmitting || socialLoading !== null;

  return (
    <div
      className="h-screen w-full grid grid-cols-1 lg:grid-cols-[58%_42%] overflow-hidden transition-colors duration-200"
      style={{
        background: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Left 60%: Cinematic Editorial Quote & Welcome Showcase ── */}
      <div
        className="hidden lg:flex h-screen flex-col justify-between p-10 lg:p-12 relative overflow-hidden select-none"
        style={{
          background:
            "radial-gradient(ellipse at 35% 25%, #171a22 0%, #0f1218 50%, #0a0c10 100%)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Subtle Technical Grid Texture */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(217, 119, 54, 0.25) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient Warm Lighting Orbs */}
        <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-[#D97736]/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Minimal Brand Mark */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-7 h-7 bg-[#D97736] rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(217,119,54,0.35)]">
            <Zap size={15} color="#fff" fill="#fff" />
          </div>

          <span className="font-extrabold text-3xl tracking-wider uppercase text-white/90">
            Velox
          </span>
        </div>

        {/* Center: Large Italic Serif Statement & Value Props */}
        <div className="my-auto z-10 max-w-xl">
          <blockquote
            className="text-3xl xl:text-[2.65rem] font-serif italic leading-[1.3] text-white/95 font-normal tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            &ldquo;Build autonomous pipelines at the speed of thought.&rdquo;
          </blockquote>

          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <CheckCircle2 size={16} className="text-[#D97736]" />
              <span>
                Full visual DAG orchestration & sub-millisecond execution
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <CheckCircle2 size={16} className="text-[#D97736]" />
              <span>
                Multi-model reasoning agents with custom tool calling
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <CheckCircle2 size={16} className="text-[#D97736]" />
              <span>1,000 free executions every month forever</span>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="z-10 flex items-center justify-between text-xs text-white/40 font-mono">
          <span>Resilient & AI-native automation</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* ── Right 40%: Minimalist Auth Column ── */}
      <div
        className="h-screen flex flex-col justify-between px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-5 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        {/* Top Header: Back link & Theme toggle */}
        <div className="flex items-center justify-between w-full mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors hover:text-[#D97736] group"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back</span>
          </Link>

          <button
            onClick={toggle}
            type="button"
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:border-[#D97736]/50 hover:bg-[#D97736]/10 cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Center Auth Card Content */}
        <div className="my-auto w-full max-w-[360px] mx-auto py-1">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center p-0 mb-3">
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-[0.2em] uppercase mb-1">
                Get Started
              </CardTitle>

              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40 font-semibold mb-1">
                Velox Platform
              </p>

              <CardDescription className="text-xs text-[var(--text-secondary)]">
                Create your account to start building autonomous workflows.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {/* OAuth Social Buttons */}
              <div className="flex flex-col gap-2 mb-3">
                {/* Google Button */}
                <Button
                  variant="outline"
                  type="button"
                  disabled={pending}
                  onClick={() => handleSocial("google")}
                  className="w-full h-10 px-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 bg-white text-black hover:bg-slate-100 hover:scale-[1.01]"
                >
                  {socialLoading === "google" ? (
                    <span className="w-4 h-4 border-2 border-[#D97736] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.93-3.71 1.93-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}

                  <span>Continue with Google</span>
                </Button>

                {/* GitHub Button */}
                <Button
                  variant="outline"
                  type="button"
                  disabled={pending}
                  onClick={() => handleSocial("github")}
                  className="w-full h-10 px-4 rounded-xl flex items-center justify-center gap-3 border font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 hover:scale-[1.01]"
                  style={{
                    background: "var(--bg-raised)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  {socialLoading === "github" ? (
                    <span className="w-4 h-4 border-2 border-[#D97736] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4 shrink-0 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}

                  <span>Continue with GitHub</span>
                </Button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>

                <span className="relative px-3 text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface)]">
                  Or with email
                </span>
              </div>

              {/* Form */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2.5"
                >
                  <div className="grid gap-2.5">
                    {/* Email field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold text-[var(--text-secondary)]">
                            Email
                          </FormLabel>

                          <FormControl>
                            <Input
                              type="email"
                              placeholder="m@example.com"
                              className="h-10 px-4 rounded-xl text-xs sm:text-sm border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D97736]/30 focus-visible:border-[#D97736]"
                              style={{
                                background: "var(--bg-raised)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                              }}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage className="text-[11px] text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Password field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold text-[var(--text-secondary)]">
                            Password
                          </FormLabel>

                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-10 px-4 rounded-xl text-xs sm:text-sm border pr-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D97736]/30 focus-visible:border-[#D97736]"
                                style={{
                                  background: "var(--bg-raised)",
                                  borderColor: "var(--border)",
                                  color: "var(--text-primary)",
                                }}
                                {...field}
                              />
                            </FormControl>

                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(!showPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                          </div>

                          <FormMessage className="text-[11px] text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password field */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold text-[var(--text-secondary)]">
                            Confirm Password
                          </FormLabel>

                          <div className="relative">
                            <FormControl>
                              <Input
                                type={
                                  showConfirmPassword
                                    ? "text"
                                    : "password"
                                }
                                placeholder="Confirm your password"
                                className="h-10 px-4 rounded-xl text-xs sm:text-sm border pr-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D97736]/30 focus-visible:border-[#D97736]"
                                style={{
                                  background: "var(--bg-raised)",
                                  borderColor: "var(--border)",
                                  color: "var(--text-primary)",
                                }}
                                {...field}
                              />
                            </FormControl>

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(
                                  !showConfirmPassword
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                          </div>

                          <FormMessage className="text-[11px] text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={pending}
                      className="w-full h-10 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 mt-1 cursor-pointer shadow-[0_6px_20px_rgba(217,119,54,0.35)] hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
                      style={{ background: "#D97736" }}
                    >
                      {pending ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Sign up"
                      )}
                    </Button>

                    {/* Login Link */}
                    <div className="text-center text-xs mt-1 text-[var(--text-secondary)]">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-semibold text-[#D97736] hover:underline underline-offset-4"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Terms */}
        <div className="w-full text-center text-[11px] text-[var(--text-muted)] pt-1">
          By signing up, you agree to our{" "}
          <Link
            href="#"
            className="text-[#D97736]/80 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="text-[#D97736]/80 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;