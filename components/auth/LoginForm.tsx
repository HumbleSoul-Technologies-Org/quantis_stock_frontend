"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AuthLayout, AuthCard, AuthButton, AuthInput } from "./AuthComponents";
import { loginSchema, type LoginFormData } from "@/lib/validations/authSchemas";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithApiData, updateBusiness, updateBusinessSetup } = useAuth();
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
        username: data.username,
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
      const userData = {
        id: responseData.user._id || responseData.user.id,
        username: responseData.user.username,
        role: responseData.user.role,
        businessId: responseData.user.businessId, // Critical: get businessId from response
        business: responseData.user.business, // For backward compatibility
        token: responseData.token,
      };

      // Update auth context with API user data
      loginWithApiData(userData);

      // Update business setup in context if provided (for backward compatibility)
      if (responseData.user.business) {
        updateBusiness(responseData.user.business);
        updateBusinessSetup(responseData.user.business);
      }

      // Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username}!`,
      });

      // Determine redirect based on whether user has business set up
      // If user has businessId or business data, they're ready for dashboard
      // If not, they need to complete onboarding
      if (userData.businessId || responseData.user.business) {
        router.push("/dashboard");
      } else {
        // User needs to complete business setup
        router.push("/onboarding");
      }
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
    <AuthLayout logoColor="green">
      <AuthCard title="Welcome Back" subtitle="Sign in to your account">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AuthInput
            label="Username"
            type="text"
            {...register("username")}
            placeholder="Enter your username"
            error={errors.username?.message}
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

          <AuthButton
            isLoading={isLoading}
            loadingText="Signing in..."
            variant="green"
          >
            Sign In
          </AuthButton>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <a
              href="/auth/register"
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold hover:underline transition-colors duration-200"
            >
              Create one
            </a>
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          <strong className="font-semibold">💡 Tip:</strong> Use your registered
          username and password to log in.
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
