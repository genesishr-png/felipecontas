"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import Image from "next/image"
import { getFirebaseAuth } from "@/lib/firebase"
import { signOut, onAuthStateChanged, type User } from "firebase/auth"

interface Sector {
  id: string
  name: string
  description: string
}

const SECTORS: Sector[] = [
  {
    id: "licensing",
    name: "Licenciamento",
    description: "Processos de emissão e gestão de licenças",
  },
  {
    id: "pensions",
    name: "Pensões",
    description: "Gestão de fundos de pensão e benefícios",
  },
  {
    id: "legal_disputes",
    name: "Disputas Legais",
    description: "Resolução de casos legais e disputas",
  },
  {
    id: "medical_assistance",
    name: "Assistência Médica",
    description: "Programas de saúde e assistência médica",
  },
]

const sectorIcons = {
  Licenciamento: "📋",
  Pensões: "💼",
  "Disputas Legais": "⚖️",
  "Assistência Médica": "🏥",
}

export function SectorSelector() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getFirebaseAuth()

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

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando setores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl">
      <div className="flex flex-col items-center gap-6 mb-12">
        <Image
          src="https://ipam.portovelho.ro.gov.br/assets/site/img/logos/IPAM.png"
          alt="Logo IPAM"
          width={450}
          height={450}
          className="opacity-95 hover:opacity-100 transition-opacity drop-shadow-2xl hover:scale-105 duration-300"
        />
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Painel de Performance
          </h1>
          <p className="text-secondary font-semibold mb-2">IPAM - Instituto de Proteção Ambiental de Mossoró</p>
          <p className="text-sm text-muted-foreground">Bem-vindo, {user?.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-foreground">
            Selecione um setor para visualizar e gerenciar dados de desempenho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTORS.map((sector) => (
            <div key={sector.id} onClick={() => router.push(`/dashboard/${sector.id}`)} className="cursor-pointer">
              <Card className="h-full border-0 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:from-secondary/10 hover:to-accent/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-primary">{sector.name}</CardTitle>
                    <span className="text-3xl">{sectorIcons[sector.name as keyof typeof sectorIcons] || "📊"}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sector.description}</p>
                  <div className="mt-4 inline-flex items-center text-primary text-sm font-semibold hover:text-secondary transition-colors">
                    Ver Dashboard →
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-transparent border-2 border-accent text-accent hover:bg-accent/10 hover:border-accent font-semibold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
