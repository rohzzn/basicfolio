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
  {
    slug: "confetti-button",
    name: "Confetti Button",
    description: "Button that fires a confetti burst on click",
    intro:
      "A celebratory button that launches a confetti burst from its center when clicked. Uses canvas-confetti under the hood with configurable particle count and spread.",
    registryUrl: "https://rohan.run/r/confetti-button.json",
    usageImport: `import { ConfettiButton } from "@/components/rohan/confetti-button"`,
    usageCode: `<ConfettiButton>Celebrate</ConfettiButton>`,
    props: [
      {
        name: "children",
        type: "ReactNode",
        default: '"Celebrate"',
        description: "Button label or content.",
      },
      {
        name: "particleCount",
        type: "number",
        default: "100",
        description: "Number of confetti particles per burst.",
      },
      {
        name: "spread",
        type: "number",
        default: "70",
        description: "Spread angle of the burst in degrees.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Optional CSS classes for the button.",
      },
    ],
  },
  {
    slug: "number-ticker",
    name: "Number Ticker",
    description: "Odometer digits that roll to new values",
    intro:
      "Each digit sits on a vertical reel and rolls to its next value on a spring, always taking the shortest path around the loop. Handles grouping separators, prefixes and suffixes.",
    registryUrl: "https://rohan.run/r/number-ticker.json",
    usageImport: `import { NumberTicker } from "@/components/rohan/number-ticker"`,
    usageCode: `<NumberTicker
  value={12847}
  prefix="$"
  className="text-4xl font-semibold"
/>`,
    props: [
      {
        name: "value",
        type: "number",
        default: "—",
        description: "The number to display. Digits roll whenever it changes.",
      },
      {
        name: "separator",
        type: "string",
        default: '","',
        description: 'Thousands separator. Pass "" to disable grouping.',
      },
      {
        name: "prefix",
        type: "string",
        default: "—",
        description: 'Rendered before the digits, e.g. "$".',
      },
      {
        name: "suffix",
        type: "string",
        default: "—",
        description: 'Rendered after the digits, e.g. "%".',
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Classes for the wrapper. Font size and color are inherited.",
      },
    ],
  },
  {
    slug: "slide-to-confirm",
    name: "Slide to Confirm",
    description: "Slide-to-unlock control for risky actions",
    intro:
      "A deliberate alternative to a confirm dialog: drag the knob to the end to fire the action, release early and it springs back. The prompt carries a slow shimmer and fades as you drag.",
    registryUrl: "https://rohan.run/r/slide-to-confirm.json",
    usageImport: `import { SlideToConfirm } from "@/components/rohan/slide-to-confirm"`,
    usageCode: `<SlideToConfirm
  label="Slide to deploy"
  confirmedLabel="Deployed"
  onConfirm={() => deploy()}
/>`,
    props: [
      {
        name: "label",
        type: "string",
        default: '"Slide to confirm"',
        description: "Prompt shown in the track.",
      },
      {
        name: "confirmedLabel",
        type: "string",
        default: '"Confirmed"',
        description: "Label shown after confirming.",
      },
      {
        name: "onConfirm",
        type: "() => void",
        default: "—",
        description: "Fired once the knob reaches the end of the track.",
      },
      {
        name: "resetAfter",
        type: "number",
        default: "0",
        description: "Auto-reset delay in ms. 0 keeps it confirmed.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Optional CSS classes for the track.",
      },
    ],
  },
  {
    slug: "scrub-input",
    name: "Scrub Input",
    description: "Figma-style drag-to-change number field",
    intro:
      "Drag horizontally across the label to scrub the value — hold Shift for ×10 or Alt for ×0.1 — or click the number to type it directly. Arrow keys nudge when the field is focused.",
    registryUrl: "https://rohan.run/r/scrub-input.json",
    usageImport: `import { ScrubInput } from "@/components/rohan/scrub-input"`,
    usageCode: `<ScrubInput
  label="W"
  defaultValue={320}
  min={0}
  max={1920}
  suffix="px"
  onChange={(value) => setWidth(value)}
/>`,
    props: [
      {
        name: "label",
        type: "string",
        default: "—",
        description: 'Short label shown in the drag zone, e.g. "W".',
      },
      {
        name: "defaultValue",
        type: "number",
        default: "0",
        description: "Initial value.",
      },
      {
        name: "min / max",
        type: "number",
        default: "±Infinity",
        description: "Clamp range for the value.",
      },
      {
        name: "step",
        type: "number",
        default: "1",
        description: "Snap increment. Decimal steps set the displayed precision.",
      },
      {
        name: "suffix",
        type: "string",
        default: "—",
        description: 'Unit rendered after the number, e.g. "px".',
      },
      {
        name: "sensitivity",
        type: "number",
        default: "0.5",
        description: "Value change per pixel dragged.",
      },
      {
        name: "onChange",
        type: "(value: number) => void",
        default: "—",
        description: "Fires on every committed change.",
      },
    ],
  },
  {
    slug: "status-button",
    name: "Status Button",
    description: "Async button with loading, success and error states",
    intro:
      "Give it an async action and it handles the rest: a spinner while pending, a drawn-in checkmark on success, a shake on failure — resizing itself to fit each label before reverting to idle.",
    registryUrl: "https://rohan.run/r/status-button.json",
    usageImport: `import { StatusButton } from "@/components/rohan/status-button"`,
    usageCode: `<StatusButton
  action={() => saveSettings()}
  successLabel="Saved"
  errorLabel="Failed"
>
  Save changes
</StatusButton>`,
    props: [
      {
        name: "action",
        type: "() => Promise<unknown>",
        default: "—",
        description: "Async work to run on click. Resolve → success, reject → error.",
      },
      {
        name: "children",
        type: "ReactNode",
        default: '"Save changes"',
        description: "Idle label.",
      },
      {
        name: "successLabel",
        type: "string",
        default: '"Saved"',
        description: "Label shown on success.",
      },
      {
        name: "errorLabel",
        type: "string",
        default: '"Failed"',
        description: "Label shown on error.",
      },
      {
        name: "revertAfter",
        type: "number",
        default: "2000",
        description: "ms before returning to idle after success or error.",
      },
    ],
  },
  {
    slug: "compare-slider",
    name: "Compare Slider",
    description: "Before/after comparison with a draggable divider",
    intro:
      "Two layers stay perfectly registered while a draggable divider clips between them on a soft spring. Works with images or any React content — drag anywhere, or move the handle with arrow keys.",
    registryUrl: "https://rohan.run/r/compare-slider.json",
    usageImport: `import { CompareSlider } from "@/components/rohan/compare-slider"`,
    usageCode: `<CompareSlider
  before={<img src="/photo-raw.jpg" alt="Unedited" />}
  after={<img src="/photo-edited.jpg" alt="Edited" />}
  beforeLabel="Raw"
  afterLabel="Edited"
/>`,
    props: [
      {
        name: "before",
        type: "ReactNode",
        default: "—",
        description: "Layer revealed on the left of the divider.",
      },
      {
        name: "after",
        type: "ReactNode",
        default: "—",
        description: "Layer revealed on the right of the divider.",
      },
      {
        name: "beforeLabel / afterLabel",
        type: "string",
        default: '"Before" / "After"',
        description: "Corner labels that fade in on hover.",
      },
      {
        name: "defaultPosition",
        type: "number",
        default: "50",
        description: "Initial divider position, 0–100.",
      },
      {
        name: "className",
        type: "string",
        default: "—",
        description: "Optional CSS classes for the container.",
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
