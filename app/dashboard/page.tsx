// Removed manual SensorInputForm — live data shown via RealtimeSensorStatus
import { QualityScoreCard } from "@/components/quality-score-card"
import { UploadCsv } from "@/components/upload-csv"
import { RealtimeSensorStatus } from "@/components/realtime-sensor-status"
import { WaterQualityChart } from "@/components/charts/water-quality-chart"
import { Droplets, TrendingUp } from "lucide-react"
import NavWrapper from "@/components/nav-wrapper"

export default function DashboardPage() {
  return (
    <>
      <NavWrapper />
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bubble"></div>
          <div className="bubble" style={{ animationDelay: "2s", left: "25%" }}></div>
          <div className="bubble" style={{ animationDelay: "4s", left: "75%" }}></div>
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with gradient */}
          <header className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <Droplets className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Real-Time Monitoring</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent mb-3">
              Biofloc Dashboard
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Monitor water quality parameters in real-time and get instant AI-powered predictions for optimal
              aquaculture management
            </p>
          </header>

          {/* Real-time Status Overview */}
          <div className="mb-8">
            <RealtimeSensorStatus />
          </div>

          {/* Stats Overview - Trend Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-cyan-400">+12%</span>
              </div>
              <p className="text-2xl font-bold text-white">Optimal</p>
              <p className="text-sm text-slate-400">Water quality</p>
            </div>

            <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Droplets className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-slate-400">24/7</span>
              </div>
              <p className="text-2xl font-bold text-white">Auto</p>
              <p className="text-sm text-slate-400">Analysis enabled</p>
            </div>
          </div>

            <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">

              <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-xl p-6 hover:border-cyan-500/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Trend Analysis</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Upload CSV data to visualize historical trends and patterns
                </p>
                <div className="mt-3">
                  <WaterQualityChart />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <QualityScoreCard />
              <UploadCsv />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
