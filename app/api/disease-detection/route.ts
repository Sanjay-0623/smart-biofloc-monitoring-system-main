import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import fs from "fs"
import path from "path"

function getImageHash(imageData: string): number {
  let hash = 0
  for (let i = 0; i < Math.min(imageData.length, 100); i++) {
    const char = imageData.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

async function detectFishDiseaseWithAI(
  imageUrl: string,
  imageData?: ArrayBuffer,
): Promise<{
  disease: string
  confidence: number
  description: string
  treatment: string
}> {
  try {
    console.log("[v0] Starting AI vision analysis (improved confidence flow)")

    // Prefer higher-quality models first and generate deterministically
    const models = ["openai/gpt-4o", "openai/gpt-4-turbo", "anthropic/claude-sonnet-4"]

    // Helper to parse JSON safely
    function tryParseJson(text: string) {
      const m = text.match(/\{[\s\S]*\}/)
      if (!m) return null
      try {
        return JSON.parse(m[0])
      } catch (e) {
        return null
      }
    }

    // Prompt template ensures model returns strict JSON with confidence between 0 and 1
    const basePrompt = `You are an expert aquatic veterinarian. Analyze the provided fish image for the single most likely disease or 'Healthy'.

Focus on visible signs such as:
- White spots on body/fins (Ich)
- Ragged/frayed fins (Fin Rot)
- Cotton-like white/gray patches (Fungal Infection)
- Swollen body/protruding scales (Dropsy)
- Red streaks/inflamed areas (Bacterial Infection)

IMPORTANT: Return EXACTLY ONE JSON object and nothing else. The JSON MUST be valid and use these keys:
{
  "disease": "Healthy" | "Ich" | "Fin Rot" | "Fungal Infection" | "Dropsy" | "Bacterial Infection" | "Other",
  "confidence": <number between 0 and 1>,
  "description": "brief observations from the image",
  "treatment": "concise treatment recommendations"
}

Return a numeric confidence representing the model's estimated probability that the diagnosis is correct.
Keep temperature/creativity low and be concise.`

    for (const model of models) {
      try {
        console.log("[v0] Attempting analysis with model:", model)

        const result = await generateText({
          model,
          messages: [
            { role: "user", content: basePrompt },
            { role: "user", content: { type: "image", image: imageUrl } as any as string },
          ],
          maxTokens: 800,
          temperature: 0,
        })

        console.log("[v0] AI response received (first pass)")
        const parsed = tryParseJson(result.text)
        if (parsed && typeof parsed.confidence === "number") {
          console.log(`[v0] Parsed confidence: ${parsed.confidence}`)
          // If the model is already confident above threshold, return immediately
          if (parsed.confidence >= 0.85) {
            return {
              disease: parsed.disease || "Unknown",
              confidence: parsed.confidence,
              description: parsed.description || "",
              treatment: parsed.treatment || "",
            }
          }

          // Ask the model to re-evaluate and provide a short justification, then re-output JSON
          try {
            const reaskPrompt = `The previous JSON had confidence=${parsed.confidence}. Re-evaluate the same image and provide a final JSON result with a confidence number between 0 and 1. If you cannot reach confidence >= 0.85, still return your best estimate but include clearer observations in 'description' to help humans decide.`
            const re = await generateText({
              model,
              messages: [
                { role: "user", content: reaskPrompt },
                { role: "user", content: { type: "image", image: imageUrl } as any as string },
              ],
              maxTokens: 800,
              temperature: 0,
            })

            const parsed2 = tryParseJson(re.text)
            if (parsed2 && typeof parsed2.confidence === "number" && parsed2.confidence >= 0.85) {
              console.log(`[v0] Re-evaluation reached confidence ${parsed2.confidence} on model ${model}`)
              return {
                disease: parsed2.disease || parsed.disease || "Unknown",
                confidence: parsed2.confidence,
                description: parsed2.description || parsed.description || "",
                treatment: parsed2.treatment || parsed.treatment || "",
              }
            }
            // otherwise continue to next model
          } catch (reErr) {
            console.error(`[v0] Re-evaluation failed on model ${model}:`, reErr)
          }
        } else {
          console.log("[v0] Could not parse JSON from model response")
        }
      } catch (modelError) {
        console.error(`[v0] Model ${model} failed:`, modelError)
        continue
      }
    }

    console.log("[v0] No model produced >=85% confidence")
    // As a fallback, try a free Hugging Face image captioning model (if configured).
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        console.log("[v0] Trying Hugging Face captioning fallback")
        // fetch image bytes
        let imageBuffer: Buffer
        if (imageUrl.startsWith("data:")) {
          const comma = imageUrl.indexOf(",")
          const b64 = imageUrl.slice(comma + 1)
          imageBuffer = Buffer.from(b64, "base64")
        } else {
          const imgRes = await fetch(imageUrl)
          const arr = await imgRes.arrayBuffer()
          imageBuffer = Buffer.from(arr)
        }

        const hfRes = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
          body: imageBuffer,
        })

        if (hfRes.ok) {
          const hfJson = await hfRes.json()
          const caption = Array.isArray(hfJson) && hfJson[0]?.generated_text ? hfJson[0].generated_text : hfJson.caption || JSON.stringify(hfJson)
          console.log("[v0] HuggingFace caption:", caption)

          // Try caption -> LLM flow: feed the caption to the deterministic LLMs
          try {
            const captionPrompt = `You are an expert aquatic veterinarian. Using ONLY the following image caption (do not invent new visual details), provide EXACTLY ONE JSON object with keys:\n{\n  "disease": "Healthy" | "Ich" | "Fin Rot" | "Fungal Infection" | "Dropsy" | "Bacterial Infection" | "Other",\n  "confidence": <number between 0 and 1>,\n  "description": "brief observations based on the caption",\n  "treatment": "concise treatment recommendations"\n}\nReturn nothing else. Caption:\n"${caption}"\nBe deterministic (temperature=0).`;

            for (const model of models) {
              try {
                console.log(`[v0] Caption->LLM attempt with model ${model}`)
                const r = await generateText({
                  model,
                  messages: [{ role: "user", content: captionPrompt }],
                  maxTokens: 600,
                  temperature: 0,
                })
                const parsedCaptionLLM = tryParseJson(r.text)
                if (parsedCaptionLLM && typeof parsedCaptionLLM.confidence === "number") {
                  console.log(`[v0] Caption->LLM parsed confidence: ${parsedCaptionLLM.confidence} (model=${model})`)
                  if (parsedCaptionLLM.confidence >= 0.85) {
                    return {
                      disease: parsedCaptionLLM.disease || "Unknown",
                      confidence: parsedCaptionLLM.confidence,
                      description: parsedCaptionLLM.description || `Caption: ${caption}`,
                      treatment: parsedCaptionLLM.treatment || "",
                    }
                  }

                  // Re-evaluate once deterministically if below threshold
                  try {
                    const reask = `Re-evaluate the same caption and provide a final JSON with a confidence between 0 and 1. If you cannot reach 0.85, still provide your best estimate but be explicit in 'description'. Caption:\n"${caption}"`;
                    const r2 = await generateText({ model, messages: [{ role: "user", content: reask }], maxTokens: 600, temperature: 0 })
                    const parsed2 = tryParseJson(r2.text)
                    if (parsed2 && typeof parsed2.confidence === "number" && parsed2.confidence >= 0.85) {
                      console.log(`[v0] Caption->LLM re-eval reached ${parsed2.confidence} on ${model}`)
                      return {
                        disease: parsed2.disease || parsedCaptionLLM.disease || "Unknown",
                        confidence: parsed2.confidence,
                        description: parsed2.description || parsedCaptionLLM.description || `Caption: ${caption}`,
                        treatment: parsed2.treatment || parsedCaptionLLM.treatment || "",
                      }
                    }
                  } catch (reErr) {
                    console.error(`[v0] Caption->LLM re-eval error on ${model}:`, reErr)
                  }
                }
              } catch (modelErr) {
                console.error(`[v0] Caption->LLM model ${model} failed:`, modelErr)
              }
            }
          } catch (capErr) {
            console.error("[v0] Caption->LLM flow error:", capErr)
          }

          // keyword mapping heuristics (expanded)
          const txt = String(caption).toLowerCase()
          const mapping: [string, string[]][] = [
            ["Ich", ["white spot", "white spots", "spots on", "ich", "white dots", "tiny white"]],
            ["Fin Rot", ["ragged fin", "frayed fin", "damaged fin", "torn fin", "fin erosion", "fin edge"]],
            ["Fungal Infection", ["cotton", "fungal", "white cotton", "fuzzy white", "moldy patch"]],
            ["Dropsy", ["swollen", "protruding scales", "bloated", "dropsy", "pineconing", "bulging eyes"]],
            ["Bacterial Infection", ["red streak", "red spot", "ulcer", "lesion", "red patch", "open sore", "ulceration"]],
            ["Parasitic", ["parasite", "parasites", "worms", "leeches", "spots and scratching"]],
            ["Healthy", ["healthy", "no visible", "no signs", "normal", "clear eyes"]],
            ["Other", ["discoloration", "black spot", "dark patch", "blotch", "unknown mark"]],
          ]

          let detected: string | null = null
          let score = 0.0
          const matchesByDisease: Record<string, number> = {}
          for (const [disease, keys] of mapping) {
            for (const k of keys) {
              if (txt.includes(k)) {
                detected = disease
                matchesByDisease[disease] = (matchesByDisease[disease] || 0) + 1
              }
            }
          }

          // Compute score based on number of keyword matches and type
          if (detected) {
            const matches = matchesByDisease[detected] || 0
            // base score depends on match count and whether phrase is very specific
            score = Math.min(1, 0.55 + 0.18 * matches)
            // boost when multiple strong indicators
            if (matches >= 2) score = Math.max(score, 0.85)

            // Logging: ensure logs dir exists and append JSONL entry
            try {
              const logsDir = path.join(process.cwd(), "logs")
              if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
              const logPath = path.join(logsDir, "captions.log")
              const logEntry = {
                ts: new Date().toISOString(),
                caption: caption,
                detected,
                score,
                matches,
                imageUrl: imageUrl,
              }
              fs.appendFileSync(logPath, JSON.stringify(logEntry) + "\n")
            } catch (logErr) {
              console.error("[v0] Caption log write error:", logErr)
            }

            return {
              disease: detected,
              confidence: score,
              description: `Caption: ${caption}`,
              treatment: `Based on detected signs (${detected}). Recommend treatment per common practice.`,
            }
          } else {
            // Log caption even when nothing detected
            try {
              const logsDir = path.join(process.cwd(), "logs")
              if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
              const logPath = path.join(logsDir, "captions.log")
              const logEntry = { ts: new Date().toISOString(), caption: caption, detected: null, score: 0, imageUrl: imageUrl }
              fs.appendFileSync(logPath, JSON.stringify(logEntry) + "\n")
            } catch (logErr) {
              console.error("[v0] Caption log write error:", logErr)
            }
          }
        } else {
          console.log("[v0] HuggingFace inference failed", await hfRes.text())
        }
      } catch (hfErr) {
        console.error("[v0] HuggingFace fallback error:", hfErr)
      }
    }

    return {
      disease: "Manual Inspection Required",
      confidence: 0,
      description:
        "AI could not reach high confidence for this image. Please consult an aquatic veterinarian or upload a clearer image from multiple angles.",
      treatment:
        "If symptoms are visible: look for white spots (Ich), ragged fins (Fin Rot), cotton patches (Fungus), swollen body (Dropsy), or red streaks (Bacterial infection).",
    }
  } catch (error) {
    console.error("[v0] AI detection error:", error)
    return {
      disease: "Detection Error",
      confidence: 0,
      description: "Unable to complete automated analysis. Please try again or consult a veterinarian.",
      treatment: "Ensure the image is clear and well-lit. If problems persist, seek professional diagnosis.",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Disease detection API called")

    // Try to create Supabase server client. If Supabase env is not configured,
    // fall back to a no-auth mode (don't attempt DB saves). This avoids the
    // thrown error when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are not present.
    let supabase: any = null
    let user: any = null
    try {
      supabase = await createServerClient()
      const {
        data: { user: fetchedUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("[v0] Authentication error:", authError)
        // continue without supabase (treat as unauthenticated)
        supabase = null
      } else {
        user = fetchedUser
      }
    } catch (e) {
      console.log("[v0] Supabase not configured or unavailable, continuing without DB/auth")
      supabase = null
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Prefer authenticated user id when Supabase is available, otherwise
    // accept `userId` from the form (client already appends it) for local
    // development/testing without Supabase.
    const formUserId = formData.get("userId") as string | null
    const userId = user?.id ?? (formUserId ? Number(formUserId) : undefined)
    let imageUrl: string
    let imageData: ArrayBuffer | undefined

    try {
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const timestamp = Date.now()
      const blobPath = `fish-disease/${userId}/${timestamp}-${sanitizedFilename}`

      const blob = await put(blobPath, file, {
        access: "public",
      })
      imageUrl = blob.url
      console.log("[v0] Image uploaded to Blob storage")
    } catch (blobError) {
      console.log("[v0] Blob storage unavailable, using base64")
      const bytes = await file.arrayBuffer()
      imageData = bytes
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString("base64")
      imageUrl = `data:${file.type};base64,${base64}`
    }

    console.log("[v0] Starting disease detection...")
    const detection = await detectFishDiseaseWithAI(imageUrl, imageData)

    if (imageUrl.startsWith("http")) {
      if (supabase && userId) {
        // Save to database when Supabase is configured and we have a user id
        const { data, error } = await supabase
          .from("fish_disease_detections")
          .insert({
            user_id: userId,
            image_url: imageUrl,
            disease_name: detection.disease,
            confidence_score: detection.confidence,
            description: detection.description,
            treatment_suggestions: detection.treatment,
          })
          .select()
          .single()

        if (error) {
          console.error("[v0] Database save error:", error)
          // Fall through and return detection result without DB metadata
        } else {
          return NextResponse.json({
            id: data.id,
            disease: data.disease_name,
            confidence: data.confidence_score,
            description: data.description,
            treatment: data.treatment_suggestions,
            imageUrl: data.image_url,
            createdAt: data.detected_at,
          })
        }
      }

      // If Supabase not configured or DB save failed, return the detection result
      return NextResponse.json({
        disease: detection.disease,
        confidence: detection.confidence,
        description: detection.description,
        treatment: detection.treatment,
        imageUrl: imageUrl,
      })
    }

    // Local development response
    return NextResponse.json({
      disease: detection.disease,
      confidence: detection.confidence,
      description: detection.description,
      treatment: detection.treatment,
      imageUrl: imageUrl,
    })
  } catch (error) {
    console.error("[v0] Detection error:", error)
    return NextResponse.json(
      { error: "Detection failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
