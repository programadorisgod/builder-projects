export interface Architecture {
  name: string;
  value: string;
  description: string;
}

export const BACKEND_ARCHITECTURES: Architecture[] = [
  {
    name: "MVC (Model-View-Controller)",
    value: "mvc",
    description: "Classic three-layer architecture",
  },
  {
    name: "Hexagonal (Ports & Adapters)",
    value: "hexagonal",
    description: "Domain-centric with ports and adapters",
  },
  {
    name: "Layered Architecture",
    value: "layered",
    description: "Simple layered approach",
  },
  {
    name: "Layered with Screaming Architecture",
    value: "layered-screaming",
    description: "Layered with feature-based organization",
  },
];

export const FRONTEND_ARCHITECTURES: Architecture[] = [
  {
    name: "Component-based (Default)",
    value: "component-based",
    description: "Traditional component hierarchy",
  },
  {
    name: "Feature-based with Screaming Architecture",
    value: "feature-based",
    description: "Organized by features/domains",
  },
];
