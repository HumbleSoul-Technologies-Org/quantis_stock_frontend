"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Factory,
  Headphones,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Warehouse,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const plans = [
  {
    id: "retail",
    name: "Retail",
    price: "$ 162",
    period: "(One time payment)",
    tagline: "Fast setup for single-location retail teams",
    description:
      "Run daily sales, inventory movement, and reporting without unnecessary complexity.",
    icon: Store,
    accent: "from-emerald-500 to-teal-600",
    recommended: false,
    features: [
      "Sales and receipt printing",
      "Supplier and product profile creation",
      "Inventory movement and stock-in",
      "Dashboard with sales and stock graphs",
      "User profiles and reports",
    ],
  },
  {
    id: "wholesale",
    name: "Wholesale",
    price: "$ 325",
    period: "(One time payment)",
    tagline: "Built for growing distributors and multi-branch operations",
    description:
      "Add branches, customer credit workflows, and stronger support to scale confidently.",
    icon: Warehouse,
    accent: "from-sky-500 to-cyan-600",
    recommended: true,
    features: [
      "Everything in Retail",
      "Branch creation and branch tracing",
      "Credit sales and customer profile management",
      "Offline mode for field and remote use",
      "24/7 customer care support",
    ],
  },
  {
    id: "manufacturer",
    name: "Manufacturer",
    price: "$ 540",
    period: "(One time payment)",
    tagline: "Complete production and operations control",
    description:
      "Manage people, materials, production, and expenses in one connected system.",
    icon: Factory,
    accent: "from-violet-500 to-fuchsia-600",
    recommended: false,
    features: [
      "Everything in Wholesale",
      "Employee management",
      "Raw materials and production tracing",
      "Inventory management",
      "Expense management",
    ],
  },
] as const;

const comparisonRows = [
  { label: "Core sales", retail: true, wholesale: true, manufacturer: true },
  {
    label: "Receipt printing",
    retail: true,
    wholesale: true,
    manufacturer: true,
  },
  {
    label: "Supplier and product profiles",
    retail: true,
    wholesale: true,
    manufacturer: true,
  },
  {
    label: "Inventory movement & stock-in",
    retail: true,
    wholesale: true,
    manufacturer: true,
  },
  {
    label: "Dashboard & graphs",
    retail: true,
    wholesale: true,
    manufacturer: true,
  },
  {
    label: "Branch creation & tracing",
    retail: false,
    wholesale: true,
    manufacturer: true,
  },
  {
    label: "Credit sales & customer profiles",
    retail: false,
    wholesale: true,
    manufacturer: true,
  },
  { label: "Offline mode", retail: false, wholesale: true, manufacturer: true },
  { label: "24/7 support", retail: false, wholesale: true, manufacturer: true },
  {
    label: "Employee management",
    retail: false,
    wholesale: false,
    manufacturer: true,
  },
  {
    label: "Raw material & production tracing",
    retail: false,
    wholesale: false,
    manufacturer: true,
  },
  {
    label: "Expense management",
    retail: false,
    wholesale: false,
    manufacturer: true,
  },
];

function PlanBadge({ recommended }: { recommended: boolean }) {
  if (!recommended) return null;

  return (
    <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
      <Sparkles className="mr-1 h-3.5 w-3.5" />
      Most popular
    </div>
  );
}

function FeatureCheck({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
      <span className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{label}</span>
    </li>
  );
}

export function SubscriptionPlans() {
  const router = useRouter();

  const handleSelectPlan = (planId: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedSubscriptionPlan", planId);
    }

    router.push(`/product-key?plan=${planId}`);
  };

  return (
    <div className="min-h-screen relative bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#111827_100%)] dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-800 dark:bg-slate-900/70 dark:text-emerald-300">
            <BadgeCheck className="mr-2 h-4 w-4" />
            Flexible subscription plans for every business model
          </div>

          <Link
            className="absolute cursor-pointer top-10 left-10"
            href="/dashboard"
          >
            <Button variant="outline" size="sm">
              <ArrowLeft /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose the right plan for your growth stage
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Start with the essentials or unlock advanced workflows for branches,
            credit, and production operations.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.id}
                className={`rounded-3xl border bg-white/90 p-7 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none ${
                  plan.recommended
                    ? "border-sky-300 ring-2 ring-sky-200 dark:border-sky-700 dark:ring-sky-900"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-2xl bg-gradient-to-br ${plan.accent} p-3 text-white`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <PlanBadge recommended={plan.recommended} />
                </div>

                <div className="mt-6">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {plan.tagline}
                  </p>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <FeatureCheck key={feature} label={feature} />
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    plan.recommended
                      ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                >
                  Choose {plan.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </article>
            );
          })}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Compare capabilities
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                A clear upgrade path from retail to manufacturing
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure activation flow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <Headphones className="h-4 w-4 text-sky-600" />
                Priority support for higher tiers
              </span>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] bg-slate-50 p-4 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <div>Feature</div>
              <div>Retail</div>
              <div>Wholesale</div>
              <div>Manufacturer</div>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.4fr_repeat(3,1fr)] border-t border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <div className="font-medium">{row.label}</div>
                <div>
                  {row.retail ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  {row.wholesale ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  {row.manufacturer ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-xl dark:border-slate-700 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Ready to activate?
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Pick a plan and continue to product key activation
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Your selected plan will be used to guide your activation
              experience and future billing setup.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Users className="h-4 w-4" />
              Designed for admins and business owners
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <BarChart3 className="h-4 w-4" />
              Includes dashboards and reporting from day one
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <WifiOff className="h-4 w-4" />
              Wholesale and manufacturing tiers include offline support
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Package className="h-4 w-4" />
              Product key access unlocks full feature access
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
