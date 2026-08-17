import React from "react";
import {
  Wrench,
  Gauge,
  CircleDot,
  Layers,
  CarFront,
  LifeBuoy,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  wrench: Wrench,
  gauge: Gauge,
  circle: CircleDot,
  glass: Layers,
  collision: CarFront,
  roadside: LifeBuoy,
  clipboard: ClipboardCheck,
} as const;

export type ServiceIconName = keyof typeof ICONS;

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceIconName | string;
  className?: string;
}) {
  const Icon = ICONS[name as ServiceIconName] ?? Wrench;
  return <Icon className={cn("h-6 w-6", className)} />;
}
