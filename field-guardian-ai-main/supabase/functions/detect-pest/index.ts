import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Gemini vision model to analyze crop image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural AI assistant specializing in crop disease and pest detection. 
Analyze the provided crop/plant image and identify any pests, diseases, or health issues.

You MUST respond with a JSON object using this EXACT tool call format. Always call the tool even if the image is not a crop/plant.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this crop/plant image. Identify any pests, diseases, or health issues. If not a plant image, say 'Not a plant image' as pest_name."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_detection",
              description: "Report the pest/disease detection results from analyzing a crop image",
              parameters: {
                type: "object",
                properties: {
                  pest_name: {
                    type: "string",
                    description: "Name of the detected pest or 'None' if no pest found"
                  },
                  disease_name: {
                    type: "string",
                    description: "Name of the detected disease or 'None' if no disease found"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score from 0 to 100"
                  },
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Severity level of the detected issue"
                  },
                  suggested_action: {
                    type: "string",
                    description: "Recommended treatment or action to take"
                  },
                  description: {
                    type: "string",
                    description: "Detailed description of what was found in the image"
                  },
                  affected_area: {
                    type: "string",
                    description: "Which part of the plant is affected (leaves, stem, roots, fruit, etc.)"
                  },
                  is_healthy: {
                    type: "boolean",
                    description: "Whether the plant appears healthy overall"
                  }
                },
                required: ["pest_name", "disease_name", "confidence", "severity", "suggested_action", "description", "is_healthy"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "report_detection" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let result;
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback
      result = {
        pest_name: "Unknown",
        disease_name: "Unknown",
        confidence: 50,
        severity: "medium",
        suggested_action: "Please consult a local agricultural expert for further analysis.",
        description: "Could not determine specific pest or disease from the image.",
        is_healthy: false,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-pest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
