import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Join Free — Create Your FREE Drive Membership",
  description:
    "Create your FREE Drive Membership. One registration. Easy access to the Drive ecosystem. No membership fee.",
};

const DOORWAY = [
  "Drive Service Network — maintenance, repairs, tires, glass, collision, roadside assistance, inspections and other vehicle services.",
  "Drive Parts Network — automotive parts.",
  "Drive KeZ — GPS tracking, smoke detection and theft protection.",
  "Drive Protection — Vehicle Service Contracts (VSC), GAP and other vehicle protection products.",
  "Drive Management — vehicle acquisition.",
  "Drive Financial — automotive business financing.",
  "Drive Connect — private car rental capability.",
  "Drive Growth Partners Network — opportunities to earn commissions by helping other operators access Drive products and services.",
  "Drive Cloud — automotive technology and software capabilities.",
  "Monthly Drive Newsletter — new products, savings opportunities, operating ideas and industry developments.",
];

export default function JoinPage() {
  return (
    <>
      <section className="bg-gradient-hero pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-montserrat text-xs font-black uppercase tracking-[0.25em] text-gold">
              Free Membership
            </p>
            <h1 className="mt-5 font-montserrat text-3xl font-black leading-tight text-white md:text-5xl">
              Create Your FREE Membership
            </h1>
            <p className="mt-5 font-opensans text-lg text-white/75">
              One Registration. Easy Access to the Drive Ecosystem.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href="/auth/register">
                  Join Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="/auth/login"
                  className="border-white/70 text-white hover:bg-white hover:text-navy"
                >
                  Sign In
                </Link>
              </Button>
            </div>
            <p className="mt-5 font-montserrat text-xs font-bold uppercase tracking-widest text-teal">
              No Membership Fee.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-montserrat text-2xl font-bold text-navy md:text-3xl">
              Your FREE Drive Membership Is Your Doorway To:
            </h2>
            <ul className="mt-8 space-y-3">
              {DOORWAY.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
                  <span className="font-opensans text-sm leading-relaxed text-navy">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border-2 border-gold/40 bg-gold/5 p-7">
              <p className="flex items-center gap-2 font-montserrat text-sm font-black uppercase tracking-wide text-navy">
                <Percent className="h-4 w-4 text-gold" />
                Optional DSN Discount Subscription
              </p>
              <p className="mt-3 font-opensans text-sm leading-relaxed text-gray-600">
                With your FREE Drive Membership, you may also subscribe to a special
                nationwide discount program offering savings of up to 25% on
                participating vehicle repairs and services. Membership is free; the
                nationwide discount program is a separate optional subscription.
              </p>
              <Link
                href="/discount-program-faq"
                className="mt-4 inline-flex items-center gap-1.5 font-montserrat text-sm font-semibold text-teal hover:underline"
              >
                See the DSN Discount Program FAQ
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-8 text-center font-opensans text-sm leading-relaxed text-gray-500">
              Membership provides easy access to the Drive ecosystem. Certain
              products and services may require separate enrollment or application,
              credit approval, eligibility requirements, separate agreements,
              additional information, payment or third-party approval.
            </p>

            <div className="mt-8 text-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/auth/register">
                  Create Your FREE Membership
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
