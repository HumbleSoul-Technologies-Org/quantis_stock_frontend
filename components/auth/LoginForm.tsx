"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { normalizeAuthUser } from "@/lib/authUser";
import { getAuthLandingPath } from "@/lib/accessRouting";
import { AuthLayout, AuthCard, AuthButton, AuthInput } from "./AuthComponents";
import { loginSchema, type LoginFormData } from "@/lib/validations/authSchemas";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithApiData, updateBusiness } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/users/login", {
        identifier: data.identifier,
        password: data.password,
      });

      const responseData = await res.json();

      if (!res.ok) {
        const errorMsg = responseData.message || "Login failed";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMsg,
        });
        return;
      }

      // Extract user data from backend response
      const userData = normalizeAuthUser(responseData.user, responseData.token);

      // Update auth context with API user data
      loginWithApiData(userData);

      // Update business setup in context if provided (for backward compatibility)
      if (responseData.user.business) {
        updateBusiness(responseData.user.business);
      }

      // Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username}!`,
      });

      router.replace(getAuthLandingPath(userData));
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      logoColor="green"
      leftPanel={
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="space-y-7">
            

            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/70">
                Business Suite
              </p>
              <h1 className="max-w-md text-3xl font-semibold leading-tight text-white">
                Run your stock, sales, and operations from one secure workspace.
              </h1>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-100/80">
              Manage inventory, suppliers, and reporting with a clear view of
              your entire operation from one place.
            </p>
          </div>

          <div className="space-y-3 text-sm text-white/90">
            {[
              "Real-time stock visibility",
              "Branch-ready operations",
              "Secure admin access",
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
                System status
              </span>
              <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                online
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-white">
              <div>
                <p className="text-2xl font-semibold">99.9%</p>
                <p className="text-xs text-slate-200/80">uptime</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">24/7</p>
                <p className="text-xs text-slate-200/80">visibility</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AuthCard title="Welcome back" subtitle="Sign in to continue to your workspace">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <AuthInput
              label="Username or Email"
              type="text"
              {...register("identifier")}
              placeholder="Enter your username or email"
              error={errors.identifier?.message}
              focusColor="green"
            />

            <AuthInput
              label="Password"
              type="password"
              {...register("password")}
              placeholder="Enter your password"
              error={errors.password?.message}
              focusColor="green"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
              Forgot password?
            </a>
          </div>

          <AuthButton
            isLoading={isLoading}
            loadingText="Signing in..."
            variant="green"
          >
            Sign In
          </AuthButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/register"
              className="font-semibold text-green-600 transition-colors duration-200 hover:text-green-800 hover:underline dark:text-green-400 dark:hover:text-green-300"
            >
              Create one
            </a>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-6 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <strong className="font-semibold">💡 Tip:</strong> Use your registered
          username and password to log in.
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
