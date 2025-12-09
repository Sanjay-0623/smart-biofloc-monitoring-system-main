// Baseline features commonly logged in biofloc systems. You can regenerate this via scripts/train_model.py
export const modelData = {
  version: "0.2.0",
  type: "logistic", // logistic on discretized quality, with score output via sigmoid scaled 0-100
  features: [
    "ph",
    "temperature_c",
    "ultrasonic_cm", // Water level in centimeters
    "turbidity_ntu", // Turbidity in NTU (Nephelometric Turbidity Units)
  ],
  // Means and stds for standardization (placeholder values)
  mean: {
    ph: 7.4,
    temperature_c: 28.0,
    ultrasonic_cm: 80.0, // typical water depth in cm
    turbidity_ntu: 50.0, // typical turbidity for biofloc
  },
  std: {
    ph: 0.4,
    temperature_c: 2.0,
    ultrasonic_cm: 20.0,
    turbidity_ntu: 30.0,
  },
  // Learned weights (placeholder, directionally sensible)
  weights: {
    ph: 0.8,
    temperature_c: 0.5,
    ultrasonic_cm: 0.6, // Stable water level is good
    turbidity_ntu: -0.7, // High turbidity can indicate issues
  },
  bias: 0.2,
  thresholds: { good: 70, warning: 45 }, // 0-100 scale
} as const

export type FeatureName = keyof (typeof modelData)["mean"]
export type Reading = Record<FeatureName, number>
