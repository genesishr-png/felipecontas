"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/sectors")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao entrar no sistema"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-secondary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-40"></div>

      <div className="absolute top-8 right-8">
        <Image
          src="https://ipam.portovelho.ro.gov.br/assets/site/img/logos/IPAM.png"
          alt="IPAM Logo"
          width={240}
          height={240}
          className="opacity-70 hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="https://ipam.portovelho.ro.gov.br/assets/site/img/logos/IPAM.png"
                alt="Logo IPAM"
                width={320}
                height={320}
                className="opacity-95 hover:opacity-100 transition-opacity drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Painel de Performance
            </h1>
            <p className="text-muted-foreground">Sistema de Gestão de Performance</p>
          </div>

          <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Entrar</CardTitle>
              <CardDescription>Digite suas credenciais para acessar o painel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-primary/20 focus:border-primary bg-background/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-primary/20 focus:border-primary bg-background/50"
                    />
                  </div>
                  {error && (
                    <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm border border-destructive/20">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-primary font-semibold underline underline-offset-4 hover:text-secondary transition-colors"
                >
                  Registre-se
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
