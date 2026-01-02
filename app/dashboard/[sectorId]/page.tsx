"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SectorDashboard } from "@/components/sector-dashboard"
import { getFirebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

interface SectorInfo {
  id: string
  name: string
  description: string
}

const SECTOR_MAP: Record<string, SectorInfo> = {
  licensing: {
    id: "licensing",
    name: "Licenciamento",
    description: "Processos de emissão e gestão de licenças",
  },
  pensions: {
    id: "pensions",
    name: "Pensões",
    description: "Gestão de fundos de pensão e benefícios",
  },
  legal_disputes: {
    id: "legal_disputes",
    name: "Disputas Legais",
    description: "Resolução de casos legais e disputas",
  },
  medical_assistance: {
    id: "medical_assistance",
    name: "Assistência Médica",
    description: "Programas de saúde e assistência médica",
  },
}

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getFirebaseAuth()
  const sectorId = params.sectorId as string

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
      } else {
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [auth, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const sector = SECTOR_MAP[sectorId]

  if (!sector) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="text-center">
          <p className="text-muted-foreground">Setor não encontrado</p>
        </div>
      </div>
    )
  }

  return <SectorDashboard sector={sector} user={user} sectorId={sectorId} />
}
