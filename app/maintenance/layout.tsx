import { Metadata } from "next";

export const metadata: Metadata = {
  title: "StockOS - Under Maintenance",
  description:
    "StockOS is currently under maintenance. We'll be back soon with improved features and performance.",
  robots: "index, follow",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
