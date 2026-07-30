import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { ContactForm } from "@/components/sections/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Drive Service Network",
  description:
    "Contact Drive Service Network for membership inquiries, fleet solutions, partnership opportunities, or general support. Our team responds within 1 business day.",
};

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "(800) 555-1234",
    href: "tel:+18005551234",
    description: "Monday–Friday, 8am–6pm EST",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@driveservicenetwork.com",
    href: "mailto:info@driveservicenetwork.com",
    description: "We respond within 1 business day",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Florida, United States",
    href: null,
    description: "Serving operators nationwide",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon–Fri: 8am–6pm EST",
    href: null,
    description: "Emergency support available for Enterprise members",
  },
];

const inquiryTypes = [
  {
    type: "membership",
    title: "Membership Inquiry",
    description: "Questions about plans, pricing, and benefits",
    icon: "🏆",
  },
  {
    type: "fleet",
    title: "Fleet Solutions",
    description: "Enterprise fleet programs and commercial accounts",
    icon: "🚗",
  },
  {
    type: "partnership",
    title: "Partnership",
    description: "Shop network, vendor, or strategic partnerships",
    icon: "🤝",
  },
  {
    type: "support",
    title: "Support",
    description: "Technical support or account assistance",
    icon: "💬",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="section-container">
          <div className="max-w-2xl">
            <Badge variant="teal" size="lg" className="mb-6">
              Get In Touch
            </Badge>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6">
              Let&apos;s Talk{" "}
              <span className="text-gold">About Your Fleet.</span>
            </h1>
            <p className="font-opensans text-white/80 text-lg leading-relaxed">
              Whether you&apos;re exploring membership, managing a large fleet,
              or looking to partner with Drive Service Network — our team is
              ready to help. We respond to every inquiry within 1 business day.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-gray-50">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left — Info */}
            <div className="lg:col-span-1">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-card mb-6">
                <h2 className="font-montserrat font-bold text-navy text-lg mb-5">
                  Contact Information
                </h2>
                <div className="space-y-5">
                  {contactInfo.map((info) => {
                    const Icon = info.icon;
                    return (
                      <div key={info.label} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-teal" />
                        </div>
                        <div>
                          <div className="font-montserrat font-semibold text-navy text-xs uppercase tracking-wide">
                            {info.label}
                          </div>
                          {info.href ? (
                            <a
                              href={info.href}
                              className="font-opensans text-navy text-sm font-medium hover:text-teal transition-colors duration-200 block mt-0.5"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <div className="font-opensans text-navy text-sm font-medium mt-0.5">
                              {info.value}
                            </div>
                          )}
                          <div className="font-opensans text-gray-400 text-xs mt-0.5">
                            {info.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inquiry Types */}
              <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-card">
                <h2 className="font-montserrat font-bold text-navy text-lg mb-5">
                  How Can We Help?
                </h2>
                <div className="space-y-3">
                  {inquiryTypes.map((inquiry) => (
                    <div
                      key={inquiry.type}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <span className="text-xl flex-shrink-0">{inquiry.icon}</span>
                      <div>
                        <div className="font-montserrat font-semibold text-navy text-sm">
                          {inquiry.title}
                        </div>
                        <div className="font-opensans text-gray-400 text-xs mt-0.5">
                          {inquiry.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-card">
                <h2 className="font-montserrat font-bold text-navy text-xl mb-2">
                  Send Us a Message
                </h2>
                <p className="font-opensans text-gray-500 text-sm mb-7">
                  Fill out the form below and a member of our team will respond
                  within 1 business day.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GDH Note */}
      <section className="section-padding-sm bg-navy">
        <div className="section-container">
          <div className="text-center">
            <p className="font-opensans text-white/50 text-sm">
              Drive Service Network Inc. is a Global Drive Holdings Inc. company.
              <br />
              For inquiries about other GDH products, please specify in your message.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
