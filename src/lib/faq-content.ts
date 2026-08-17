import type { FaqItem } from "@/components/sections/FaqAccordion";

/**
 * CHANGE 011-A — DRIVE SERVICE NETWORK FAQ.
 * Written for Turo hosts, car rental operators and fleets. Answers describe
 * only capabilities available through Drive Service Network. Items marked for
 * verification in the implementation report are phrased conservatively.
 */
export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const DSN_FAQ: FaqSection[] = [
  {
    title: "The Basics",
    items: [
      {
        question: "What is Drive Service Network?",
        answer:
          "Drive Service Network (DSN) is a nationwide vehicle service and repair network built for Turo hosts, car rental operators and fleets. You tell DSN what a vehicle needs and where it is located, and DSN helps you obtain and compare quotes from participating service facilities near that vehicle.",
      },
      {
        question: "What is the primary benefit of DSN?",
        answer:
          "Save money, save hours and reduce downtime. DSN gives you access to commercial pricing and nearby service options without calling multiple shops individually and waiting for estimates.",
      },
      {
        question: "How does DSN work?",
        answer:
          "Tell us what the vehicle needs and where it is located. Receive quotes from participating service facilities near the vehicle. Compare the available quotes. Choose the facility that works best for you. Get the vehicle serviced and get it back on the road.",
      },
      {
        question: "Who is DSN designed for?",
        answer:
          "DSN is designed for professional vehicle operators: Turo hosts, independent and franchise car rental operators, and businesses and organizations operating multiple vehicles.",
      },
    ],
  },
  {
    title: "Cost",
    items: [
      {
        question: "Is there a fee to use DSN?",
        answer:
          "No. There is no fee to use Drive Service Network to find service and compare quotes. FREE Drive Membership has no membership fee. A separate optional subscription is available for the nationwide DSN discount program.",
      },
      {
        question: "Is there a fee to obtain quotes?",
        answer: "No. Requesting service and receiving quotes is free.",
      },
      {
        question: "Is there a fee to schedule service?",
        answer:
          "No. Scheduling an appointment through DSN carries no separate scheduling fee. You pay the service facility for the actual maintenance or repair work.",
      },
    ],
  },
  {
    title: "Coverage and Services",
    items: [
      {
        question: "Where is DSN available?",
        answer:
          "DSN provides access to service facilities nationwide across the United States. Participating facilities, available services and pricing vary by location.",
      },
      {
        question: "What services are available?",
        answer:
          "More than 515 maintenance and repair services, including maintenance, mechanical repairs, tires, glass, collision, roadside assistance and inspections. The Services page lists the available services by category.",
      },
      {
        question: "How do I obtain multiple nearby quotes?",
        answer:
          "Select the service the vehicle needs and enter the location of the vehicle. DSN returns quotes from participating service facilities near that location so you can compare them in one place.",
      },
      {
        question: "How are service providers selected?",
        answer:
          "The network includes recognized national brands, local service facilities and independent professionals that participate in the network. Facility information, ratings and reviews are shown so you can evaluate each option before choosing.",
      },
      {
        question: "Can I review or rate a service provider?",
        answer:
          "Ratings and reviews are part of the information shown for participating facilities. Where the platform supports it, you can submit feedback about your service experience.",
      },
    ],
  },
  {
    title: "Pricing and Quotes",
    items: [
      {
        question: "Will I receive upfront pricing?",
        answer:
          "Yes. Pricing from participating service facilities is shown before you schedule the appointment.",
      },
      {
        question: "Are quoted prices fixed?",
        answer:
          "Quotes reflect the service you selected and the information you provided. If the vehicle requires different or additional work than described, the final price may change. Any additional work should be authorized by you before it is performed.",
      },
      {
        question: "What happens if a shop discovers additional work is required?",
        answer:
          "The service facility should contact you to explain what it found and obtain your authorization before performing additional work. You decide whether to approve the additional service.",
      },
    ],
  },
  {
    title: "Scheduling and Communication",
    items: [
      {
        question: "How do I schedule service?",
        answer:
          "After comparing quotes, select the facility you prefer, then choose an available date and time and confirm the appointment through DSN.",
      },
      {
        question: "Can I cancel or reschedule an appointment?",
        answer:
          "Yes. Appointments can be cancelled or rescheduled. Individual facilities may have their own cancellation or rescheduling practices, so notify the facility as early as practical.",
      },
      {
        question: "Can I communicate directly with the service facility?",
        answer:
          "Yes. Where the facility supports it, you can message the service facility about your appointment through Drive Service Network.",
      },
      {
        question: "How do I pay the service facility?",
        answer:
          "You pay the service facility for the maintenance or repair work performed, in accordance with that facility's accepted payment methods.",
      },
    ],
  },
  {
    title: "Multiple Vehicles and Markets",
    items: [
      {
        question: "Can I use DSN for multiple vehicles?",
        answer:
          "Yes. DSN is built for operators managing multiple vehicles, whether you operate 5 vehicles, 50 vehicles or 5,000 vehicles.",
      },
      {
        question: "Can I use DSN in multiple cities or markets?",
        answer:
          "Yes. DSN is designed for operators managing vehicles across multiple locations and markets.",
      },
      {
        question:
          "Can I arrange service for a vehicle located somewhere other than where I am?",
        answer:
          "Yes. DSN uses the location of the vehicle rather than your location. You can be in Miami and arrange service for a vehicle in Atlanta, Dallas, Los Angeles or another market.",
      },
    ],
  },
  {
    title: "FREE Drive Membership",
    items: [
      {
        question: "Do I need a FREE Drive Membership?",
        answer:
          "A FREE Drive Membership is how you register with the Drive ecosystem. Membership is free and gives you one registration for the Drive family of companies.",
      },
      {
        question: "What are the benefits of creating my FREE Drive Membership?",
        answer:
          "One registration provides easy access to Drive Service Network, Drive Parts Network, Drive KeZ, Drive Protection, Drive Management, Drive Financial, Drive Connect, Drive Growth Partners Network, Drive Cloud and the Monthly Drive Newsletter. Membership provides easy access rather than automatic qualification for every product, and certain products may require separate enrollment, approval or agreements.",
      },
      {
        question: "How does the optional DSN discount program work?",
        answer:
          "FREE Drive Members may subscribe to a separate optional program offering nationwide discounts of up to 25% on participating vehicle repairs and services. Membership is free; the discount program is an optional subscription. See the DSN Discount Program FAQ for details.",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        question: "Is my information secure?",
        answer:
          "Your account information is protected using industry-standard encryption and is used to provide the services you request. See our Privacy Policy for details about how information is collected and used.",
      },
    ],
  },
];

/**
 * CHANGE 011-B — DSN DISCOUNT PROGRAM FAQ.
 * Explains the optional subscription program available to FREE Drive Members.
 */
export const DISCOUNT_FAQ: FaqSection[] = [
  {
    title: "Program Basics",
    items: [
      {
        question: "What is the DSN Discount Program?",
        answer:
          "The DSN Discount Program is an optional subscription available to FREE Drive Members. It provides access to special nationwide discounts on participating vehicle repairs and services.",
      },
      {
        question: "What is the primary benefit?",
        answer:
          "Savings of up to 25% on participating vehicle repairs and services at participating service facilities nationwide.",
      },
      {
        question: "How does it work?",
        answer:
          "Subscribe to the program with your FREE Drive Membership, then request service through Drive Service Network as usual. Discounted pricing from participating facilities is reflected in the quotes you receive and compare.",
      },
      {
        question: "How much can I save?",
        answer:
          "Up to 25% on participating vehicle repairs and services. The actual discount varies by service facility, service type and location.",
      },
      {
        question: "Are discounts available nationwide?",
        answer:
          "The program is nationwide, but discounts apply at participating service facilities. Participation and eligible services vary by location.",
      },
    ],
  },
  {
    title: "Subscription and Membership",
    items: [
      {
        question: "Is there a subscription fee?",
        answer:
          "Yes. The DSN Discount Program is a paid optional subscription. Current subscription pricing is shown at the time of enrollment.",
      },
      {
        question: "Is the subscription separate from FREE Drive Membership?",
        answer:
          "Yes. FREE Drive Membership is free and provides one registration for easy access to the Drive ecosystem. The DSN Discount Program is a separate optional subscription. Membership and subscription are not the same thing.",
      },
      {
        question: "Do I need a FREE Drive Membership to subscribe?",
        answer:
          "Yes. The discount program is offered to FREE Drive Members. Create your FREE Drive Membership first, then add the optional discount subscription.",
      },
    ],
  },
  {
    title: "Using the Program",
    items: [
      {
        question: "What services qualify for discounts?",
        answer:
          "Eligible maintenance and repair services performed by participating service facilities. Eligible services vary by facility and location.",
      },
      {
        question: "Will I receive discounted pricing before scheduling service?",
        answer:
          "Yes. Discounted pricing from participating facilities is shown before you schedule the appointment.",
      },
      {
        question: "Are discounted prices fixed?",
        answer:
          "Discounted quotes reflect the service you selected and the information you provided. If the vehicle requires different or additional work, the final price may change and any additional work should be authorized by you first.",
      },
      {
        question: "Can I compare discounted prices among service facilities?",
        answer:
          "Yes. You can compare pricing, location, appointment availability, ratings and other facility information before choosing where to have the vehicle serviced.",
      },
      {
        question: "Can I message the service facility?",
        answer:
          "Yes. Where the facility supports it, you can message the service facility about your appointment through Drive Service Network.",
      },
      {
        question: "How do I schedule service?",
        answer:
          "Request service through Drive Service Network, compare the available quotes, select the facility you prefer and choose an available appointment date and time.",
      },
      {
        question: "Can I cancel or reschedule?",
        answer:
          "Yes. Appointments can be cancelled or rescheduled. Notify the service facility as early as practical, since individual facilities may have their own practices.",
      },
      {
        question: "How do I pay for the actual repair or service?",
        answer:
          "The subscription covers access to the discount program. You pay the service facility directly for the maintenance or repair work performed.",
      },
    ],
  },
  {
    title: "Multiple Vehicles and Fleets",
    items: [
      {
        question: "Can I enroll multiple vehicles?",
        answer:
          "The discount program is associated with your Drive Membership rather than a single vehicle, so you can use it for the vehicles you operate. Contact our team if you need a structure for a larger vehicle population.",
      },
      {
        question: "How does the program work for fleets?",
        answer:
          "Fleets use the same process to request service, compare discounted quotes and schedule appointments across multiple markets. Account functionality and additional services available to larger fleets can be discussed with our team.",
      },
    ],
  },
  {
    title: "Providers and Security",
    items: [
      {
        question: "How are participating service providers selected?",
        answer:
          "Participating providers include recognized national brands, local service facilities and independent professionals that participate in the network and honor program pricing at their location.",
      },
      {
        question: "Can I rate or review the service provider?",
        answer:
          "Ratings and reviews are part of the facility information shown in DSN, and where the platform supports it you can submit feedback about your service experience.",
      },
      {
        question: "Is my information secure?",
        answer:
          "Your account and subscription information is protected using industry-standard encryption and is used to provide the services you request. See our Privacy Policy for details.",
      },
    ],
  },
];
