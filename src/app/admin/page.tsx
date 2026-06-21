import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "لوحة تحكم سوار البحرية",
  description: "لوحة تحكم إدارة حجوزات سوار البحرية",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
