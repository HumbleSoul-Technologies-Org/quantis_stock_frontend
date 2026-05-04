"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, Clock, Wrench } from "lucide-react";

// Newsletter signup schema
const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function MaintenancePage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/maintenance/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubscribed(true);
        reset();
      } else {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      // Handle error - could show toast or alert
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <Wrench className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Under Maintenance
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We're currently performing scheduled maintenance to improve your
            experience.
          </p>
        </div>

        {/* Status Card */}
        <Card className="border-0 dark:bg-slate-900 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Clock className="h-6 w-6 text-orange-500" />
              Estimated Return Time
            </CardTitle>
            <CardDescription className="text-lg">
              We expect to be back online within 2-4 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">System Updates</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  Performance Improvements
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  Security Enhancements
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Bug Fixes</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="border-t pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Get Notified When We're Back
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Subscribe to receive an email notification as soon as
                  maintenance is complete.
                </p>
              </div>

              {isSubscribed ? (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Thank you for subscribing! We'll notify you when we're back
                    online.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Label htmlFor="email" className="sr-only">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...register("email")}
                        className="w-full"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        "Subscribing..."
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Notify Me
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            For urgent inquiries, please contact our support team at{" "}
            <a
              href="mailto:support@stockos.com"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              support@stockos.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
