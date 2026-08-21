import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { countUnreadMessages } from "@/lib/messages/service";
import { getFleetRecallSummary } from "@/lib/recalls/service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriber Dashboard | Drive Service Network",
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

  // Attention counts for the navigation. Both are cheap reads and both fail
  // soft: a badge is a convenience and must never break the dashboard.
  const [unreadMessages, recallSummary] = await Promise.all([
    countUnreadMessages(session.user.id).catch(() => 0),
    getFleetRecallSummary(session.user.id).catch(() => ({
      openCount: 0,
      vehiclesAffected: 0,
    })),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="section-container py-6 md:py-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <DashboardSidebar
            user={session.user}
            badges={{
              messages: unreadMessages,
              recalls: recallSummary.openCount,
            }}
          />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
