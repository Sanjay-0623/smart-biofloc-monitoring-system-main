"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"

export function QualityScoreCard() {
  const [result, setResult] = useState<{
    score: number
    category: string
    advice: { issues: string[]; actions: string[] }
  } | null>(null)

  if (typeof window !== "undefined") {
    window.addEventListener(
      "biofloc:prediction",
      (e: any) => {
        setResult(e.detail)
      },
      { once: true },
    )
  }

  return (
    <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-xl p-6 hover:border-cyan-500/30 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Quality Score</h3>
          <p className="text-sm text-slate-400">Real-time analysis results</p>
        </div>
      </div>

      {!result ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-slate-800/50 mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">Run a prediction to see quality metrics</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end justify-between p-5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/30">
            <div>
              <div className="text-5xl font-bold text-white mb-1">{result.score}</div>
              <div className="text-sm text-slate-400">out of 100</div>
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

          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="issues" className="data-[state=active]:bg-slate-700/50">
                <AlertCircle className="h-4 w-4 mr-2" />
                Issues
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-slate-700/50">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="mt-4 space-y-2">
              {result.advice.issues.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">No major issues detected. Water quality is optimal!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {result.advice.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-300">{issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="mt-4 space-y-2">
              {result.advice.actions.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  <p className="text-sm text-cyan-400">Maintain routine operations. System is stable.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {result.advice.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-cyan-300">{action}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
