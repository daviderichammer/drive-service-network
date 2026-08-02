import React from "react";

const networkBrands = [
  { name: "Goodyear", abbr: "GY" },
  { name: "Meineke", abbr: "MK" },
  { name: "AAMCO", abbr: "AC" },
  { name: "Firestone", abbr: "FS" },
  { name: "Jiffy Lube", abbr: "JL" },
  { name: "Pep Boys", abbr: "PB" },
  { name: "Valvoline", abbr: "VL" },
  { name: "Midas", abbr: "MD" },
  { name: "Mavis", abbr: "MV" },
  { name: "Monro", abbr: "MN" },
];

export function NetworkBrandBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-8">
      <div className="section-container">
        <p className="text-center font-montserrat font-semibold text-gray-400 text-xs uppercase tracking-widest mb-6">
          Trusted Network Partners Include
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {networkBrands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm hover:shadow-md hover:border-teal/30 transition-all duration-200 min-w-[100px]"
              title={brand.name}
            >
              <span className="font-montserrat font-black text-navy text-sm tracking-tight">
                {brand.name}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-center bg-teal/10 border border-teal/20 rounded-xl px-5 py-3 min-w-[100px]">
            <span className="font-montserrat font-semibold text-teal text-sm">
              +39,990 more
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
