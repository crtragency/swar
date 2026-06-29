import OwnerDashboard from "@/components/owner/OwnerDashboard";

export const metadata = { title: "لوحة الكابتن — سوار البحرية" };

export default function CaptainPage() {
  return (
    <OwnerDashboard
      user="captain"
      title="لوحة الكابتن"
      subtitle="سوار البحرية — الإيرادات والحجوزات"
    />
  );
}
