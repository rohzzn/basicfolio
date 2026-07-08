export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface RohanComponent {
  slug: string;
  name: string;
  description: string;
  intro: string;
  registryUrl: string;
  usageImport: string;
  usageCode: string;
  props: PropRow[];
}

export const rohanComponents: RohanComponent[] = [
  {
    slug: "dock",
    name: "Dock",
    description: "macOS-style dock with cursor magnification",
    intro:
      "Icons magnify as the cursor approaches, with spring physics on size and lift. Tooltips animate in on hover and a dot marks the active item.",
    registryUrl: "https://rohan.run/r/dock.json",
    usageImport: `import { Dock } from "@/components/rohan/dock"
import { Camera, Folder, Home, Mail, Music, Terminal } from "lucide-react"`,
    usageCode: `const items = [
  { id: "home", label: "Home", icon: <Home /> },
  { id: "files", label: "Files", icon: <Folder /> },
  { id: "terminal", label: "Terminal", icon: <Terminal /> },
  { id: "music", label: "Music", icon: <Music /> },
  { id: "photos", label: "Photos", icon: <Camera /> },
  { id: "mail", label: "Mail", icon: <Mail /> },
];

<Dock items={items} />`,
    props: [
      {
        name: "items",
        type: "DockItem[]",
        default: "—",
        description: "Array of items with { id, label, icon, onClick? }.",
      },
      {
        name: "baseSize",
        type: "number",
        default: "42",
        description: "Icon size at rest, in px.",
      },
      {
        name: "maxSize",
        type: "number",
        default: "72",
        description: "Icon size directly under the cursor, in px.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Optional CSS classes for the dock container.",
      },
    ],
  },
  {
    slug: "spotlight-card",
    name: "Spotlight Card",
    description: "Cursor-tracking rim light and interior glow",
    intro:
      "A card whose border rim and interior glow follow the cursor on a soft spring. The spotlight fades in on hover and trails slightly behind the pointer.",
    registryUrl: "https://rohan.run/r/spotlight-card.json",
    usageImport: `import { SpotlightCard } from "@/components/rohan/spotlight-card"`,
    usageCode: `<SpotlightCard>
  <div className="p-6 text-center">
    <p className="text-sm font-semibold">Spotlight</p>
    <p className="mt-1.5 text-xs text-zinc-400">
      Move your cursor across this card.
    </p>
  </div>
</SpotlightCard>`,
    props: [
      {
        name: "glowColor",
        type: "string",
        default: '"217, 119, 6"',
        description: "RGB triplet for the rim light and interior glow.",
      },
      {
        name: "radius",
        type: "number",
        default: "220",
        description: "Spotlight radius in px. The interior glow uses 1.4× this value.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Optional CSS classes for the outer card.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Card content.",
      },
    ],
  },
  {
    slug: "tilt-card",
    name: "Tilt Card",
    description: "3D perspective tilt with moving glare",
    intro:
      "A card that tilts toward the cursor with spring physics and a glare highlight that sweeps across the surface. Layer children with translateZ for parallax depth.",
    registryUrl: "https://rohan.run/r/tilt-card.json",
    usageImport: `import { TiltCard } from "@/components/rohan/tilt-card"`,
    usageCode: `<TiltCard>
  <div className="flex flex-col items-center p-6 text-center">
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
      3D
    </span>
    <p className="mt-3 text-sm font-semibold">Tilt me</p>
    <p className="mt-1 max-w-[200px] text-xs text-zinc-400">
      Hover and move your cursor to see the perspective shift.
    </p>
  </div>
</TiltCard>`,
    props: [
      {
        name: "maxTilt",
        type: "number",
        default: "10",
        description: "Maximum tilt in degrees on each axis.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Optional CSS classes for the card wrapper.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: "—",
        description: "Card content. Use transform: translateZ(px) to layer depth.",
      },
    ],
  },
];

export function getRohanComponent(slug: string): RohanComponent | undefined {
  return rohanComponents.find((c) => c.slug === slug);
}

export function getComponentCode(component: RohanComponent): string {
  return `${component.usageImport}\n\n${component.usageCode}`;
}
