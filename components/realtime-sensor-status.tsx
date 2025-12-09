"use client"

import { useActiveDevices } from "@/hooks/use-active-devices"
import { Activity, AlertCircle, CheckCircle2, Radio } from "lucide-react"

export function RealtimeSensorStatus() {
  const { data, loading, error } = useActiveDevices(3000) // Poll every 3 seconds

  const activeCount = data?.devices.filter((d) => d.is_active).length || 0
  const totalSensors = data?.total_sensors ?? data?.devices?.reduce((s, d) => s + (d.sensors_connected || 0), 0) ?? 0
  const hasError = error || !data
  const latestDevice = data?.devices?.[0]

  return (
    <div className="space-y-4">
      {/* Active Devices Card */}
      <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Radio className={`h-5 w-5 ${activeCount > 0 ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
          </div>
          <span className={`text-xs font-medium ${totalSensors > 0 ? "text-green-400" : "text-red-400"}`}>
            {totalSensors > 0 ? "● Live" : "● Offline"}
          </span>
        </div>
        <p className="text-2xl font-bold text-white">{totalSensors} Sensor{totalSensors !== 1 ? "s" : ""}</p>
        <p className="text-sm text-slate-400">
          {totalSensors > 0 ? "Active monitoring" : "No sensors connected"}
        </p>
      </div>

      {/* Live Readings Card */}
      {latestDevice && latestDevice.is_active ? (
        <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl border-green-500/30">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Live Sensor Data</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide">pH Level</p>
              <p className="text-2xl font-bold text-cyan-400">{latestDevice.ph.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Temperature</p>
              <p className="text-2xl font-bold text-orange-400">{latestDevice.temperature_c.toFixed(1)}°C</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Water Level</p>
              <p className="text-2xl font-bold text-blue-400">{latestDevice.ultrasonic_cm.toFixed(1)} cm</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Turbidity</p>
              <p className="text-2xl font-bold text-purple-400">{latestDevice.turbidity_ntu.toFixed(1)} NTU</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Device: {latestDevice.device_id} • Sensors: {latestDevice.sensors_connected ?? 0}/4</span>
            <span>Score: {latestDevice.quality_score ?? 0}/100</span>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Last update: {new Date(latestDevice.last_update).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        <div className="glass-effect border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl border-red-500/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Sensor Connection</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {loading
              ? "Waiting for device data..."
              : error
                ? `Error: ${error}`
                : "No devices connected. Make sure your ESP32 is powered on and connected to WiFi."}
          </p>
        </div>
      )}
    </div>
  )
}
