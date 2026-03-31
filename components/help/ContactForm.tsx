"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Send } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "bug-report", label: "Bug Report" },
    { value: "feature-request", label: "Feature Request" },
    { value: "general", label: "General Question" },
    { value: "support", label: "Technical Support" },
    { value: "feedback", label: "Feedback" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.subject?.trim()) newErrors.subject = "Subject is required";
    if (!formData.message?.trim()) newErrors.message = "Message is required";
    if ((formData.message?.trim().length || 0) < 10)
      newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (!validateForm()) return;

      // Simulate sending to developer
      console.log("Support request:", formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          category: "general",
          subject: "",
          message: "",
        });
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      console.error("Error sending message:", error);
      setErrors({ general: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Contact Developer Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-teal-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-center">
              Your message has been sent to our development team. We will get
              back to you as soon as possible.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-4">
              You will receive a response at:{" "}
              <strong className="dark:text-slate-300">{formData.email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  className={`dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 ${errors.name ? "border-red-500" : "border-green-200 dark:border-teal-700"}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className={`dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 ${errors.email ? "border-red-500" : "border-green-200 dark:border-teal-700"}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-green-200 dark:border-teal-700 rounded-md text-sm dark:bg-slate-700 dark:text-slate-100"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue or request"
                  className={`dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 ${errors.subject ? "border-red-500" : "border-green-200 dark:border-teal-700"}`}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Provide detailed information about your issue or request..."
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 ${
                    errors.message
                      ? "border-red-500"
                      : "border-green-200 dark:border-teal-700"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-800 dark:text-blue-300 flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Our support team typically responds within 24-48 hours during
                business days.
              </p>
            </div>

            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2 w-full"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
