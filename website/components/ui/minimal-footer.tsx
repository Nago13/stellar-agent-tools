"use client";

import Link from "next/link";

const STYLES = `
.minimal-footer {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  border-top: 1px solid color-mix(in oklch, var(--foreground) 6%, transparent);
}

.minimal-footer-wordmark {
  background: linear-gradient(
    180deg,
    var(--foreground) 0%,
    color-mix(in oklch, var(--foreground) 40%, transparent) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.minimal-footer-github {
  border: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
  background: color-mix(in oklch, var(--foreground) 3%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: border-color 0.25s ease, background 0.25s ease;
}

.minimal-footer-github:hover {
  border-color: color-mix(in oklch, var(--foreground) 20%, transparent);
  background: color-mix(in oklch, var(--foreground) 7%, transparent);
}
`;

export function MinimalFooter() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <footer className="minimal-footer w-full bg-background px-6 md:px-12 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

          {/* Wordmark */}
          <span className="minimal-footer-wordmark font-black text-xl tracking-tight select-none">
            Lumina
          </span>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden sm:block">
              © 2026 Lumina
            </span>

            {/* GitHub */}
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="minimal-footer-github flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold tracking-[0.12em] uppercase text-foreground"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
