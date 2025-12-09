import { modelData, type Reading } from "./model-data"
import { getRecommendations } from "./recommendations"

function zScore(x: number, mean: number, std: number) {
  return std > 0 ? (x - mean) / std : 0
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x))
}

/**
 * Returns a 0-100 quality score and category label.
 */
export function predictQuality(reading: Reading) {
  const { features, mean, std, weights, bias, thresholds } = modelData

  let lin = bias
  for (const f of features) {
    const z = zScore(reading[f as keyof Reading], mean[f as keyof Reading], std[f as keyof Reading])
    lin += (weights as any)[f] * z
  }
  const prob = sigmoid(lin)
  const score = Math.round(prob * 100)

  let category: "good" | "warning" | "critical"
  if (score >= thresholds.good) category = "good"
  else if (score >= thresholds.warning) category = "warning"
  else category = "critical"

  const advice = getRecommendations(reading, { score, category })

  return { score, category, advice }
}

export type Prediction = ReturnType<typeof predictQuality>
