"use client"

import { useActiveDevices } from "@/hooks/use-active-devices"
import { Activity, AlertCircle, CheckCircle2, Radio } from "lucide-react"

export function RealtimeSensorStatus() {
  const { data, loading, error } = useActiveDevices(3000) // Poll every 3 seconds

  const activeCount = data?.devices.filter((d) => d.is_active).length || 0
  const totalSensors = data?.total_sensors ?? data?.devices?.reduce((s, d) => s + (d.sensors_connected || 0), 0) ?? 0
  const hasError = error || !data
  const latestDevice = data?.devices?.[0]
  
  // Generate actionable recommendations based on sensor readings
  function generateRecommendations(device: any) {
    if (!device) return []

    const recs: Array<{ id: string; severity: "critical" | "warning" | "info"; title: string; detail?: string }> = []

    // Sensor health
    const expectedSensors = 4
    const connected = device.sensors_connected ?? 0
    if (connected < expectedSensors) {
      recs.push({ id: "sensors", severity: "warning", title: `Only ${connected}/${expectedSensors} sensors connected — check wiring and power.` })
    }

    // pH recommendations (general aquaculture ranges)
    const ph = typeof device.ph === "number" ? device.ph : NaN
    if (!isNaN(ph)) {
      if (ph < 6.8) {
        recs.push({ id: "ph_low", severity: "critical", title: `pH is low (${ph.toFixed(2)}). Consider gradual alkalinity adjustment and aeration.` })
      } else if (ph > 8.5) {
        recs.push({ id: "ph_high", severity: "warning", title: `pH is high (${ph.toFixed(2)}). Reduce alkaline inputs and consider partial water exchange.` })
      }
    }

    // Temperature recommendations (generic safe range)
    const temp = typeof device.temperature_c === "number" ? device.temperature_c : NaN
    if (!isNaN(temp)) {
      if (temp < 20) {
        recs.push({ id: "temp_low", severity: "warning", title: `Temperature low (${temp.toFixed(1)}°C). Use heaters or reduce cooling; check aeration.` })
      } else if (temp > 32) {
        recs.push({ id: "temp_high", severity: "critical", title: `Temperature high (${temp.toFixed(1)}°C). Increase aeration, add shading, and consider partial exchange.` })
      }
    }

    // Turbidity recommendations (NTU) — higher is worse
    const turb = typeof device.turbidity_ntu === "number" ? device.turbidity_ntu : NaN
    if (!isNaN(turb)) {
      if (turb > 100) {
        recs.push({ id: "turbid_high", severity: "critical", title: `Turbidity is high (${turb.toFixed(1)} NTU). Perform filtration and partial water exchange.` })
      } else if (turb > 50) {
        recs.push({ id: "turbid_warn", severity: "warning", title: `Turbidity elevated (${turb.toFixed(1)} NTU). Check feeding practices and filters.` })
      }
    }

    // Water level (distance from sensor to surface). Larger distance may indicate low water.
    const level = typeof device.ultrasonic_cm === "number" ? device.ultrasonic_cm : NaN
    if (!isNaN(level)) {
      const lowThreshold = 50 // cm — adjust per tank setup
      if (level > lowThreshold) {
        recs.push({ id: "water_low", severity: "critical", title: `Water level low (${level.toFixed(1)} cm). Top up water and check inlet valves.` })
      }
    }

    // Quality score
    const q = typeof device.quality_score === "number" ? device.quality_score : NaN
    if (!isNaN(q) && q < 60) {
      recs.push({ id: "quality_low", severity: "warning", title: `Water quality score is low (${q}/100). Review recommendations above and consider water exchange.` })
    }

    // If no recommendations, give a positive tip
    if (recs.length === 0) {
      recs.push({ id: "ok", severity: "info", title: "All readings are within normal ranges. Continue monitoring regularly." })
    }

    return recs
  }

  const recommendations = latestDevice
    ? generateRecommendations(latestDevice)
    : [
        {
          id: "no_device",
          severity: "info",
          title: "No device connected — connect your ESP32 to view live recommendations.",
          detail: "General maintenance: inspect sensors weekly, clean probes, check aeration and filters.",
        },
      ]
  
  const actionSteps: Record<string, { label: string; steps: string }> = {
    water_low: {
      label: "Top up water",
      steps:
        "1) Stop feed. 2) Open inlet valve or add freshwater slowly until level is restored. 3) Check inlet/outlet valves for clogs and sensors for positioning. 4) Monitor salinity if applicable.",
    },
    ph_low: {
      label: "Raise pH",
      steps:
        "1) Test alkalinity and hardness. 2) Gradually add a buffer (e.g., sodium bicarbonate) in small doses. 3) Increase aeration. 4) Re-test pH after 30 minutes.",
    },
    ph_high: {
      label: "Lower pH",
      steps:
        "1) Avoid adding alkaline chemicals. 2) Perform a partial water exchange with lower-pH water. 3) Consider adding peat or commercial pH-lowering products carefully. 4) Re-test pH.",
    },
    temp_low: {
      label: "Increase temp",
      steps:
        "1) Check heaters and thermostats. 2) Turn on heaters or add insulated covers. 3) Reduce cooling sources and ensure proper aeration.",
    },
    temp_high: {
      label: "Reduce temp",
      steps:
        "1) Increase aeration and circulation. 2) Add shading or move tank away from sun. 3) Do a partial water exchange with cooler water if safe.",
    },
    turbid_high: {
      label: "Improve clarity",
      steps:
        "1) Stop feeding immediately. 2) Inspect and clean filters. 3) Run mechanical filtration and consider partial water exchange. 4) Review feeding and stocking density.",
    },
    turbid_warn: {
      label: "Check turbidity",
      steps:
        "1) Inspect filters and skimmers. 2) Reduce feed and remove uneaten food. 3) Monitor turbidity over the next few hours.",
    },
    sensors: {
      label: "Check sensors",
      steps:
        "1) Power-cycle the ESP32 and sensors. 2) Verify wiring and connector seating. 3) Inspect sensor probes for fouling and clean if necessary. 4) Recalibrate if required.",
    },
    quality_low: {
      label: "Improve quality",
      steps:
        "1) Review individual recommendations above. 2) Increase aeration and filtration. 3) Consider a partial water exchange and test ammonia/nitrite.",
    },
  }

  function handleAction(id: string) {
    const action = actionSteps[id]
    if (!action) {
      window.alert("No action steps available for this recommendation.")
      return
    }

    // Try copying to clipboard and show a confirmation; fallback to alert
    const text = `${action.label} — Steps:\n${action.steps}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          window.alert(`${action.label} steps copied to clipboard.`)
        })
        .catch(() => {
          window.alert(text)
        })
    } else {
      window.alert(text)
    }
  }
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
          {/* Recommendations Card */}
          <div className="mt-4 bg-slate-800/40 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              {recommendations.map((r: any) => (
                <li key={r.id} className="flex items-start gap-3">
                  <span className={`inline-flex h-3 w-3 mt-1 rounded-full ${r.severity === 'critical' ? 'bg-red-400' : r.severity === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-white">{r.title}</div>
                      {actionSteps[r.id] && (
                        <button
                          onClick={() => handleAction(r.id)}
                          className="ml-2 text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          {actionSteps[r.id].label}
                        </button>
                      )}
                    </div>
                    {r.detail && <div className="text-slate-400 text-xs mt-1">{r.detail}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
          {/* Fallback Recommendations when no device is connected */}
          <div className="mt-4 bg-slate-800/40 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              {recommendations.map((r: any) => (
                <li key={r.id} className="flex items-start gap-3">
                  <span className={`inline-flex h-3 w-3 mt-1 rounded-full ${r.severity === 'critical' ? 'bg-red-400' : r.severity === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-white">{r.title}</div>
                      {actionSteps[r.id] && (
                        <button
                          onClick={() => handleAction(r.id)}
                          className="ml-2 text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          {actionSteps[r.id].label}
                        </button>
                      )}
                    </div>
                    {r.detail && <div className="text-slate-400 text-xs mt-1">{r.detail}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
