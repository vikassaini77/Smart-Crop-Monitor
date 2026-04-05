import os
import json
import google.generativeai as genai

# Configure Google Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_pest_insights(pest_name: str, confidence: float, count: int = 1) -> dict:
    """
    Calls Gemini API to generate structured, farmer-friendly agricultural insights
    for a detected pest returning a guaranteed JSON dictionary.
    """
    if not GEMINI_API_KEY:
        print("[AI Insignts] GEMINI_API_KEY missing. Returning fallback data locally.")
        return _fallback_insight(pest_name, confidence, count)

    prompt = f"""
You are an agricultural AI assistant integrated into a pest detection system.
Your task is to generate structured, farmer-friendly insights for ANY detected pest or insect.

Input:
* Pest name: {pest_name}
* Confidence score: {confidence}
* Detection count: {count}

Output Requirements:
Return a clean JSON response with the following exact fields:
1. "pest_name" (string)
2. "scientific_name" (string, if known)
3. "danger_level" (string: Low / Medium / High / Critical)
4. "severity_score" (integer 1-10 based on count and confidence)
5. "description" (string: simple explanation in 2-3 lines)
6. "symptoms" (list of strings: visible signs on crops)
7. "impact" (string: how it affects yield or plant health)
8. "immediate_actions" (list of strings: what farmer should do RIGHT NOW)
9. "treatment_chemical" (list of strings: chemical methods)
10. "treatment_organic" (list of strings: organic/eco-friendly methods)
11. "prevention" (list of strings: long-term strategies)
12. "spread_risk" (string: Low / Medium / High)
13. "suitable_pesticides" (list of strings)
14. "lifecycle_note" (string: optional short lifecycle info)
15. "weather_relation" (string: does weather affect it?)
16. "multilingual_tip" (string: simple Hindi explanation for farmers)

Rules:
* Keep language simple and practical (farmer-friendly)
* Avoid technical jargon
* Prioritize actionable steps over theory
* If pest is unknown, still generate general safe advice
* Keep response concise but informative
* Do NOT hallucinate dangerous chemicals
* Focus on real-world agricultural practices

Return ONLY valid JSON. No markdown enclosures.
"""
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        # Parse JSON
        return json.loads(response.text)
    except Exception as e:
        print(f"[AI Insights] Gemini API Failed: {e}")
        return _fallback_insight(pest_name, confidence, count)


def _fallback_insight(pest_name, confidence, count):
    """Provides a safe backup if the API fails or is unconfigured."""
    return {
        "pest_name": pest_name,
        "scientific_name": "Unknown",
        "danger_level": "Medium",
        "severity_score": 5,
        "description": f"The system detected {pest_name}. Immediate observation is recommended.",
        "symptoms": ["Check leaves for bites or discoloration", "Look for droppings or eggs"],
        "impact": "Can lead to diminished crop yield if unchecked.",
        "immediate_actions": ["Isolate affected plants if possible", "Increase manual monitoring"],
        "treatment_chemical": ["Consult local agricultural expert"],
        "treatment_organic": ["Neem oil spray (general)"],
        "prevention": ["Maintain crop rotation", "Ensure proper spacing"],
        "spread_risk": "Medium",
        "suitable_pesticides": ["Seek local advice"],
        "lifecycle_note": "Monitor daily for population growth.",
        "weather_relation": "Many pests thrive in warm, humid conditions.",
        "multilingual_tip": f"फसल में {pest_name} देखा गया है। कृपया अपने पौधों की जांच करें।" # Hindi tip for unknown
    }
