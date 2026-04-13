"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ---------------------------------------------------------------------------
// INLINE STYLES — same design language as CinematicFooter
// ---------------------------------------------------------------------------
const STYLES = `
.tools-section-wrapper {
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

/* Shared glass card */
.tools-glass-card {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.tools-glass-card:hover {
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 50px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight);
}

/* Background grid — same as footer */
.tools-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right,  color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

/* Aurora glow */
.tools-aurora {
  background: radial-gradient(
    ellipse at 60% 30%,
    color-mix(in oklch, var(--primary) 8%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 6%, transparent) 50%,
    transparent 70%
  );
}

/* Metallic heading gradient — same as footer */
.tools-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 50%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 16px color-mix(in oklch, var(--foreground) 12%, transparent));
}

/* RUN button */
.tools-run-btn {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2) 100%);
  border-top: 1px solid var(--pill-border);
  transition: background 0.3s ease, letter-spacing 0.3s ease;
}

.tools-run-btn:hover {
  background: color-mix(in oklch, var(--foreground) 10%, transparent);
  letter-spacing: 0.35em;
}

/* Capability badge */
.tools-cap-badge {
  background: color-mix(in oklch, var(--foreground) 5%, transparent);
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.tools-cap-badge:hover {
  background: color-mix(in oklch, var(--foreground) 12%, transparent);
  border-color: color-mix(in oklch, var(--foreground) 25%, transparent);
}

/* Category badge */
.tools-badge-image  { background: oklch(0.44 0.19 280); color: white; }
.tools-badge-video  { background: oklch(0.55 0.18 200); color: white; }
.tools-badge-data   { background: oklch(0.44 0.19 280); color: white; }
.tools-badge-code   { background: oklch(0.50 0.16 150); color: white; }
.tools-badge-audio  { background: oklch(0.65 0.16 65);  color: white; }

/* View all button */
.tools-view-all-btn {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.tools-view-all-btn:hover {
  border-color: var(--pill-border-hover);
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
  letter-spacing: 0.25em;
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
  prompt: string;
  outputExample?: string;
}

const categoryBadgeClass: Record<ToolCategory, string> = {
  IMAGE: "tools-badge-image",
  VIDEO: "tools-badge-video",
  DATA:  "tools-badge-data",
  CODE:  "tools-badge-code",
  AUDIO: "tools-badge-audio",
};

// Brand icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zm-9.66-4.126a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ExaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#1D4ED8" />
    <path d="M6 8h12M6 12h8M6 16h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const tools: Tool[] = [
  {
    provider: "stellar",
    name: "generate-image",
    icon: <GoogleIcon />,
    category: "IMAGE",
    price: "0.05 USDC",
    priceUnit: "image",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["text-to-image", "Gemini (Nano Banana)"],
    description: "Fast image generation (Nano Banana / Gemini) via local MPP-paid endpoint.",
    prompt: `POST http://localhost:3000/tools/generate-image
Headers: Content-Type: application/json
Body: { "prompt": "A futuristic city on the Stellar blockchain at sunset, neon lights, drones, wide angle" }
Payment: MPP x402 handled by agent wallet (0.05 USDC per image). Use the agent wallet flow to pay and retry.`,
    outputExample: "{ imageBase64: \"data:image/png;base64,...\", textResponse: \"caption\" }",
  },
  {
    provider: "stellar",
    name: "crypto-price",
    icon: <OpenAIIcon />,
    category: "DATA",
    price: "0.005 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["real-time price", "24h change", "market cap"],
    description: "Real crypto prices via CoinGecko (paid with MPP).",
    prompt: `GET http://localhost:3000/tools/crypto-price?symbol=xlm
Payment: MPP x402 handled by agent wallet (0.005 USDC per call).`,
    outputExample: "{ symbol: \"XLM\", price: 0.12, change24h: \"-0.25%\" }",
  },
  {
    provider: "stellar",
    name: "wiki-summary",
    icon: <ExaIcon />,
    category: "DATA",
    price: "0.01 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["summary", "multilingual"],
    description: "Wikipedia article summaries with links and thumbnails.",
    prompt: `GET http://localhost:3000/tools/wiki-summary?topic=Stellar_(payment_network)&lang=en
Payment: MPP x402 handled by agent wallet (0.01 USDC per call).`,
    outputExample: "{ title: \"Stellar\", summary: \"...\" }",
  },
  {
    provider: "stellar",
    name: "country-info",
    icon: <ExaIcon />,
    category: "DATA",
    price: "0.005 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["country metadata", "flags", "currencies", "languages"],
    description: "RestCountries data: capital, population, currency, languages, flag.",
    prompt: `GET http://localhost:3000/tools/country-info?name=Brazil
Payment: MPP x402 handled by agent wallet (0.005 USDC per call).`,
    outputExample: "{ capital: \"Brasília\", flag: \"https://...png\" }",
  },
  {
    provider: "stellar",
    name: "random-joke",
    icon: <GoogleIcon />,
    category: "DATA",
    price: "0.001 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["jokes", "multi-language"],
    description: "Random JokeAPI v2 with language selection.",
    prompt: `GET http://localhost:3000/tools/random-joke?lang=en
Payment: MPP x402 handled by agent wallet (0.001 USDC per call).`,
    outputExample: "{ joke: \"...\" }",
  },
  {
    provider: "stellar",
    name: "dad-joke",
    icon: <GoogleIcon />,
    category: "DATA",
    price: "0.001 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["dad jokes", "search term"],
    description: "icanhazdadjoke with optional search term.",
    prompt: `GET http://localhost:3000/tools/dad-joke?search=computer
Payment: MPP x402 handled by agent wallet (0.001 USDC per call).`,
    outputExample: "{ joke: \"...\" }",
  },
  {
    provider: "stellar",
    name: "weather",
    icon: <OpenAIIcon />,
    category: "DATA",
    price: "0.005 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["current weather", "temperature", "humidity", "wind"],
    description: "Open-Meteo real-time weather for any coordinates/city.",
    prompt: `GET http://localhost:3000/tools/weather?city=Sao%20Paulo&lat=-23.55&lon=-46.63
Payment: MPP x402 handled by agent wallet (0.005 USDC per call).`,
    outputExample: "{ temperature: \"25°C\", condition: \"Clear\" }",
  },
  {
    provider: "stellar",
    name: "exchange-rate",
    icon: <OpenAIIcon />,
    category: "DATA",
    price: "0.003 USDC",
    priceUnit: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["FX rate", "timestamp"],
    description: "ExchangeRate API live FX (e.g., USD→BRL).",
    prompt: `GET http://localhost:3000/tools/exchange-rate?from=USD&to=BRL
Payment: MPP x402 handled by agent wallet (0.003 USDC per call).`,
    outputExample: "{ rate: 5.12, example: \"1 USD = 5.12 BRL\" }",
  },
];

// ---------------------------------------------------------------------------
// TOOL CARD
// ---------------------------------------------------------------------------
function ToolCard({ tool, index, onRun }: { tool: Tool; index: number; onRun: (tool: Tool) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 88%",
            end: "top 50%",
            scrub: false,
            once: true,
          },
          delay: (index % 2) * 0.12,
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="tools-glass-card rounded-2xl overflow-hidden flex flex-col opacity-0"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-foreground"
            style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)" }}
          >
            {tool.icon}
          </div>
          <span className="font-mono text-sm">
            <span className="text-muted-foreground">{tool.provider}/</span>
            <span className="text-foreground font-bold">{tool.name}</span>
          </span>
        </div>
        <span className={`text-[9px] font-black tracking-[0.25em] px-2.5 py-1 rounded-md ${categoryBadgeClass[tool.category]}`}>
          {tool.category}
        </span>
      </div>

      {/* Meta rows */}
      <div className="px-5 py-4 flex flex-col gap-2.5" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
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
      <div className="px-5 py-4" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground block mb-3">
          Capabilities
        </span>
        <div className="flex flex-wrap gap-2">
          {tool.capabilities.map((cap) => (
            <span
              key={cap}
              className="tools-cap-badge font-mono text-xs text-foreground px-2.5 py-1 rounded-lg cursor-default"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-4 flex-1" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* RUN */}
      <button
        type="button"
        onClick={() => onRun(tool)}
        className="tools-run-btn w-full py-4 font-mono text-xs font-black tracking-[0.3em] uppercase text-foreground text-center"
      >
        Run
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function ToolsSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleRun = async (tool: Tool) => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(tool.prompt);
    } catch (err: any) {
      setCopyError("Could not copy to clipboard automatically.");
    }
    setActiveTool(tool);
  };

  const closeModal = () => {
    setActiveTool(null);
    setCopyError(null);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <section
        ref={sectionRef}
        className="tools-section-wrapper relative w-full bg-background overflow-hidden py-24 px-6 md:px-12"
      >
        {/* Background ambient layer */}
        <div className="tools-aurora absolute inset-0 pointer-events-none" />
        <div className="tools-bg-grid  absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">

          {/* Section header */}
          <div
            ref={headingRef}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 opacity-0"
          >
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Tools &nbsp;/&nbsp; Agent Marketplace
              </p>
              <h2 className="tools-text-glow text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] text-balance mb-4">
                The best tools handpicked<br className="hidden md:block" /> for super-agents
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg">
                Do previously impossible tasks by using paid tools (for free).
              </p>
            </div>

            <Link
              href="/tools"
              className="tools-view-all-btn self-start md:self-end shrink-0 px-6 py-3 rounded-full font-mono text-xs font-black tracking-[0.2em] uppercase text-foreground"
            >
              View All Tools
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tools.map((tool, i) => (
              <ToolCard key={`${tool.provider}/${tool.name}`} tool={tool} index={i} onRun={handleRun} />
            ))}
          </div>

        </div>
      </section>

      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-black/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  {activeTool.icon}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Prompt copied
                  </p>
                  <h3 className="text-lg font-bold leading-tight">
                    {activeTool.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span className="px-2 py-1 rounded-lg border border-white/15 bg-white/5">
                  {activeTool.price}
                </span>
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-8 w-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:border-white/30 hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {copyError ? (
                <div className="text-sm text-red-300 font-semibold">
                  {copyError} — paste manually from below.
                </div>
              ) : (
                <div className="text-sm text-emerald-300 font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Prompt copied to clipboard
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                  Prompt
                </p>
                <pre className="font-mono text-sm text-foreground bg-white/5 border border-white/10 rounded-xl p-4 whitespace-pre-wrap break-words">
                  {activeTool.prompt}
                </pre>
              </div>

              {activeTool.outputExample && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
                    Expected Output
                  </p>
                  <pre className="font-mono text-sm text-muted-foreground bg-white/5 border border-white/10 rounded-xl p-4 whitespace-pre-wrap break-words">
                    {activeTool.outputExample}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Price
                  </p>
                  <p className="font-mono text-foreground">{activeTool.price}</p>
                </div>
                <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Category
                  </p>
                  <p className="font-mono text-foreground">{activeTool.category}</p>
                </div>
                <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Provider
                  </p>
                  <p className="font-mono text-foreground">{activeTool.provider}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
