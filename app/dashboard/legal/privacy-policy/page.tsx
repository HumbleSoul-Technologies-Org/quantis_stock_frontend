"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link href="/auth/register">
            <Button
              variant="outline"
              className="mb-6 dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-teal-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Last updated: March 31, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8 border-teal-200 dark:bg-slate-800 dark:border-teal-700">
          <CardHeader>
            <CardTitle className="dark:text-teal-100">
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#introduction"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  1. Introduction
                </a>
              </li>
              <li>
                <a
                  href="#information-we-collect"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  2. Information We Collect
                </a>
              </li>
              <li>
                <a
                  href="#how-we-use"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  3. How We Use Your Information
                </a>
              </li>
              <li>
                <a
                  href="#data-security"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  4. Data Security
                </a>
              </li>
              <li>
                <a
                  href="#data-sharing"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  5. Data Sharing & Third Parties
                </a>
              </li>
              <li>
                <a
                  href="#your-rights"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  6. Your Rights & Controls
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  7. Cookies & Tracking
                </a>
              </li>
              <li>
                <a
                  href="#data-retention"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  8. Data Retention
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  9. Contact Us
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <div className="prose dark:prose-invert max-w-none space-y-6">
          {/* Introduction */}
          <section id="introduction">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              StockOS ("Company," "we," "us," "our," or "Platform") is committed
              to protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              visit our website and use our inventory management system.
            </p>
            <p className="text-gray-700 dark:text-slate-300">
              Please read this Privacy Policy carefully. If you do not agree
              with our policies and practices, please do not use our Platform.
              By accessing and using StockOS, you acknowledge that you have
              read, understood, and agree to be bound by all the terms of this
              Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address,
                password, company name, business type
              </li>
              <li>
                <strong>Business Data:</strong> Product information, inventory
                levels, sales records, supplier details
              </li>
              <li>
                <strong>Communication Data:</strong> Messages, support tickets,
                feedback, and inquiries
              </li>
              <li>
                <strong>Payment Information:</strong> Billing address and
                transaction history (processed securely)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Device Information:</strong> Browser type, IP address,
                device identifiers, operating system
              </li>
              <li>
                <strong>Usage Information:</strong> Pages visited, features
                accessed, time spent, search queries
              </li>
              <li>
                <strong>Location Data:</strong> General location based on IP
                address (not GPS tracking)
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> Session data, preferences,
                authentication tokens
              </li>
            </ul>
          </section>

          {/* How We Use */}
          <section id="how-we-use">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>To provide, maintain, and improve the StockOS platform</li>
              <li>To process transactions and send related information</li>
              <li>
                To send administrative, promotional, and informational emails
              </li>
              <li>
                To respond to your inquiries and customer support requests
              </li>
              <li>To monitor and analyze platform usage and performance</li>
              <li>To detect, investigate, and prevent fraudulent activities</li>
              <li>To comply with legal obligations and enforce agreements</li>
              <li>To personalize your experience and recommendations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section id="data-security">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              4. Data Security
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We implement comprehensive security measures to protect your
              personal information from unauthorized access, alteration,
              disclosure, or destruction:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>SSL/TLS encryption for all data transmissions</li>
              <li>Secure password hashing and authentication protocols</li>
              <li>Role-based access control and permission systems</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Secure local storage with browser protection mechanisms</li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4 italic">
              Note: While we strive to protect your information, no method of
              transmission over the Internet is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </section>

          {/* Data Sharing */}
          <section id="data-sharing">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              5. Data Sharing & Third Parties
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We do not sell, trade, or rent your personal information to third
              parties. However, we may share your data in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Service Providers:</strong> Third parties who assist
                with platform operations (hosting, analytics)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or
                legal process
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of merger,
                acquisition, or asset sale
              </li>
              <li>
                <strong>With Your Consent:</strong> For specific purposes with
                your explicit permission
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section id="your-rights">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              6. Your Rights & Controls
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of all personal data we
                hold
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                associated data
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from promotional
                communications
              </li>
              <li>
                <strong>Data Portability:</strong> Export your data in
                machine-readable format
              </li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@stockos.com"
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                privacy@stockos.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              7. Cookies & Tracking
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              StockOS uses cookies and similar technologies to enhance your
              experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for platform
                functionality and security
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings and
                preferences
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how you
                use the platform
              </li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              You can control cookie preferences through your browser settings.
              Disabling essential cookies may affect platform functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section id="data-retention">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              8. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We retain your personal information for as long as necessary to
              provide services and fulfill the purposes outlined in this Privacy
              Policy. You can delete your account and data at any time from your
              account settings. Some information may be retained for legal or
              compliance reasons.
            </p>
          </section>

          {/* Contact */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              9. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
              <p className="text-gray-900 dark:text-teal-100">
                <strong>StockOS Privacy Team</strong>
              </p>
              <p className="text-gray-700 dark:text-slate-300">
                Email:{" "}
                <a
                  href="mailto:privacy@stockos.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  privacy@stockos.com
                </a>
              </p>
              <p className="text-gray-700 dark:text-slate-300">
                Email:{" "}
                <a
                  href="mailto:support@stockos.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  support@stockos.com
                </a>
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Changes to This Privacy Policy
            </h3>
            <p className="text-gray-700 dark:text-slate-300">
              We may update this Privacy Policy periodically to reflect changes
              in our practices or applicable laws. We will notify you of
              significant changes via email or a prominent notice on the
              Platform. Your continued use of StockOS after changes constitutes
              your acceptance of the updated Privacy Policy.
            </p>
          </section>
        </div>

        {/* Back to Registration */}
        <div className="mt-12 flex justify-center">
          <Link href="/auth/register">
            <Button className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700">
              Back to Registration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
