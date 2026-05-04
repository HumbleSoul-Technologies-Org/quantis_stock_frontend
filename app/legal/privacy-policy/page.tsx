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
              Quantis stock is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our inventory management
              platform.
            </p>
            <p className="text-gray-700 dark:text-slate-300">
              Please read this Privacy Policy carefully. If you do not agree
              with our policies and practices, please do not use our platform.
              By accessing and using Quantis stock, you acknowledge that you
              have read and understand this Privacy Policy.
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
                <strong>Account Information:</strong> Username, email address,
                password, company name, business type
              </li>
              <li>
                <strong>Business Data:</strong> Products, inventory, sales
                records, supplier information, transaction details
              </li>
              <li>
                <strong>Payment Information:</strong> Payment methods,
                transaction history, billing details
              </li>
              <li>
                <strong>User Profile:</strong> User role, permissions, activity
                logs
              </li>
              <li>
                <strong>Communication:</strong> Messages, support requests,
                feedback sent through our platform
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Device Information:</strong> Device type, operating
                system, browser type and version
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, time
                spent on platform, click patterns
              </li>
              <li>
                <strong>Location Information:</strong> IP address and
                approximate location based on IP
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> Session identifiers,
                preferences, analytics data
              </li>
              <li>
                <strong>Log Data:</strong> API requests, error logs, system
                performance metrics
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section id="how-we-use">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>Providing and maintaining the Quantis stock platform</li>
              <li>Processing transactions and sending related information</li>
              <li>
                Sending transactional emails (password resets, confirmations)
              </li>
              <li>Responding to inquiries and providing customer support</li>
              <li>Monitoring and analyzing platform usage and trends</li>
              <li>Improving, personalizing, and optimizing our service</li>
              <li>
                Detecting and preventing fraud, security issues, and abuse
              </li>
              <li>Complying with legal obligations and regulations</li>
              <li>
                Communicating about updates, policy changes, and new features
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section id="data-security">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              4. Data Security
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We implement comprehensive security measures to protect your
              information:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Encryption:</strong> SSL/TLS encryption for data in
                transit
              </li>
              <li>
                <strong>Password Security:</strong> Secure password hashing
                using industry-standard algorithms
              </li>
              <li>
                <strong>Access Control:</strong> Role-based access control and
                permission systems
              </li>
              <li>
                <strong>Data Protection:</strong> Browser storage isolation and
                secure session management
              </li>
              <li>
                <strong>Regular Security:</strong> Regular security audits and
                vulnerability assessments
              </li>
              <li>
                <strong>Incident Response:</strong> Procedures for responding to
                potential security incidents
              </li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              While we strive to use reasonable security measures, no method of
              transmission over the internet is 100% secure. We cannot guarantee
              absolute security of your information.
            </p>
          </section>

          {/* Data Sharing */}
          <section id="data-sharing">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              5. Data Sharing & Third Parties
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We do not sell your personal information to third parties.
              However, we may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Service Providers:</strong> With vendors who assist in
                platform operations (hosting, analytics)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law,
                regulation, or court order
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with mergers,
                acquisitions, or asset sales
              </li>
              <li>
                <strong>User Consent:</strong> With your explicit consent for
                specific purposes
              </li>
              <li>
                <strong>Aggregated Data:</strong> We may share anonymized,
                aggregated statistics
              </li>
            </ul>
          </section>

          {/* Your Rights & Controls */}
          <section id="your-rights">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              6. Your Rights & Controls
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                <strong>Right to Access:</strong> Request a copy of your
                personal data
              </li>
              <li>
                <strong>Right to Correct:</strong> Request correction of
                inaccurate information
              </li>
              <li>
                <strong>Right to Delete:</strong> Request deletion of your
                account and data
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> Opt out of marketing
                communications
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Request your data in
                a portable format
              </li>
              <li>
                <strong>Right to Object:</strong> Object to certain types of
                data processing
              </li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              To exercise these rights, please contact us at
              privacy@quantisstock.com with your request.
            </p>
          </section>

          {/* Cookies & Tracking */}
          <section id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              7. Cookies & Tracking
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              Quantis stock uses cookies and similar tracking technologies to
              enhance user experience:
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
                <strong>Analytics Cookies:</strong> Help us understand how users
                interact with our platform
              </li>
              <li>
                <strong>Session Cookies:</strong> Maintain your login session
              </li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              You can control cookies through your browser settings. Disabling
              certain cookies may affect platform functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section id="data-retention">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              8. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>Provide our services effectively</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Conduct audits and maintain security</li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              You can request deletion of your account at any time. Some data
              may be retained for compliance purposes even after account
              deletion.
            </p>
          </section>

          {/* Contact Us */}
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
                <strong>Quantis stock Privacy Team</strong>
              </p>
              <p className="text-gray-700 dark:text-slate-300">
                Email:{" "}
                <a
                  href="mailto:privacy@quantisstock.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  privacy@quantisstock.com
                </a>
              </p>
              <p className="text-gray-700 dark:text-slate-300">
                Email:{" "}
                <a
                  href="mailto:support@quantisstock.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  support@quantisstock.com
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
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or prominent notice on
              our platform. Your continued use of Quantis stock after changes
              constitutes your acceptance of the updated policy.
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
