"use client"

import { SectorSelector } from "@/components/sector-selector"

export default function SectorsPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-secondary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-40"></div>

      <div className="relative z-10">
        <SectorSelector />
      </div>
    </div>
  )
}
