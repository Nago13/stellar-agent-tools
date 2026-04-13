"use client"

import { Banner } from "@/components/ui/banner"
import { ArrowRight, Github } from "lucide-react"
import { useState } from "react"

export function BannerClosable() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Banner 
      variant="muted" 
      className="dark text-foreground sticky top-0 z-50 rounded-none border-b border-white/10"
      isClosable
      onClose={() => setIsVisible(false)}
    >
      <div className="flex grow gap-3">
        <Github
          className="mt-0.5 shrink-0 opacity-60"
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
        <div className="flex grow flex-col justify-center gap-2 md:flex-row md:justify-between md:items-center">
          <p className="text-sm">
            This project is located on localhost; you need to run the API server (node server.js) from the repository to process requests.
          </p>
          <a href="https://github.com/Nago13/stellar-agent-tools" target="_blank" rel="noopener noreferrer" className="group whitespace-nowrap text-sm font-medium flex items-center">
            Access stellar-agent-tools
            <ArrowRight
              className="-mt-0.5 ms-1 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </Banner>
  )
}
