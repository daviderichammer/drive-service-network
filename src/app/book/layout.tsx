import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Service — Drive Service Network",
  description:
    "Schedule auto repair and maintenance at a certified shop near you. Powered by the Openbay network.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
