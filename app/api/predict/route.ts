import { NextResponse } from "next/server"
import { predictQuality } from "@/lib/model"
import type { Reading } from "@/lib/model-data"

// In-memory storage for active devices (replace with database in production)
const activeDevices = new Map<string, {
  lastUpdate: number
  reading: Reading & { quality_score: number }
}>()

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Partial<Reading>
    const required: (keyof Reading)[] = ["ph", "temperature_c", "ultrasonic_cm", "turbidity_ntu"]
    for (const k of required) {
      if (typeof data[k] !== "number" || Number.isNaN(data[k])) {
        return NextResponse.json({ error: `Invalid or missing '${k}'` }, { status: 400 })
      }
    }
    const result = predictQuality(data as Reading)
    
    // Track active device with timestamp
    const deviceId = req.headers.get("x-device-id") || "esp32-default"
    // compute which sensors appear to be reporting valid values
    const reading = {
      ...(data as Reading),
      quality_score: result.score
    }

    const sensorFlags = {
      ph: typeof reading.ph === 'number' && !Number.isNaN(reading.ph) && reading.ph > 0.1 && reading.ph <= 14,
      temperature_c: typeof reading.temperature_c === 'number' && !Number.isNaN(reading.temperature_c) && reading.temperature_c > -30 && reading.temperature_c < 125,
      ultrasonic_cm: typeof reading.ultrasonic_cm === 'number' && !Number.isNaN(reading.ultrasonic_cm) && reading.ultrasonic_cm > 0.05 && reading.ultrasonic_cm < 5000,
      turbidity_ntu: typeof reading.turbidity_ntu === 'number' && !Number.isNaN(reading.turbidity_ntu) && reading.turbidity_ntu >= 0 && reading.turbidity_ntu < 10000,
    }

    const sensors_connected = Object.values(sensorFlags).filter(Boolean).length

    activeDevices.set(deviceId, {
      lastUpdate: Date.now(),
      reading: {
        ...reading,
        sensors_connected
      }
    })
    
    // Clean up devices inactive for more than 5 minutes
    const now = Date.now()
    for (const [id, device] of activeDevices.entries()) {
      if (now - device.lastUpdate > 5 * 60 * 1000) {
        activeDevices.delete(id)
      }
    }
    
    // compute total sensors across active devices
    const now2 = Date.now()
    let totalSensors = 0
    for (const [, dev] of activeDevices.entries()) {
      if (now2 - dev.lastUpdate <= 5 * 60 * 1000) {
        totalSensors += (dev.reading as any).sensors_connected || 0
      }
    }

    return NextResponse.json({
      ...result,
      active_devices: activeDevices.size,
      total_sensors: totalSensors,
      device_id: deviceId,
      sensors_connected: sensors_connected
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 })
  }
}

// GET endpoint to fetch active devices and latest readings
export async function GET(req: Request) {
  const devices = Array.from(activeDevices.entries()).map(([id, data]) => {
    const is_active = Date.now() - data.lastUpdate < 2 * 60 * 1000 // Active if updated in last 2 minutes
    const sensors_connected = (data.reading as any).sensors_connected || 0
    return {
      device_id: id,
      ...data.reading,
      sensors_connected,
      last_update: new Date(data.lastUpdate).toISOString(),
      is_active,
    }
  })

  const total_sensors = devices.reduce((s, d) => s + (d.sensors_connected || 0), 0)

  return NextResponse.json({
    total_devices: devices.length,
    total_sensors,
    devices: devices,
    timestamp: new Date().toISOString()
  })
}

