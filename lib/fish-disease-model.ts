// Fish Disease Detection Model - Disease Database and Analysis Logic
export interface DiseaseDetectionResult {
  disease: string
  confidence: number
  description: string
  treatment: string
}

// Disease database with comprehensive information
export const DISEASES = {
  fin_rot: {
    name: "Fin Rot",
    keywords: ["ragged fins", "torn fins", "deteriorating fins", "frayed fins", "discolored fins"],
    description:
      "Bacterial infection causing deterioration of fins and tail. Often caused by poor water quality or stress.",
    treatment:
      "Improve water quality, increase water changes, use antibacterial medication like Maracyn or API Fin and Body Cure. Isolate affected fish if possible.",
  },
  ich: {
    name: "Ich (White Spot Disease)",
    keywords: ["white spots", "salt grains", "white dots", "ich", "ick"],
    description:
      "Parasitic infection causing white spots on body and fins. Fish may scratch against objects and show rapid breathing.",
    treatment:
      "Raise water temperature to 82-86°F gradually, add aquarium salt (1 tablespoon per 5 gallons), use ich medication like Kordon Rid-Ich Plus. Treat for 10-14 days.",
  },
  dropsy: {
    name: "Dropsy",
    keywords: ["swollen", "bloated", "pinecone", "raised scales", "dropsy"],
    description:
      "Bacterial infection causing fluid buildup, swollen body, and raised scales (pinecone appearance). Often indicates organ failure.",
    treatment:
      "Isolate fish immediately, use antibacterial medication like Kanaplex or Maracyn-Two, add aquarium salt, improve water quality. Prognosis is often poor.",
  },
  columnaris: {
    name: "Columnaris (Cotton Wool Disease)",
    keywords: ["cotton wool", "white patches", "gray patches", "mouth fungus", "columnaris"],
    description:
      "Bacterial infection causing white/gray patches resembling cotton on body, fins, or gills. Highly contagious.",
    treatment:
      "Use antibacterial medication like Kanaplex or Furan-2, improve water quality, reduce stress, isolate affected fish. Act quickly as it spreads rapidly.",
  },
  fungal_infection: {
    name: "Fungal Infection",
    keywords: ["fuzzy growth", "cotton growth", "white fungus", "fungal"],
    description:
      "White cotton-like growth on body or fins, usually secondary to injury or stress. Often follows bacterial infections.",
    treatment:
      "Use antifungal medication like API Fungus Cure or Pimafix, improve water quality, add aquarium salt. Remove dead tissue if possible.",
  },
  velvet: {
    name: "Velvet Disease",
    keywords: ["gold dust", "rust colored", "velvet", "dusty appearance"],
    description:
      "Parasitic infection causing gold or rust-colored dust appearance on skin. Fish may scratch and show rapid breathing.",
    treatment:
      "Darken tank, raise temperature to 82°F, use copper-based medication or Malachite Green. Treat for 10-14 days.",
  },
  swim_bladder: {
    name: "Swim Bladder Disease",
    keywords: ["floating", "sinking", "sideways", "upside down", "swim bladder"],
    description:
      "Disorder affecting buoyancy control. Fish may float, sink, or swim sideways. Can be caused by overfeeding, constipation, or infection.",
    treatment:
      "Fast fish for 24-48 hours, feed blanched peas, improve water quality. If bacterial, use antibiotics. Adjust feeding schedule.",
  },
  healthy: {
    name: "Healthy",
    keywords: ["healthy", "normal", "clear", "vibrant"],
    description:
      "No visible signs of disease detected. Fish appears healthy with clear eyes, intact fins, and normal coloration.",
    treatment:
      "Continue regular maintenance, monitor water parameters, maintain proper feeding schedule, and observe for any changes.",
  },
}

/**
 * Analyze AI-generated description to detect fish diseases
 * This function is called from the server-side API route
 */
export function analyzeCaptionForDisease(description: string): DiseaseDetectionResult {
  console.log("[v0] Analyzing AI description for disease indicators:", description)

  const lowerDescription = description.toLowerCase()

  // Check for disease keywords in description with priority order
  const diseaseScores: Array<{ key: string; disease: (typeof DISEASES)[keyof typeof DISEASES]; score: number }> = []

  for (const [key, disease] of Object.entries(DISEASES)) {
    let score = 0
    for (const keyword of disease.keywords) {
      if (lowerDescription.includes(keyword)) {
        score += 1
        console.log("[v0] Found keyword:", keyword, "for disease:", disease.name)
      }
    }
    if (score > 0) {
      diseaseScores.push({ key, disease, score })
    }
  }

  // Sort by score (most matches first)
  diseaseScores.sort((a, b) => b.score - a.score)

  // If we found disease indicators, return the most likely one
  if (diseaseScores.length > 0 && diseaseScores[0].key !== "healthy") {
    const topMatch = diseaseScores[0]
    console.log("[v0] Detected disease:", topMatch.disease.name, "with score:", topMatch.score)
    return {
      disease: topMatch.disease.name,
      confidence: Math.min(0.65 + topMatch.score * 0.1, 0.95),
      description: topMatch.disease.description,
      treatment: topMatch.disease.treatment,
    }
  }

  if (
    lowerDescription.includes("healthy") ||
    lowerDescription.includes("normal") ||
    lowerDescription.includes("good condition") ||
    lowerDescription.includes("no visible")
  ) {
    console.log("[v0] Fish appears healthy based on AI analysis")
    return {
      disease: DISEASES.healthy.name,
      confidence: 0.8,
      description:
        DISEASES.healthy.description + " The AI analysis indicates no obvious disease symptoms were detected.",
      treatment: DISEASES.healthy.treatment,
    }
  }

  // If fish is detected but no clear diagnosis
  if (lowerDescription.includes("fish") || lowerDescription.includes("aquarium")) {
    console.log("[v0] Fish detected but no clear disease indicators")
    return {
      disease: "Requires Manual Inspection",
      confidence: 0.65,
      description:
        "The AI analysis detected a fish but could not identify specific disease symptoms with high confidence. Please observe your fish for: unusual spots or discoloration, damaged or deteriorating fins, abnormal swimming behavior, loss of appetite, or rapid breathing.",
      treatment:
        "Monitor water parameters (ammonia, nitrite, nitrate, pH, temperature). Perform regular water changes (25-30% weekly). If symptoms develop, isolate the fish and consult an aquatic veterinarian or experienced aquarist for proper diagnosis.",
    }
  }

  // Default response if uncertain
  console.log("[v0] Unable to determine specific condition from AI analysis")
  return {
    disease: "Analysis Incomplete",
    confidence: 0.5,
    description:
      "Unable to complete automated analysis. Please ensure the image clearly shows the fish. Common signs to look for: white spots (Ich), ragged fins (Fin Rot), swollen body (Dropsy), cotton-like patches (Columnaris/Fungus).",
    treatment:
      "If you notice any abnormal behavior, discoloration, spots, fin damage, or swelling, consult an aquatic veterinarian. Maintain good water quality (regular water changes, proper filtration) and monitor your fish closely.",
  }
}
