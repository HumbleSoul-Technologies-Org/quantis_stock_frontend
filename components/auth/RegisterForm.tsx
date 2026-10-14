"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { clearUserSession } from "@/lib/authStorage";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  X,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest, extractApiErrorMessage } from "@/lib/queryClient";
import { normalizeAuthUser } from "@/lib/authUser";
import { Button } from "@/components/ui/button";
import { AuthLayout, AuthCard, AuthButton, AuthInput } from "./AuthComponents";
import {
  registerSchema,
  type RegisterFormData,
} from "@/lib/validations/authSchemas";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [viewingLegal, setViewingLegal] = useState<"privacy" | "terms" | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loginWithApiData, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSuccess("");
    setIsLoading(true);

    try {
      // Create new admin user
      const payload = {
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        role: "admin",
        tAndC: data.acceptLegal,
        privacyPolicy: data.acceptLegal,
      };

      const res = await apiRequest("POST", "/users/register", payload);

      if (!res.ok) {
        const errorMessage = extractApiErrorMessage(res);
        const normalizedError = errorMessage.toLowerCase();

        if (res.status === 409) {
          if (normalizedError.includes("email")) {
            setError("email", { message: errorMessage });
          } else if (normalizedError.includes("username")) {
            setError("username", { message: errorMessage });
          } else {
            setError("root", { message: errorMessage });
          }
        } else if (res.status >= 500) {
          const genericError =
            "Unable to create account. Please try again later.";
          setError("root", { message: genericError });
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: genericError,
          });
          setIsLoading(false);
          return;
        } else {
          setError("root", { message: errorMessage });
        }

        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      const responseData = await res.json();
      const newUser = normalizeAuthUser(
        responseData.user,
        responseData.token,
      );

      setSuccess("Account created successfully! Redirecting...");

      // Show success toast
      toast({
        title: "Account Created",
        description:
          "Your account has been created successfully. Redirecting...",
      });

      // Auto-login after creation
      loginWithApiData(newUser);
      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setError("root", { message: errorMessage });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const restartRegistration = async () => {
    try {
      await apiRequest(
        "POST",
        `/users/${user?.id}/restart-registration`,
        {},
        user?.token,
      );
      // Clear the current auth session and redirect to registration page
      clearUserSession();
      router.push("/auth/register");
    } catch (error) {
      console.error("Restart registration failed:", error);
      setError("root", {
        message: "Unable to restart registration. Please try again later.",
      });
    }
  };

  return (
    <AuthLayout
      logoColor="blue"
      leftPanel={
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/70">
                Launch faster
              </p>
              <h1 className="max-w-md text-3xl font-semibold leading-tight text-white">
                Set up your business and start managing operations with confidence.
              </h1>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-100/80">
              Create your admin workspace and bring together stock management,
              sales visibility, and daily operations in minutes.
            </p>
          </div>

          <div className="space-y-3 text-sm text-white/90">
            {[
              "Inventory and supplier visibility",
              "Branch-ready team access",
              "Secure onboarding for your admin team",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/15 bg-slate-950/15 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-white/75">
              <span className="text-xs uppercase tracking-[0.24em]">
                onboarding
              </span>
              <span className="rounded-full bg-sky-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100">
                ready
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-white">
              <div>
                <p className="text-2xl font-semibold">3 min</p>
                <p className="text-xs text-slate-200/80">setup</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">1</p>
                <p className="text-xs text-slate-200/80">admin account</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AuthCard
        title="Create account"
        subtitle="Set up your admin account and start managing your business"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Error */}
          {errors.root && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-5">
            <AuthInput
              label="Username"
              type="text"
              {...register("username")}
              placeholder="Enter username"
              error={errors.username?.message}
              disabled={isLoading}
              focusColor="blue"
            />

            <AuthInput
              label="Email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              error={errors.email?.message}
              disabled={isLoading}
              focusColor="blue"
            />

            <AuthInput
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter password (min 8 characters)"
              error={errors.password?.message}
              disabled={isLoading}
              focusColor="blue"
              trailingIcon={
                showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )
              }
              onIconClick={() => setShowPassword((prev) => !prev)}
            />

            <AuthInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm password"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              focusColor="blue"
              trailingIcon={
                showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )
              }
              onIconClick={() => setShowConfirmPassword((prev) => !prev)}
            />
          </div>

          {/* Legal Error */}
          {errors.acceptLegal && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{errors.acceptLegal.message}</span>
            </div>
          )}

          {/* Legal Agreement Checkbox */}
          <div className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 dark:border-slate-600 dark:bg-slate-700 dark:hover:border-blue-500">
            <input
              type="checkbox"
              id="acceptLegal"
              {...register("acceptLegal")}
              disabled={isLoading}
              className="mt-1 h-4 w-4 cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <label
              htmlFor="acceptLegal"
              className="flex-1 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              I accept the{" "}
              <button
                type="button"
                onClick={() => setViewingLegal("privacy")}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setViewingLegal("terms")}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Terms & Conditions
                <ExternalLink className="h-3 w-3" />
              </button>
            </label>
          </div>

          <AuthButton
            isLoading={isLoading}
            loadingText="Creating Account..."
            variant="blue"
          >
            Create Admin Account
          </AuthButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Login here
            </a>
          </p>
        </div>

        <div
          onClick={restartRegistration}
          className="mt-4 cursor-pointer text-center"
        >
          <span className="text-sm text-blue-600 underline transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Click here to restart the registration process if issues persist
          </span>
        </div>
      </AuthCard>

      {/* Legal Document Modal */}
      {viewingLegal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="mt-5 mb-5 flex h-screen w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {viewingLegal === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"}
              </h2>
              <button
                onClick={() => setViewingLegal(null)}
                className="rounded-xl p-2 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content - IFrame */}
            <iframe
              src={
                viewingLegal === "privacy"
                  ? "/legal/privacy-policy"
                  : "/legal/terms-conditions"
              }
              className="w-full flex-1"
              title={
                viewingLegal === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"
              }
            />

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingLegal(null)}
                className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Back to Registration
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl"
                onClick={() => setViewingLegal(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
