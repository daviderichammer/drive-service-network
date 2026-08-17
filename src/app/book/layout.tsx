import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Service — Drive Service Network",
  description:
    "Schedule vehicle maintenance and repairs at a participating service facility near your vehicle through Drive Service Network.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
