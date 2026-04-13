"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// INLINE STYLES — same design tokens as CinematicFooter / ToolsSection
// ---------------------------------------------------------------------------
const STYLES = `
.all-tools-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

.at-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right,  color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
}

.at-aurora {
  background: radial-gradient(
    ellipse at 60% 10%,
    color-mix(in oklch, var(--primary) 8%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 5%, transparent) 50%,
    transparent 70%
  );
}

.at-glass-card {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.at-glass-card:hover {
  border-color: var(--pill-border-hover);
  box-shadow: 0 20px 50px -10px var(--pill-shadow), inset 0 1px 1px var(--pill-highlight);
}

.at-search-input {
  background: color-mix(in oklch, var(--foreground) 3%, transparent);
  border: 1px solid var(--pill-border);
  outline: none;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.at-search-input:focus {
  border-color: color-mix(in oklch, var(--foreground) 25%, transparent);
  background: color-mix(in oklch, var(--foreground) 5%, transparent);
}

.at-filter-pill {
  border: 1px solid var(--pill-border);
  background: color-mix(in oklch, var(--foreground) 3%, transparent);
  transition: all 0.2s ease;
  cursor: pointer;
}

.at-filter-pill:hover {
  border-color: var(--pill-border-hover);
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
}

.at-filter-pill-active {
  background: color-mix(in oklch, var(--foreground) 90%, transparent) !important;
  border-color: transparent !important;
  color: var(--background) !important;
}

.at-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 50%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.at-cap-badge {
  background: color-mix(in oklch, var(--foreground) 5%, transparent);
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
}

.at-badge-IMAGE { background: oklch(0.44 0.19 280); color: white; }
.at-badge-VIDEO { background: oklch(0.55 0.18 200); color: white; }
.at-badge-DATA  { background: oklch(0.44 0.19 280); color: white; }
.at-badge-CODE  { background: oklch(0.50 0.16 150); color: white; }
.at-badge-AUDIO { background: oklch(0.65 0.16 65);  color: white; }

.at-run-btn {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2) 100%);
  border-top: 1px solid var(--pill-border);
  transition: background 0.3s ease, letter-spacing 0.3s ease;
}

.at-run-btn:hover {
  background: color-mix(in oklch, var(--foreground) 10%, transparent);
  letter-spacing: 0.35em;
}

.at-back-btn {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.at-back-btn:hover {
  border-color: var(--pill-border-hover);
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
}

.at-divider {
  border-color: color-mix(in oklch, var(--foreground) 6%, transparent);
}
`;

// ---------------------------------------------------------------------------
// TYPES & DATA
// ---------------------------------------------------------------------------
type ToolCategory = "IMAGE" | "VIDEO" | "DATA" | "CODE" | "AUDIO";

interface Tool {
  provider: string;
  name: string;
  icon: React.ReactNode;
  category: ToolCategory;
  price: string;
  priceUnit: string;
  maxRes: string;
  maxDur: string;
  capabilities: string[];
  description: string;
}

const ALL_CATEGORIES: ToolCategory[] = ["IMAGE", "VIDEO", "DATA", "CODE", "AUDIO"];

// Brand icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);
const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zm-9.66-4.126a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const ExaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#1D4ED8" />
    <path d="M6 8h12M6 12h8M6 16h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const AnthropicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0H10.172L16.742 20H13.139L6.569 3.52z" />
  </svg>
);
const StabilityIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 12h8M12 8v8" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" />
  </svg>
);
const ElevenLabsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <rect x="3" y="4" width="4" height="16" rx="1" />
    <rect x="10" y="4" width="4" height="16" rx="1" />
    <rect x="17" y="4" width="4" height="16" rx="1" />
  </svg>
);

const ALL_TOOLS: Tool[] = [
  {
    provider: "google",   name: "nano-banana",  icon: <GoogleIcon />,    category: "IMAGE",
    price: "$0.05/image", priceUnit: "image",   maxRes: "2048x2048",      maxDur: "—",
    capabilities: ["text-to-image", "image-to-image"],
    description: "Fast image generation with image input support",
  },
  {
    provider: "openai",   name: "sora-2",       icon: <OpenAIIcon />,    category: "VIDEO",
    price: "$0.12/sec",   priceUnit: "second",  maxRes: "—",              maxDur: "12s",
    capabilities: ["text-to-video", "image-to-video"],
    description: "Text/image-to-video with synchronized audio, dialogue, and sound effects",
  },
  {
    provider: "twitter",  name: "trends",       icon: <XIcon />,         category: "DATA",
    price: "$0.01",       priceUnit: "call",    maxRes: "—",              maxDur: "—",
    capabilities: ["research"],
    description: "Get trending topics for a location by WOEID (1=Worldwide, 23424977=US, 2459115=NYC)",
  },
  {
    provider: "exa",      name: "search",       icon: <ExaIcon />,       category: "DATA",
    price: "$0.01",       priceUnit: "call",    maxRes: "—",              maxDur: "—",
    capabilities: ["research"],
    description: "Semantic web search",
  },
  {
    provider: "anthropic",name: "claude-opus",  icon: <AnthropicIcon />, category: "CODE",
    price: "$0.015/1k",   priceUnit: "tokens",  maxRes: "—",              maxDur: "—",
    capabilities: ["code-generation", "reasoning", "analysis"],
    description: "State-of-the-art model for complex reasoning, coding, and long-context tasks",
  },
  {
    provider: "stability",name: "ultra",        icon: <StabilityIcon />, category: "IMAGE",
    price: "$0.08/image", priceUnit: "image",   maxRes: "4096x4096",      maxDur: "—",
    capabilities: ["text-to-image", "inpainting"],
    description: "Photorealistic image generation with ultra-high resolution support",
  },
  {
    provider: "elevenlabs",name: "turbo-v2",   icon: <ElevenLabsIcon />,category: "AUDIO",
    price: "$0.003/char",  priceUnit: "char",   maxRes: "—",              maxDur: "—",
    capabilities: ["text-to-speech", "voice-cloning"],
    description: "Ultra-low latency text-to-speech with 32 languages and voice cloning",
  },
  {
    provider: "openai",   name: "whisper",      icon: <OpenAIIcon />,    category: "AUDIO",
    price: "$0.006/min",  priceUnit: "min",     maxRes: "—",              maxDur: "—",
    capabilities: ["speech-to-text", "transcription"],
    description: "High accuracy automatic speech recognition in 99 languages",
  },
];

// ---------------------------------------------------------------------------
// TOOL CARD
// ---------------------------------------------------------------------------
function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="at-glass-card rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b at-divider">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-foreground"
            style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}
          >
            {tool.icon}
          </div>
          <span className="font-mono text-sm">
            <span className="text-muted-foreground">{tool.provider}/</span>
            <span className="text-foreground font-bold">{tool.name}</span>
          </span>
        </div>
        <span className={`text-[9px] font-black tracking-[0.2em] px-2.5 py-1 rounded-md at-badge-${tool.category}`}>
          {tool.category}
        </span>
      </div>

      {/* Meta */}
      <div className="px-5 py-4 flex flex-col gap-2 border-b at-divider">
        {[
          { label: "Price",   value: <><span className="text-foreground font-mono text-sm">{tool.price}</span>{" "}<span className="text-muted-foreground font-mono text-xs">{tool.priceUnit}</span></> },
          { label: "Max Res", value: <span className="text-foreground font-mono text-sm">{tool.maxRes}</span> },
          { label: "Max Dur", value: <span className="text-foreground font-mono text-sm">{tool.maxDur}</span> },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
            {value}
          </div>
        ))}
      </div>

      {/* Capabilities */}
      <div className="px-5 py-4 border-b at-divider">
        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground block mb-2.5">Capabilities</span>
        <div className="flex flex-wrap gap-2">
          {tool.capabilities.map((cap) => (
            <span key={cap} className="at-cap-badge font-mono text-xs text-foreground px-2.5 py-1 rounded-lg">
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-4 flex-1 border-b at-divider">
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
      </div>

      {/* RUN */}
      <button type="button" className="at-run-btn w-full py-4 font-mono text-xs font-black tracking-[0.3em] uppercase text-foreground">
        Run
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default function AllToolsPage() {
  const [query, setQuery]               = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "ALL">("ALL");

  const filtered = useMemo(() => {
    return ALL_TOOLS.filter((t) => {
      const matchCat = activeCategory === "ALL" || t.category === activeCategory;
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        t.name.includes(q) ||
        t.provider.includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.capabilities.some((c) => c.includes(q));
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="all-tools-wrapper relative min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Ambient layers */}
        <div className="at-aurora absolute inset-0 pointer-events-none" />
        <div className="at-bg-grid absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/"
              className="at-back-btn flex items-center gap-2.5 px-5 py-2.5 rounded-full font-mono text-xs font-bold tracking-[0.15em] uppercase text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m0 0l7 7m-7-7l7-7" />
              </svg>
              Back
            </Link>

            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground">
              {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Tools &nbsp;/&nbsp; Agent Marketplace
            </p>
            <h1 className="at-text-glow text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] text-balance mb-3">
              All Tools
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              Browse, search and run every tool available to your agents.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search tools, providers, capabilities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="at-search-input w-full pl-10 pr-4 py-3 rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground"
                aria-label="Search tools"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {(["ALL", ...ALL_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`at-filter-pill px-4 py-2 rounded-full font-mono text-xs font-bold tracking-[0.15em] uppercase text-foreground ${activeCategory === cat ? "at-filter-pill-active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((tool) => (
                <ToolCard key={`${tool.provider}/${tool.name}`} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="font-mono text-muted-foreground text-sm tracking-widest uppercase">No tools found</p>
              <button
                type="button"
                onClick={() => { setQuery(""); setActiveCategory("ALL"); }}
                className="at-back-btn px-5 py-2.5 rounded-full font-mono text-xs font-bold tracking-[0.15em] uppercase text-foreground"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
