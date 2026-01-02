"use client"

import type React from "react"

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  Users,
  Clock,
  ChevronLeft,
  LogOut,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  FileText,
  TrendingUp,
} from "lucide-react"
import { collection, query, where, type DocumentData } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { Input } from "@/components/ui/input"
import { getDocs } from "firebase/firestore"
import { ProcessForm } from "./process-form"
import type { User } from "firebase/auth"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase"

interface Sector {
  id: string
  name: string
  description: string
}

interface Process extends DocumentData {
  id: string
  numero_processo: string
  interessado: string
  objeto: string
  responsavel: string
  data_entrada_proger: string
  data_saida: string
  status: string
  created_at: any
  tipoDisputa?: "administrativo" | "judicial"
}

interface Setback {
  id: string
  sectorId: string
  dataInicio: string
  dataFim: string
  motivo: string
  created_at: any
}

interface Stats {
  totalProcessos: number
  abertos: number
  fechados: number
  atrasados: number
  duracaoMedia: number
  responsaveisCarga: any[]
  disputasAdministrativas: number
  disputasJudiciais: number
  percentualFechados: number
}

interface SectorDashboardProps {
  sector: {
    id: string
    name: string
    description: string
  }
  user: User | null
  sectorId: string // Added sectorId prop
}

export function SectorDashboard({ sector, user, sectorId }: SectorDashboardProps) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const db = getFirebaseDb()
  const [showForm, setShowForm] = useState(false)
  const [setbacks, setSetbacks] = useState<Setback[]>([])
  const [showSetbackForm, setShowSetbackForm] = useState(false)
  const [setbackFormData, setSetbackFormData] = useState({
    dataInicio: "",
    dataFim: "",
    motivo: "",
  })

  const delayThreshold = sectorId === "licensing" ? 45 : 30

  const stats = useMemo(() => {
    const totalProcessos = processes.length
    const abertos = processes.filter((p) => !p.data_saida).length
    const fechados = processes.filter((p) => p.data_saida).length
    const atrasados = processes.filter((p) => isProcessOverdue(p) && !p.data_saida).length

    const duracaoMedia =
      fechados > 0
        ? Math.round(
            processes
              .filter((p) => p.data_saida && p.data_entrada_proger)
              .reduce((sum, p) => {
                const inicio = new Date(p.data_entrada_proger).getTime()
                const fim = new Date(p.data_saida).getTime()
                return sum + Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24))
              }, 0) / fechados,
          )
        : 0

    const responsaveis = [...new Set(processes.map((p) => p.responsavel))]
    const responsaveisCarga = responsaveis.map((resp) => ({
      name: resp,
      count: processes.filter((p) => p.responsavel === resp).length,
    }))

    const disputasAdministrativas =
      sectorId === "legal_disputes" ? processes.filter((p) => p.tipoDisputa === "administrativo").length : 0
    const disputasJudiciais =
      sectorId === "legal_disputes" ? processes.filter((p) => p.tipoDisputa === "judicial").length : 0

    return {
      totalProcessos,
      abertos,
      fechados,
      atrasados,
      duracaoMedia,
      responsaveisCarga,
      disputasAdministrativas,
      disputasJudiciais,
      percentualFechados: totalProcessos > 0 ? Math.round((fechados / totalProcessos) * 100) : 0,
    }
  }, [processes, sectorId])

  const isProcessOverdue = (process: Process): boolean => {
    const agora = new Date().getTime()
    const entrada = new Date(process.data_entrada_proger).getTime()
    const diasAbertos = Math.floor((agora - entrada) / (1000 * 60 * 60 * 24))
    return diasAbertos > delayThreshold
  }

  useEffect(() => {
    if (!user) return

    const fetchProcesses = async () => {
      try {
        const processesRef = collection(db, "processes")
        const q = query(processesRef, where("sector_id", "==", sectorId), where("user_id", "==", user.uid))
        const snapshot = await getDocs(q)
        const processesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Process[]
        setProcesses(processesData)
        setFilteredProcesses(processesData)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao buscar processos:", error)
      }
    }

    const fetchSetbacks = async () => {
      try {
        const setbacksRef = collection(db, "setbacks")
        const q = query(setbacksRef, where("sectorId", "==", sectorId), where("user_id", "==", user.uid))
        const snapshot = await getDocs(q)
        const setbacksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Setback[]
        setSetbacks(setbacksData.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime()))
      } catch (error) {
        console.error("Erro ao buscar contratempos:", error)
      }
    }

    fetchProcesses()
    fetchSetbacks()
  }, [user, sectorId])

  useEffect(() => {
    const filtered = processes.filter((p) => {
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "abertos" && !p.data_saida) ||
        (statusFilter === "fechados" && p.data_saida) ||
        (statusFilter === "atrasados" && isProcessOverdue(p) && !p.data_saida)

      const matchesSearch =
        p.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.interessado.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })
    setFilteredProcesses(filtered)
  }, [processes, statusFilter, searchTerm])

  const handleProcessCreated = (newProcess: Process) => {
    setProcesses([...processes, newProcess])
    setFilteredProcesses([...filteredProcesses, newProcess])
  }

  const handleSetbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !setbackFormData.dataInicio || !setbackFormData.dataFim || !setbackFormData.motivo) return

    try {
      const setbacksRef = collection(db, "setbacks")
      const newSetback = {
        sectorId,
        user_id: user.uid,
        dataInicio: setbackFormData.dataInicio,
        dataFim: setbackFormData.dataFim,
        motivo: setbackFormData.motivo,
        created_at: new Date().toISOString(),
      }

      const { addDoc } = await import("firebase/firestore")
      const docRef = await addDoc(setbacksRef, newSetback)

      setSetbacks([{ id: docRef.id, ...newSetback }, ...setbacks])
      setSetbackFormData({ dataInicio: "", dataFim: "", motivo: "" })
      setShowSetbackForm(false)
    } catch (error) {
      console.error("Erro ao registrar contratempo:", error)
    }
  }

  const handleLogout = async () => {
    await signOut(getFirebaseAuth())
    router.push("/auth/login")
  }

  const exportToCSV = () => {
    const csvData = [
      ["Relatório de Estatísticas - " + sector.name],
      [""],
      ["Métrica", "Valor"],
      ["Total de Processos", stats.totalProcessos.toString()],
      ["Processos Abertos", stats.abertos.toString()],
      ["Processos Fechados", stats.fechados.toString()],
      ["Processos Atrasados", stats.atrasados.toString()],
      ["Média de Duração (dias)", stats.duracaoMedia.toString()],
      ["Percentual Concluídos", stats.percentualFechados.toString() + "%"],
      ["Total de Responsáveis", stats.responsaveisCarga.length.toString()],
      [""],
      ["Desempenho da Equipe"],
      ["Responsável", "Quantidade de Processos"],
      ...stats.responsaveisCarga.map((item) => [item.name, item.count.toString()]),
    ]

    if (sectorId === "legal_disputes") {
      csvData.push(
        [""],
        ["Tipos de Disputa"],
        ["Administrativos", stats.disputasAdministrativas.toString()],
        ["Judiciais", stats.disputasJudiciais.toString()],
      )
    }

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `relatorio_${sector.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDFReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório ${sector.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #2563eb; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
          .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #2563eb; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Desempenho - ${sector.name}</h1>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
        
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.totalProcessos}</div>
            <div class="stat-label">Total de Processos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.duracaoMedia}</div>
            <div class="stat-label">Média de Duração (dias)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.atrasados}</div>
            <div class="stat-label">Processos Atrasados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.percentualFechados}%</div>
            <div class="stat-label">Taxa de Conclusão</div>
          </div>
        </div>

        <h2>Desempenho da Equipe</h2>
        <table>
          <thead>
            <tr>
              <th>Responsável</th>
              <th>Processos Atribuídos</th>
            </tr>
          </thead>
          <tbody>
            ${stats.responsaveisCarga.map((item) => `<tr><td>${item.name}</td><td>${item.count}</td></tr>`).join("")}
          </tbody>
        </table>

        ${
          sectorId === "legal_disputes"
            ? `
        <h2>Tipos de Disputa</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Administrativos</td><td>${stats.disputasAdministrativas}</td></tr>
            <tr><td>Judiciais</td><td>${stats.disputasJudiciais}</td></tr>
          </tbody>
        </table>
        `
            : ""
        }

        <div class="footer">
          <p>IPAM - Instituto de Previdência e Assistência dos Servidores do Município de Porto Velho</p>
          <p>Relatório gerado automaticamente - Dados agregados do setor</p>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([reportContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url, "_blank")
    if (newWindow) {
      newWindow.addEventListener("load", () => {
        setTimeout(() => {
          newWindow.print()
        }, 500)
      })
    }
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/sectors")}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <img src="https://ipam.portovelho.ro.gov.br/assets/site/img/logos/IPAM.png" alt="IPAM" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{sector.name}</h1>
              <p className="text-sm text-gray-600">{sector.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats.atrasados > 0 && (
              <div className="relative">
                <Button variant="outline" className="border-red-400 text-red-600 hover:bg-red-50 bg-transparent">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {stats.atrasados} Atrasados
                </Button>
              </div>
            )}
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="border-green-400 text-green-600 hover:bg-green-50 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={generatePDFReport}
              variant="outline"
              className="border-blue-400 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório PDF
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Modal/Overlay para o formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Registrar Novo Processo</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ProcessForm
                sectorId={sectorId}
                userId={user?.uid || ""}
                onProcessCreated={(newProcess) => {
                  handleProcessCreated(newProcess)
                  setShowForm(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showSetbackForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Registrar Contratempo</h3>
              <button onClick={() => setShowSetbackForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSetbackSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <Input
                    type="date"
                    value={setbackFormData.dataInicio}
                    onChange={(e) => setSetbackFormData({ ...setbackFormData, dataInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <Input
                    type="date"
                    value={setbackFormData.dataFim}
                    onChange={(e) => setSetbackFormData({ ...setbackFormData, dataFim: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (ex: férias, viagem a trabalho, etc.)
                </label>
                <Input
                  type="text"
                  placeholder="Descreva o motivo do contratempo"
                  value={setbackFormData.motivo}
                  onChange={(e) => setSetbackFormData({ ...setbackFormData, motivo: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowSetbackForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Registrar Contratempo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalProcessos}</div>
                <div className="text-sm text-gray-600">Total de Processos</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.abertos} abertos • {stats.fechados} fechados
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 mb-2">{stats.duracaoMedia}</div>
                <div className="text-sm text-gray-600">Média Duração</div>
                <div className="text-xs text-gray-500 mt-1">dias com responsável</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 mb-2">{stats.atrasados}</div>
                <div className="text-sm text-gray-600">Atrasados</div>
                <div className="text-xs text-gray-500 mt-1">
                  {">"} {delayThreshold} dias abertos
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 mb-2">{stats.responsaveisCarga.length}</div>
                <div className="text-sm text-gray-600">Responsáveis</div>
                <div className="text-xs text-gray-500 mt-1">pessoas na equipe</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-teal-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800 mb-2">{stats.percentualFechados}%</div>
                <div className="text-sm text-gray-600">Concluídos</div>
                <div className="text-xs text-gray-500 mt-1">{stats.fechados} processos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Contratempos Registrados
              </CardTitle>
              <Button onClick={() => setShowSetbackForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Contratempo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {setbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum contratempo registrado para este setor.</div>
            ) : (
              <div className="space-y-3">
                {setbacks.map((setback) => (
                  <div
                    key={setback.id}
                    className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-orange-700">
                          {new Date(setback.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(setback.dataFim).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{setback.motivo}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil(
                        (new Date(setback.dataFim).getTime() - new Date(setback.dataInicio).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      dias
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispute type statistics card for legal disputes */}
        {sectorId === "legal_disputes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{stats.disputasAdministrativas}</div>
                  <div className="text-sm text-gray-600">Administrativos</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{stats.disputasJudiciais}</div>
                  <div className="text-sm text-gray-600">Judiciais</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredProcesses.length > 0 && (
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendência de Processos por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {/* Simple bar chart visualization */}
                {(() => {
                  const monthCounts = processes.reduce((acc: Record<string, number>, p) => {
                    const month = new Date(p.data_entrada_proger).toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "short",
                    })
                    acc[month] = (acc[month] || 0) + 1
                    return acc
                  }, {})

                  const months = Object.keys(monthCounts).slice(-6)
                  const maxCount = Math.max(...Object.values(monthCounts))

                  return (
                    <div className="flex items-end justify-around h-full gap-2">
                      {months.map((month) => (
                        <div key={month} className="flex flex-col items-center flex-1">
                          <div className="text-xs font-semibold text-primary mb-2">{monthCounts[month]}</div>
                          <div
                            className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${(monthCounts[month] / maxCount) * 100}%` }}
                          ></div>
                          <div className="text-xs text-muted-foreground mt-2 rotate-45 origin-left">{month}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredProcesses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Object distribution chart */}
            {/* Processos por mês chart */}
          </div>
        )}

        {stats.responsaveisCarga.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-primary">Desempenho da Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.responsaveisCarga.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(item.count / Math.max(...stats.responsaveisCarga.map((d) => d.count))) * 100}%`,
                            background: "linear-gradient(90deg, #2563eb, #10b981)",
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-6 text-right text-primary">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center pt-4">
          <h2 className="text-xl font-bold text-primary">Processos Registrados</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Novo Processo
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Carregando processos...</div>
        ) : filteredProcesses.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Processo</TableHead>
                  <TableHead>Interessado</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Entrada</TableHead>
                  {sectorId === "legal_disputes" && <TableHead>Tipo</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map((process) => (
                  <TableRow key={process.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{process.numero_processo}</TableCell>
                    <TableCell>{process.interessado}</TableCell>
                    <TableCell>{process.objeto}</TableCell>
                    <TableCell>{process.responsavel}</TableCell>
                    <TableCell>{new Date(process.data_entrada_proger).toLocaleDateString()}</TableCell>
                    {sectorId === "legal_disputes" && (
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            process.tipoDisputa === "judicial"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {process.tipoDisputa === "judicial" ? "Judicial" : "Administrativo"}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          isProcessOverdue(process) && !process.data_saida
                            ? "bg-red-100 text-red-800"
                            : process.data_saida
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isProcessOverdue(process) && !process.data_saida
                          ? "Atrasado"
                          : process.data_saida
                            ? "Fechado"
                            : "Aberto"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum processo encontrado para os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
