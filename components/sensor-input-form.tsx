"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Activity, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

type Reading = {
  ph: number
  temperature_c: number
  ultrasonic_cm: number
  turbidity_ntu: number
}

const defaultReading: Reading = {
  ph: 7.4,
  temperature_c: 28.0,
  ultrasonic_cm: 80.0,
  turbidity_ntu: 50.0,
}

export function SensorInputForm() {
  const [reading, setReading] = useState<Reading>(defaultReading)
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    score: number
    category: string
    advice: { summary: string; issues: string[]; actions: string[] }
  }>(null)

  async function submit() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reading),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Prediction failed")
      setResult(json)
    } catch (e: any) {
      toast({ title: "Prediction error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function onChange(name: keyof Reading, value: string) {
    setReading((r) => ({ ...r, [name]: Number(value) }))
  }

  return (
    <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-xl p-6 hover:border-cyan-500/30 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Live Sensor Readings</h3>
          <p className="text-sm text-slate-400">Enter current water quality parameters</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            label="pH Level"
            value={reading.ph}
            onChange={(v) => onChange("ph", v)}
            step="0.01"
            min="0"
            max="14"
            icon="💧"
          />
          <LabeledInput
            label="Temperature (°C)"
            value={reading.temperature_c}
            onChange={(v) => onChange("temperature_c", v)}
            step="0.1"
            min="0"
            max="50"
            icon="🌡️"
          />
          <LabeledInput
            label="Water Level (cm)"
            value={reading.ultrasonic_cm}
            onChange={(v) => onChange("ultrasonic_cm", v)}
            step="0.1"
            min="0"
            max="200"
            icon="📏"
          />
          <LabeledInput
            label="Turbidity (NTU)"
            value={reading.turbidity_ntu}
            onChange={(v) => onChange("turbidity_ntu", v)}
            step="0.1"
            min="0"
            max="1000"
            icon="🌊"
          />
        </div>

        <Button
          onClick={submit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Water Quality...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Analyze Water Quality
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 backdrop-blur animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Quality Score</div>
                <div className="text-3xl font-bold text-white">
                  {result.score}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  result.category === "good"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : result.category === "warning"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {result.category.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{result.advice.summary}</p>

            {result.category !== "good" && result.advice.actions.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
                <div>
                  <h4 className="font-semibold text-sm text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Issues Detected
                  </h4>
                  <ul className="space-y-1.5">
                    {result.advice.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-cyan-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <ol className="space-y-1.5">
                    {result.advice.actions.map((action, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400 font-medium">{i + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  step,
  min,
  max,
  icon,
}: {
  label: string
  value: number
  onChange: (v: string) => void
  step?: string
  min?: string
  max?: string
  icon?: string
}) {
  return (
    <label className="space-y-2 block">
      <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        step={step ?? "1"}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
      />
    </label>
  )
}
