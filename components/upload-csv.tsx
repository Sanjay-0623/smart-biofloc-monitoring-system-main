"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react"

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/)
  const header = lines[0].split(",").map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",")
    const obj: Record<string, string> = {}
    header.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()))
    return obj
  })
  return { header, rows }
}

export function UploadCsv() {
  const [processing, setProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    setProcessedCount(0)

    try {
      const text = await file.text()
      const { rows } = parseCsv(text)

      const predictions: { t: string | number; score: number; category: string }[] = []
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const payload = {
          ph: Number(r.ph),
          temperature_c: Number(r.temperature_c),
          ultrasonic_cm: Number(r.ultrasonic_cm),
          turbidity_ntu: Number(r.turbidity_ntu),
        }
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (res.ok) {
          predictions.push({ t: r.timestamp ?? i, score: json.score, category: json.category })
          window.dispatchEvent(new CustomEvent("biofloc:prediction", { detail: json }))
          setProcessedCount(i + 1)
        }
      }

      window.dispatchEvent(new CustomEvent("biofloc:series", { detail: predictions }))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-xl p-6 hover:border-cyan-500/30 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
          <FileSpreadsheet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Upload CSV Log</h3>
          <p className="text-sm text-slate-400">Batch analyze historical data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">Required CSV columns:</p>
          <code className="text-xs text-cyan-400 block">
            timestamp, ph, temperature_c, ultrasonic_cm, turbidity_ntu
          </code>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-slate-400" />
            <p className="text-sm text-slate-400">
              <span className="font-semibold">Click to upload</span> CSV file
            </p>
          </div>
          <input type="file" className="hidden" accept=".csv" onChange={onFile} disabled={processing} />
        </label>

        {processing && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <p className="text-sm text-cyan-400">Processing row {processedCount}...</p>
          </div>
        )}

        <Button
          asChild
          variant="outline"
          className="w-full bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50"
        >
          <a href="/samples/biofloc-sensor-sample.csv" download>
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </a>
        </Button>
      </div>
    </div>
  )
}
