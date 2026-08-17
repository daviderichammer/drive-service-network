/**
 * Shared content constants for the Drive Service Network website.
 *
 * REVAMP BUILD v5.0 — all customer-facing copy in this file is taken from the
 * DSN Website Revamp Build Directive (CHANGES 001–012). Do not add marketing
 * language that is not specified in the directive.
 */

/** CHANGE 002-C — standardized affiliated-company descriptions. */
export const ECOSYSTEM_ENTITIES = [
  {
    name: "Global Drive Holdings",
    description: "Automotive Holding Company",
    href: "https://globaldriveholdings.com",
  },
  {
    name: "Drive Commerce",
    description: "Automotive Products & Services",
    href: "https://drivecommercegroup.com",
  },
  {
    name: "Drive Management",
    description: "Vehicle Acquisition",
    href: "https://drivemanagement.com",
  },
  {
    name: "Drive KeZ",
    description: "Vehicle Tracking, Smoke Detection & Theft Protection",
    href: "https://drivekez.com",
  },
  {
    name: "Drive Protection",
    description: "Vehicle Protection Plans",
    href: "https://driveprotectiongroup.com",
  },
  {
    name: "Drive Cloud",
    description: "Automotive Technology & Software",
    href: "https://drivecloudgroup.com",
  },
  {
    name: "Drive Connect",
    description: "Private Car Rental Platform",
    href: "https://trustdriveconnect.com",
  },
  {
    name: "Drive Service Network",
    description: "Nationwide Vehicle Service & Repair Network",
    href: "https://driveservicenetwork.com",
  },
  {
    name: "Drive Parts Network",
    description: "Automotive Parts Network",
    href: "https://drivepartsnetwork.com",
  },
  {
    name: "Drive Growth Partners Network",
    description: "Independent Sales Partner Network",
    href: "https://drivegrowthpartnersnetwork.com",
  },
  {
    name: "Drive Financial",
    description: "Automotive Business Financing",
    href: "https://drivefinancialgroup.com",
  },
  {
    name: "Infinite Auto Management",
    description: "Car Rental Fleet Operations",
    href: "https://infiniteautomanagement.com",
  },
] as const;

/** CHANGE 001-C — principal service categories. */
export const SERVICE_CATEGORIES = [
  {
    name: "Mechanical Repairs",
    description:
      "Engine, drivetrain, electrical, cooling, braking and other mechanical repairs.",
    icon: "wrench",
  },
  {
    name: "Maintenance",
    description:
      "Oil changes, scheduled maintenance, filters, fluids and preventive maintenance.",
    icon: "gauge",
  },
  {
    name: "Tires",
    description: "Replacement, repair, rotation, balancing and related tire services.",
    icon: "circle",
  },
  {
    name: "Glass",
    description: "Windshield and automotive glass repair and replacement.",
    icon: "glass",
  },
  {
    name: "Collision",
    description: "Body repair, paint and collision services.",
    icon: "collision",
  },
  {
    name: "Roadside Assistance",
    description: "Help when a vehicle cannot continue operating normally.",
    icon: "roadside",
  },
  {
    name: "Inspections",
    description: "Vehicle inspections and related inspection services.",
    icon: "clipboard",
  },
] as const;

/** CHANGE 001-B — the three DSN customer groups. */
export const CUSTOMER_GROUPS = [
  {
    name: "Turo Hosts",
    description:
      "From hosts operating several vehicles to professional hosts managing substantial fleets.",
  },
  {
    name: "Car Rental Operators",
    description:
      "Independent car rental companies, franchise operators and other professional rental fleet operators.",
  },
  {
    name: "Fleets",
    description:
      "Businesses and organizations operating multiple vehicles requiring ongoing maintenance, repair and vehicle-service support.",
  },
] as const;

/**
 * CHANGE 006 — examples of the types of recognized national service brands
 * available through the network. Displayed with local and independent
 * providers; participation and service availability vary by location.
 */
export const NETWORK_BRANDS = [
  { name: "Goodyear", logo: "/logos/goodyear.png" },
  { name: "Firestone Complete Auto Care", logo: "/logos/firestone.png" },
  { name: "Meineke", logo: "/logos/meineke.png" },
  { name: "AAMCO", logo: "/logos/aamco.png" },
  { name: "Jiffy Lube", logo: "/logos/jiffylube.png" },
  { name: "Valvoline", logo: "/logos/valvoline.png" },
  { name: "Midas", logo: "/logos/midas.png" },
  { name: "Pep Boys", logo: "/logos/pepboys.png" },
  { name: "Mavis Discount Tire", logo: "/logos/mavis.png" },
  { name: "Monro", logo: "/logos/monro.png" },
] as const;

/** CHANGE 012 — DSN video supplied in the directive. */
export const DSN_VIDEO_ID = "GJunr8sRGR0";

/** Primary service-request entry point (existing DSN quote workflow). */
export const QUOTE_URL = "/book";
