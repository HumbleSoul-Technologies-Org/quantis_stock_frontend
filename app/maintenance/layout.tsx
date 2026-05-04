import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quantis stock - Under Maintenance",
  description:
    "Quantis stock is currently under maintenance. We'll be back soon with improved features and performance.",
  robots: "index, follow",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
