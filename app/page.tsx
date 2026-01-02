"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getFirebaseAuth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth()

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        router.push("/sectors")
      } else {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return null
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30 -ml-48 -mb-48"></div>

      {/* Logo - top right */}
      <div className="absolute top-8 right-8">
        <Image
          src="https://ipam.portovelho.ro.gov.br/assets/site/img/logos/IPAM.png"
          alt="IPAM Logo"
          width={240}
          height={240}
          className="opacity-80 hover:opacity-100 transition-opacity drop-shadow-lg"
        />
      </div>

      <div className="w-full max-w-2xl text-center relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image
              src="https://ipam.portovelho.ro.gov.br/assets/site/img/logos/IPAM.png"
              alt="Logo IPAM"
              width={480}
              height={480}
              className="opacity-95 hover:opacity-100 transition-opacity drop-shadow-2xl hover:scale-105 duration-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Painel de Performance
            </h1>
            <p className="text-lg text-secondary font-semibold">Sistema de Gestão de Performance de Setores</p>
          </div>

          <p className="text-base text-foreground max-w-xl mx-auto leading-relaxed">
            Acompanhe e otimize métricas de desempenho em diversos setores incluindo Licenciamento, Pensões, Disputas
            Legais e Assistência Médica.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
              >
                Registrar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
