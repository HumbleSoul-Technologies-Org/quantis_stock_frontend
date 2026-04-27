"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, business, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Check redirect logic based on user role and business status
        if (user.role === "admin" && !business) {
          router.push("/onboarding");
        } else if (user.role === "admin" && !business?.activated) {
          router.push("/product-key");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, business, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
