"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
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
            Terms and Conditions
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
                  href="#agreement"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  1. Agreement to Terms
                </a>
              </li>
              <li>
                <a
                  href="#license"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  2. License to Use
                </a>
              </li>
              <li>
                <a
                  href="#user-content"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  3. User Content & Data
                </a>
              </li>
              <li>
                <a
                  href="#prohibited"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  4. Prohibited Activities
                </a>
              </li>
              <li>
                <a
                  href="#disclaimer"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  5. Disclaimer of Warranties
                </a>
              </li>
              <li>
                <a
                  href="#limitation"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  6. Limitation of Liability
                </a>
              </li>
              <li>
                <a
                  href="#indemnification"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  7. Indemnification
                </a>
              </li>
              <li>
                <a
                  href="#termination"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  8. Termination
                </a>
              </li>
              <li>
                <a
                  href="#governing-law"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  9. Governing Law
                </a>
              </li>
              <li>
                <a
                  href="#contact-legal"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  10. Contact Information
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="prose dark:prose-invert max-w-none space-y-6">
          {/* Agreement to Terms */}
          <section id="agreement">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              These Terms and Conditions ("Terms") constitute a legal agreement
              between you ("User," "you," or "your") and Quantis stock
              ("Company," "we," "us," or "our"). By creating an account and
              accessing the Quantis stock platform, you acknowledge that you
              have read, understood, and agree to be bound by all terms and
              conditions contained herein.
            </p>
            <p className="text-gray-700 dark:text-slate-300">
              If you do not agree to these Terms, you must not use the Quantis
              stock platform. Your continued use of the platform constitutes
              your acceptance of these Terms.
            </p>
          </section>

          {/* License to Use */}
          <section id="license">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              2. License to Use
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              Quantis stock grants you a limited, non-exclusive,
              non-transferable license to access and use the platform for your
              personal or business inventory management purposes, subject to
              these Terms.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              2.1 Authorized Use
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                Use the platform only for lawful purposes and in accordance with
                these Terms
              </li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>
                Accept responsibility for all activities that occur under your
                account
              </li>
              <li>
                Not reproduce, distribute, or transmit platform content without
                permission
              </li>
              <li>Not attempt to gain unauthorized access to the platform</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              2.2 Intellectual Property Rights
            </h3>
            <p className="text-gray-700 dark:text-slate-300">
              All content, features, and functionality of Quantis stock
              (including but not limited to software, code, designs, and
              graphics) are the exclusive property of Quantis stock and its
              licensors. You may not copy, modify, or create derivative works
              without express written permission.
            </p>
          </section>

          {/* User Content & Data */}
          <section id="user-content">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              3. User Content & Data
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              You retain ownership of all data, content, and information you
              upload or input into Quantis stock ("User Content"). By using the
              platform, you grant us a license to use, store, and process your
              User Content for the purposes of providing the service.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              3.1 Your Responsibilities
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                You are responsible for the accuracy and legality of your User
                Content
              </li>
              <li>
                You represent that you own or have rights to all User Content
              </li>
              <li>
                You agree not to upload content that violates third-party rights
              </li>
              <li>Regular backups of critical data are recommended</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-teal-200 mt-4">
              3.2 Data Backup & Recovery
            </h3>
            <p className="text-gray-700 dark:text-slate-300">
              While we implement security measures to protect your data, we
              recommend maintaining regular backups. Quantis stock is not liable
              for loss or corruption of data due to technical failures or user
              error.
            </p>
          </section>

          {/* Prohibited Activities */}
          <section id="prohibited">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              4. Prohibited Activities
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              You agree not to engage in any of the following prohibited
              activities:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                Unauthorized access, hacking, or reverse engineering of the
                platform
              </li>
              <li>Transmission of viruses, malware, or malicious code</li>
              <li>Spam, phishing, or social engineering attacks</li>
              <li>
                Interference with platform operations or server functionality
              </li>
              <li>
                Violations of applicable laws, regulations, or third-party
                rights
              </li>
              <li>
                Harassment, abuse, or threatening behavior toward other users
              </li>
              <li>Unauthorized commercial use of the platform</li>
              <li>
                Removal or alteration of copyright, trademark, or legal notices
              </li>
            </ul>
          </section>

          {/* Disclaimer of Warranties */}
          <section id="disclaimer">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              5. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              QUANTIS STOCK IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT
              PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                Warranties of merchantability or fitness for a particular
                purpose
              </li>
              <li>Warranties of accuracy, completeness, or non-infringement</li>
              <li>Warranties regarding continuous, uninterrupted service</li>
              <li>Warranties that errors or defects will be corrected</li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              Your use of the platform is at your sole risk. We do not warrant
              that the platform will meet your requirements or be error-free.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section id="limitation">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL QUANTIS STOCK, ITS OFFICERS, DIRECTORS, OR EMPLOYEES BE
              LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>
                Any indirect, incidental, special, or consequential damages
              </li>
              <li>Loss of profits, revenue, data, business, or opportunity</li>
              <li>Damages arising from use or inability to use the platform</li>
              <li>
                Unauthorized access or data breaches beyond our reasonable
                control
              </li>
            </ul>
            <p className="text-gray-700 dark:text-slate-300 mt-4">
              Our total liability shall not exceed the amount paid by you in the
              12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          {/* Indemnification */}
          <section id="indemnification">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              7. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              You agree to indemnify, defend, and hold harmless Quantis stock
              from any claims, damages, losses, or expenses (including
              reasonable attorney fees) arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-slate-300 space-y-2">
              <li>Your use of the platform or violation of these Terms</li>
              <li>Your User Content or data uploaded to the platform</li>
              <li>Your violation of applicable laws or third-party rights</li>
              <li>Your actions or negligence related to your account</li>
            </ul>
          </section>

          {/* Termination */}
          <section id="termination">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              8. Termination
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              We may terminate or suspend your account and access to the
              platform at any time, with or without notice, for violations of
              these Terms or for any other reason at our sole discretion. Upon
              termination, your right to use the platform ceases immediately.
            </p>
            <p className="text-gray-700 dark:text-slate-300">
              You may delete your account at any time from your account
              settings. You are responsible for retrieving your data before
              account deletion, as we are not obligated to retain User Content
              after termination.
            </p>
          </section>

          {/* Governing Law */}
          <section id="governing-law">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              9. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              These Terms are governed by and construed in accordance with the
              laws of the jurisdiction where Quantis stock is incorporated,
              without regard to its conflict of law principles. You agree to
              submit to the exclusive jurisdiction of the courts located in that
              jurisdiction.
            </p>
          </section>

          {/* Contact Information */}
          <section id="contact-legal">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              10. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-slate-300">
              If you have questions about these Terms and Conditions or need to
              report violations, please contact us:
            </p>
            <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
              <p className="text-gray-900 dark:text-teal-100">
                <strong>Quantis stock Legal Team</strong>
              </p>
              <p className="text-gray-700 dark:text-slate-300">
                Email:{" "}
                <a
                  href="mailto:legal@quantisstock.com"
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  legal@quantisstock.com
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

          {/* Changes to Terms */}
          <section className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Changes to These Terms
            </h3>
            <p className="text-gray-700 dark:text-slate-300">
              Quantis stock reserves the right to update or modify these Terms
              at any time. Significant changes will be communicated via email or
              prominent notice on the platform. Your continued use of Quantis
              stock following the posting of revised Terms means you accept and
              agree to the changes.
            </p>
          </section>

          {/* Severability */}
          <section className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Severability
            </h3>
            <p className="text-gray-700 dark:text-slate-300">
              If any provision of these Terms is found to be invalid or
              unenforceable, the remaining provisions shall remain in full force
              and effect. The invalid provision shall be modified to the minimum
              extent necessary to make it valid and enforceable.
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
