import type { Reading } from "./model-data"

type Category = "good" | "warning" | "critical"

export function getRecommendations(reading: Reading, result: { score: number; category: Category }) {
  const issues: string[] = []
  const actions: string[] = []

  // pH checks
  if (reading.ph < 6.5 || reading.ph > 8.5) {
    issues.push("pH out of optimal range (6.5-8.5)")
    if (reading.ph < 6.5) {
      actions.push("pH is too low - Add alkalinity buffer (sodium bicarbonate) gradually to raise pH.")
    } else {
      actions.push("pH is too high - Reduce aeration temporarily and monitor carefully.")
    }
  }

  // Temperature checks
  if (reading.temperature_c < 26 || reading.temperature_c > 32) {
    issues.push("Temperature not optimal (26-32°C)")
    if (reading.temperature_c < 26) {
      actions.push("Water is too cold - Increase heating to maintain optimal temperature for fish health.")
    } else {
      actions.push("Water is too warm - Increase aeration and consider cooling methods to prevent stress.")
    }
  }

  // Water level checks
  if (reading.ultrasonic_cm < 50) {
    issues.push("Low water level detected")
    actions.push("Water level is low - Add fresh water immediately to maintain proper volume.")
  } else if (reading.ultrasonic_cm > 120) {
    issues.push("High water level detected")
    actions.push("Water level is too high - Check for overflow and drainage system.")
  }

  // Turbidity checks
  if (reading.turbidity_ntu > 100) {
    issues.push("High turbidity detected")
    actions.push("Turbidity is elevated - Check biofloc density, reduce feeding rate, and ensure proper aeration.")
  } else if (reading.turbidity_ntu < 20) {
    issues.push("Low turbidity (biofloc may be insufficient)")
    actions.push("Biofloc density may be low - Verify carbon source dosing and probiotic levels.")
  }

  // Deduplicate actions
  const uniqueActions = Array.from(new Set(actions))

  return {
    summary:
      result.category === "good"
        ? "All sensor readings are within optimal range. Continue routine monitoring."
        : "Some parameters need attention. Please review recommendations below.",
    issues,
    actions: uniqueActions,
  }
}
