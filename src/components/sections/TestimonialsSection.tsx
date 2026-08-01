import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Managing 47 Turo vehicles across three cities was a logistical nightmare before Drive Service Network. Now I schedule service for any vehicle in any market in minutes. The commercial pricing alone saves me thousands every month.",
    author: "Marcus T.",
    role: "Turo Host",
    fleet: "47 Vehicles · Tampa, FL",
    rating: 5,
  },
  {
    quote:
      "We run a 200-vehicle rental fleet and Drive Service Network has completely changed how we manage maintenance. One platform, one process, consistent quality across every market. This is what the industry needed.",
    author: "Jennifer R.",
    role: "Fleet Operations Manager",
    fleet: "200+ Vehicles · Multi-Market",
    rating: 5,
  },
  {
    quote:
      "The 3-step booking process is exactly what operators need. I don't have time to navigate complex systems. Drive Service Network gets my vehicles serviced and back on the road — that's all I need.",
    author: "David K.",
    role: "Independent Rental Operator",
    fleet: "28 Vehicles · Orlando, FL",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="font-montserrat font-semibold text-teal text-sm uppercase tracking-widest mb-3">
            Operator Testimonials
          </p>
          <h2 className="heading-lg text-white">
            What Operators Are{" "}
            <span className="text-gold">Saying</span>
          </h2>
          <p className="body-lg text-white/60 mt-4 max-w-2xl mx-auto">
            Drive Service Network was built for operators like these. Their
            challenges shaped every feature of the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-all duration-300 flex flex-col"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-teal/40 mb-4 flex-shrink-0" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-gold fill-gold"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-opensans text-white/80 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="border-t border-white/10 pt-4">
                <div className="font-montserrat font-bold text-white text-sm">
                  {testimonial.author}
                </div>
                <div className="font-opensans text-teal text-xs mt-0.5">
                  {testimonial.role}
                </div>
                <div className="font-opensans text-white/40 text-xs mt-0.5">
                  {testimonial.fleet}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
