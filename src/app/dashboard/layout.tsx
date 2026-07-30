import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Dashboard | Drive Service Network",
  description: "Manage your vehicles, view service history, and track appointments.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="section-container py-8">
        <div className="flex gap-8">
          <DashboardSidebar user={session.user} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
