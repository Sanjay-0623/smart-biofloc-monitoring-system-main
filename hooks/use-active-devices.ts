"use client"

import { useState, useEffect } from "react"

export interface DeviceReading {
  device_id: string
  ph: number
  temperature_c: number
  ultrasonic_cm: number
  turbidity_ntu: number
  quality_score: number
  last_update: string
  is_active: boolean
}

export interface DevicesData {
  total_devices: number
  devices: DeviceReading[]
  timestamp: string
}

export function useActiveDevices(pollInterval = 5000) {
  const [data, setData] = useState<DevicesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/predict")
        if (!res.ok) throw new Error("Failed to fetch devices")
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
    const interval = setInterval(fetchDevices, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  return { data, loading, error }
}
