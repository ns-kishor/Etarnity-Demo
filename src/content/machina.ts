/**
 * MachinaFusion — single source of truth for all site copy.
 * Data-mapped from the previous site structure (news, insights, contact
 * pipeline) into the new ultra-modern minimalist design.
 * NOTE: metrics + partners are PRD-specified marketing figures —
 * replace with audited numbers before public launch.
 */

export const site = {
  name: "MachinaFusion",
  domain: "machinafusiongroup.com",
  email: "hello@machinafusiongroup.com",
  tagline: "Intelligence that feels",
  description:
    "MachinaFusion bridges the gap between humanity and robotics — algorithms, AI and autonomous systems engineered as one continuum.",
  foundingYear: "2024",
};

/* ------------------------------- Navigation ------------------------------- */

export const nav = [
  { label: "News", href: "#newsroom" },
  { label: "Cutting-Edge Tech", href: "#tunnel" },
  { label: "Explore AI", href: "#stack" },
];

export const headerCta = {
  label: "Available Positions",
  href: "#contact",
  status: "hiring",
};

/* ---------------------------------- Hero ----------------------------------- */

export const hero = {
  headline: site.name,
  subheadline: site.tagline,
  callout:
    "Bridging the gap between humanity and robotics for a smarter, more connected future.",
  microPills: ["Algorithms", "AI", "Robotics"],
  ariaLabels: {
    humanHand: "A human hand reaching toward the center",
    robotHand: "A robotic hand reaching toward the center",
  },
};

/* --------------------------------- Tunnel ---------------------------------- */

export const tunnel = {
  kicker: "Cutting-Edge Tech",
  title: "NEXT GEN ENGINEERING",
  subtext:
    "Precision actuation, neural control and edge AI — every layer engineered as one system, from silicon to sentiment.",
  bullets: [
    "Neural motion planning at 2 kHz",
    "Edge inference under 8 ms latency",
    "Safety-certified autonomy stack",
  ],
};

/* --------------------------------- Metrics --------------------------------- */

export const metrics = {
  kicker: "Performance",
  title: "Measured, not promised.",
  items: [
    {
      value: 97,
      suffix: "%",
      label: "Efficiency & Accuracy Rate",
      detail:
        "Task-level accuracy across autonomous manipulation cycles in long-duration deployment trials.",
      trackLabel: "ACCURACY",
      trackFill: 97,
    },
    {
      value: 12,
      suffix: "K",
      label: "Active Sensor Nodes",
      detail:
        "Fused vision, tactile and proprioceptive nodes streaming synchronized telemetry every cycle.",
      trackLabel: "SENSORS",
      trackFill: 78,
    },
    {
      value: 30,
      suffix: "+",
      label: "Autonomous Deployments",
      detail:
        "Field deployments across logistics, inspection and human-collaborative manufacturing cells.",
      trackLabel: "DEPLOYMENTS",
      trackFill: 64,
    },
  ],
};

/* ------------------------------ Product stack ------------------------------ */

export const stack = {
  kicker: "Hardware",
  title: "Touching tomorrow, today",
  lead: "A layered family of hand-held intelligence — every device a window into the same fused nervous system.",
  devices: [
    {
      name: "Machina One",
      role: "Neural companion phone",
      copy: "Edge AI flagship with on-device foundation models and a live sensor fabric.",
    },
    {
      name: "Machina Lens",
      role: "Holographic data lens",
      copy: "Spatial dashboards and real-time telemetry, rendered where your hands already are.",
    },
    {
      name: "Machina Pod",
      role: "Tactical AI controller",
      copy: "Mission control for autonomous fleets — waveforms, orbits and intent in one slab.",
    },
  ],
  partners: {
    label: "Working alongside the machines we admire",
    brands: ["1X", "FOURIER", "Unitree Robotics", "Boston Dynamics"],
  },
};

/* -------------------------------- Newsroom --------------------------------- */
/* Mapped from the previous site's news + insights records. */

export type NewsroomItem = {
  title: string;
  category: string;
  date: string;
  readTime?: string;
  summary: string;
};

export const newsroomCategories = ["All", "News", "AI", "Technology", "Design"];

export const newsroom: NewsroomItem[] = [
  {
    title: "MachinaFusion Labs opens applied-AI research track",
    category: "News",
    date: "2025",
    summary:
      "A dedicated applied-AI track focused on workflow automation for the industries our systems operate in.",
  },
  {
    title: "First autonomous deployment cell enters live operation",
    category: "News",
    date: "2025",
    summary:
      "Our human-collaborative manufacturing cell is now in active use — a first step toward full autonomy.",
  },
  {
    title: "Group engineering standards established",
    category: "News",
    date: "2024",
    summary:
      "A single engineering, safety and design standard now applies across every system built inside the group.",
  },
  {
    title: "Applied AI starts with the workflow, not the model",
    category: "AI",
    date: "2025",
    readTime: "8 min",
    summary:
      "The teams getting real value from AI aren't chasing models — they understand the workflow first.",
  },
  {
    title: "Infrastructure that compounds",
    category: "Technology",
    date: "2025",
    readTime: "6 min",
    summary:
      "The invisible engineering decisions that make every future machine cheaper to build.",
  },
  {
    title: "Designing for the low-bandwidth majority",
    category: "Design",
    date: "2025",
    readTime: "7 min",
    summary:
      "Performance is not a metric — it's access. Engineering experiences that work on every connection.",
  },
];

/* --------------------------------- Contact --------------------------------- */

export const contact = {
  kicker: "Contact",
  title: "Introduce yourself.",
  lead: "Partnerships, deployments, press or the future in general — every message reaches a real person.",
  categories: ["General", "Business", "Partnership", "Investment", "Careers", "Media"],
  channels: [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "Response", value: "Within two business days" },
    { label: "Careers", value: "Available positions — see form" },
  ],
  form: {
    nameLabel: "Your name",
    emailLabel: "Email",
    orgLabel: "Organization (optional)",
    categoryLabel: "Category",
    messageLabel: "Message",
    submit: "Send transmission",
    pending: "Transmitting…",
    successTitle: "Transmission received.",
    successBody: "Thank you — a real person will reply within two business days.",
    error: "Transmission failed. Please try again.",
  },
};

/* --------------------------------- Footer ---------------------------------- */

export const footer = {
  display: "MachinaFusion — where human intuition meets machine intelligence.",
  mission:
    "We build the continuum between human intent and machine actuation: algorithms that reason, hardware that moves, and interfaces that feel.",
  actions: [
    { label: "Download", href: "/MachinaFusion-Company-Snapshot.pdf" },
    { label: "Recruits", href: "#contact" },
  ],
  contact: site.domain,
  legal: `© ${new Date().getFullYear()} MachinaFusion Group. All rights reserved.`,
  nav: nav,
};
