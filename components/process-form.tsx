"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getFirebaseDb } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface ProcessFormProps {
  sectorId: string
  userId: string
  onProcessCreated: (process: any) => void
}

export function ProcessForm({ sectorId, userId, onProcessCreated }: ProcessFormProps) {
  const [formData, setFormData] = useState({
    numero_processo: "",
    data_entrada_proger: "",
    interessado: "",
    data_com_responsavel: "",
    objeto: "",
    responsavel: "",
    data_saida: "",
    observacao: "",
    tipoDisputa: "administrativo",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const db = getFirebaseDb()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    console.log("[v0] Starting process registration...")
    console.log("[v0] Form data:", formData)
    console.log("[v0] Sector ID:", sectorId)
    console.log("[v0] User ID:", userId)

    try {
      const requiredFields = [
        "numero_processo",
        "data_entrada_proger",
        "interessado",
        "data_com_responsavel",
        "objeto",
        "responsavel",
      ]
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${field} é obrigatório`)
        }
      }

      console.log("[v0] All required fields validated")
      console.log("[v0] Attempting to save to Firestore...")

      const docRef = await addDoc(collection(db, "processes"), {
        sector_id: sectorId, // Changed from sectorId to sector_id
        user_id: userId, // Changed from userId to user_id
        ...formData,
        status: formData.data_saida ? "closed" : "open",
        created_at: serverTimestamp(),
      })

      console.log("[v0] Process saved successfully with ID:", docRef.id)

      onProcessCreated({
        id: docRef.id,
        ...formData,
        sector_id: sectorId,
        user_id: userId,
        status: formData.data_saida ? "closed" : "open",
      })

      setFormData({
        numero_processo: "",
        data_entrada_proger: "",
        interessado: "",
        data_com_responsavel: "",
        objeto: "",
        responsavel: "",
        data_saida: "",
        observacao: "",
        tipoDisputa: "administrativo",
      })

      console.log("[v0] Form reset, showing success message")

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse z-50"
      successMessage.textContent = "Processo registrado com sucesso!"
      document.body.appendChild(successMessage)
      setTimeout(() => successMessage.remove(), 3000)
    } catch (err: unknown) {
      console.error("[v0] Error saving process:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar processo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Novo Processo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Show type selector only for legal disputes sector */}
            {sectorId === "legal_disputes" && (
              <div className="grid gap-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label htmlFor="tipoDisputa">Tipo de Disputa *</Label>
                <select
                  id="tipoDisputa"
                  name="tipoDisputa"
                  value={formData.tipoDisputa}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="administrativo">Administrativo</option>
                  <option value="judicial">Judicial</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numero_processo">Nº Processo *</Label>
                <Input
                  id="numero_processo"
                  name="numero_processo"
                  placeholder="Ex: 12345/2025"
                  value={formData.numero_processo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="data_entrada_proger">Data de Entrada na PROGER *</Label>
                <Input
                  id="data_entrada_proger"
                  name="data_entrada_proger"
                  type="date"
                  value={formData.data_entrada_proger}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interessado">Interessado *</Label>
                <Input
                  id="interessado"
                  name="interessado"
                  placeholder="Nome da pessoa ou empresa"
                  value={formData.interessado}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="data_com_responsavel">Data com o Responsável *</Label>
                <Input
                  id="data_com_responsavel"
                  name="data_com_responsavel"
                  type="date"
                  value={formData.data_com_responsavel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="objeto">Objeto *</Label>
                <Input
                  id="objeto"
                  name="objeto"
                  placeholder="Descrição do assunto/tipo do processo"
                  value={formData.objeto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <Input
                  id="responsavel"
                  name="responsavel"
                  placeholder="Nome do responsável"
                  value={formData.responsavel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="data_saida">Data de Saída</Label>
                <Input
                  id="data_saida"
                  name="data_saida"
                  type="date"
                  value={formData.data_saida}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                name="observacao"
                placeholder="Anotações adicionais sobre o processo"
                value={formData.observacao}
                onChange={handleChange}
                className="min-h-24"
              />
            </div>

            {error && (
              <div className="flex gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm items-start">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Registrando..." : "Registrar Processo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
