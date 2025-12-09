// Database schema for device tracking and real-time readings
export interface ActiveDevice {
  id: string
  device_id: string // Unique identifier for ESP32
  last_reading_time: string // ISO timestamp
  ph: number
  temperature_c: number
  ultrasonic_cm: number
  turbidity_ntu: number
  quality_score: number
  status: "connected" | "disconnected"
  created_at: string
  updated_at: string
}

export interface DeviceSession {
  id: string
  device_id: string
  user_id: string
  started_at: string
  last_seen_at: string
  is_active: boolean
  total_readings: number
  created_at: string
}
