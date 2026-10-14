"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  UserCheck
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { fetchApi } from "@/lib/api";

type RoleType = "customer" | "admin";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const initialRole = (searchParams.get("role") as RoleType) || "customer";

  const [activeRole, setActiveRole] = useState<RoleType>(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up with Email + Password
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          role: "customer",
        });

        if (res.error) {
          setErrorMessage(res.error.message || "Failed to create account. Please check your inputs.");
          setLoading(false);
          return;
        }

        // If creating customer account, automatically redirect
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push(nextParam || "/");
        }, 1000);
        return;
      }

      // Sign In with Email + Password
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Check role privileges if trying to log in as admin
      if (activeRole === "admin") {
        try {
          const adminMe = await fetchApi<any>("/api/admin/me");
          if (!adminMe || !adminMe.adminId) {
            setErrorMessage("Access Denied: This account is not registered as an administrator.");
            setLoading(false);
            return;
          }
          router.push(nextParam || "/admin");
        } catch (err: any) {
          setErrorMessage(
            err.message?.includes("forbidden") || err.status === 403
              ? "Access Denied: This account does not have administrator privileges."
              : "Unable to verify administrator permissions. Please try again."
          );
          setLoading(false);
          return;
        }
      } else {
        router.push(nextParam || "/");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const callback = activeRole === "admin" 
      ? (nextParam || "/admin") 
      : (nextParam || "/");
    authClient.signIn.social({
      provider: "google",
      callbackURL: callback,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative flex flex-col justify-between overflow-hidden">
      {/* Top Header Bar */}
      <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#E6F0E4] flex items-center justify-center transition-transform group-hover:scale-105">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 3H5.2L7.3 14.5C7.4 15.1 7.9 15.5 8.5 15.5H18.5C19.1 15.5 19.6 15.1 19.7 14.5L21 7.5H6"
                stroke="#1B4D36"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="19.5" r="1.5" fill="#1B4D36" />
              <circle cx="18" cy="19.5" r="1.5" fill="#1B4D36" />
              <path
                d="M14 4.5C14 4.5 16 3 18 4C18.5 6 16.5 8 16.5 8"
                stroke="#2E7D32"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 6L13.5 8"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-[22px] font-bold tracking-tight text-[#14231B]">
            Smart<span className="text-[#207B4A]">Mart</span>
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#14231B] hover:text-[#207B4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Decorative Grocery Bag on Bottom-Right */}
      <div className="absolute right-0 bottom-0 pointer-events-none hidden lg:block select-none z-0">
        <div className="relative w-[380px] h-[480px]">
          <div className="absolute right-[-40px] top-[40px] w-80 h-80 rounded-full bg-[#E5EFE2]/70 blur-2xl" />
          <img
            src="/images/hero-groceries.jpg"
            alt="Fresh grocery bag"
            className="w-full h-full object-cover object-left-bottom rounded-tl-[120px] shadow-2xl opacity-90 border-l-4 border-t-4 border-[#FAF7F2]"
          />
        </div>
      </div>

      {/* Decorative Mint Circle on Bottom-Left */}
      <div className="absolute -left-28 -bottom-28 w-96 h-96 rounded-full bg-[#E8F3E5]/60 pointer-events-none z-0" />

      {/* Main Content: Centered Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[460px] bg-white rounded-[32px] border border-[#EBE4D6] shadow-sm p-8 sm:p-10 space-y-6">
          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14231B] tracking-tight">
              {isSignUp ? "Create an Account" : "Welcome to SmartMart"}
            </h1>
            <p className="text-xs sm:text-sm text-[#66766B]">
              {isSignUp
                ? "Sign up to start ordering fresh groceries"
                : "Login to continue as a customer or admin."}
            </p>
          </div>

          {/* Role Toggle Selector (Only relevant when logging in) */}
          {!isSignUp && (
            <div className="p-1.5 bg-[#FAF7F2] border border-[#EBE4D6] rounded-2xl flex items-center gap-1.5">
              {/* Customer Pill */}
              <button
                type="button"
                onClick={() => {
                  setActiveRole("customer");
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  activeRole === "customer"
                    ? "bg-[#E6F3E6] border border-[#CDE5CE] shadow-2xs"
                    : "hover:bg-white/60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    activeRole === "customer" ? "bg-white text-[#207B4A]" : "text-[#7D8F82]"
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14231B] leading-tight">Customer</p>
                  <p className="text-[10px] text-[#7D8F82] truncate">Shop and place orders</p>
                </div>
              </button>

              {/* Admin Pill */}
              <button
                type="button"
                onClick={() => {
                  setActiveRole("admin");
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  activeRole === "admin"
                    ? "bg-[#E6F3E6] border border-[#CDE5CE] shadow-2xs"
                    : "hover:bg-white/60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    activeRole === "admin" ? "bg-white text-[#207B4A]" : "text-[#7D8F82]"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14231B] leading-tight">Admin</p>
                  <p className="text-[10px] text-[#7D8F82] truncate">Manage store operations</p>
                </div>
              </button>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-[#E6F3E6] border border-[#CDE5CE] rounded-2xl text-xs text-[#207B4A]">
              <UserCheck className="w-4 h-4 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#FDEEEE] border border-[#F5C2C2] rounded-2xl text-xs text-[#C52B2B]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#14231B]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C9C91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FCFAF7] border border-[#EAE2D4] rounded-2xl text-xs sm:text-sm text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#14231B]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C9C91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FCFAF7] border border-[#EAE2D4] rounded-2xl text-xs sm:text-sm text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#14231B]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C9C91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Choose password (min 8 chars)" : "Enter your password"}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FCFAF7] border border-[#EAE2D4] rounded-2xl text-xs sm:text-sm text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9C91] hover:text-[#14231B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password (Sign In only) */}
            {!isSignUp && (
              <div className="flex justify-end pt-0.5">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please sign in with Google or contact admin support.");
                  }}
                  className="text-xs font-semibold text-[#207B4A] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#207B4A] hover:bg-[#18643B] disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {loading ? (
                <span>{isSignUp ? "Creating Account..." : "Signing in..."}</span>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Login"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="border-t border-[#EAE2D4] w-full" />
              <span className="bg-white px-3 text-[11px] text-[#8C9C91] uppercase tracking-wider absolute">
                or
              </span>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 bg-white border border-[#EAE2D4] hover:border-stone-400 hover:bg-[#FAF7F2] text-xs font-bold text-[#14231B] rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
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
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Toggle between Login and Create Account */}
          <p className="text-center text-xs text-[#66766B]">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#207B4A] hover:underline"
                >
                  Log In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#207B4A] hover:underline"
                >
                  Create Account
                </button>
              </>
            )}
          </p>
        </div>
      </main>

      <footer className="py-4 z-10" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-stone-500 font-medium">
          Loading login...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
