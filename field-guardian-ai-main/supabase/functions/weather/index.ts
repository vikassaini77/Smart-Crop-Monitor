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
    const API_KEY = Deno.env.get("OPENWEATHERMAP_API_KEY");
    
    const { lat, lon, location } = await req.json();

    let queryLat = lat || 30.9;
    let queryLon = lon || 75.85;

    // If location name given but no coordinates, use geocoding
    if (location && !lat) {
      if (API_KEY) {
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`
        );
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          queryLat = geoData[0].lat;
          queryLon = geoData[0].lon;
        }
      }
    }

    if (!API_KEY) {
      // Use Lovable AI to generate realistic weather data
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("No weather API key or AI key configured");

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: "You are a weather data API. Return realistic current weather and 7-day forecast for the given location. Always respond with a JSON tool call."
            },
            {
              role: "user",
              content: `Give me current weather and 7-day forecast for coordinates ${queryLat}, ${queryLon}. Today is ${new Date().toISOString().split('T')[0]}.`
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "report_weather",
              description: "Report weather data",
              parameters: {
                type: "object",
                properties: {
                  location_name: { type: "string" },
                  current: {
                    type: "object",
                    properties: {
                      temp: { type: "number", description: "Temperature in Celsius" },
                      feels_like: { type: "number" },
                      humidity: { type: "number" },
                      wind_speed: { type: "number", description: "km/h" },
                      description: { type: "string" },
                      icon: { type: "string", description: "emoji" },
                      uv_index: { type: "number" },
                      visibility: { type: "number", description: "km" },
                      pressure: { type: "number" },
                    },
                    required: ["temp", "humidity", "wind_speed", "description", "icon"]
                  },
                  forecast: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "string" },
                        temp_max: { type: "number" },
                        temp_min: { type: "number" },
                        humidity: { type: "number" },
                        rain_chance: { type: "number" },
                        description: { type: "string" },
                        icon: { type: "string" }
                      },
                      required: ["day", "temp_max", "temp_min", "rain_chance", "icon"]
                    }
                  },
                  farming_alerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["warning", "info", "danger"] },
                        title: { type: "string" },
                        message: { type: "string" }
                      },
                      required: ["type", "title", "message"]
                    }
                  }
                },
                required: ["location_name", "current", "forecast", "farming_alerts"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "report_weather" } }
        }),
      });

      if (!aiRes.ok) throw new Error("AI weather generation failed");
      const aiData = await aiRes.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No weather data returned");

      const weatherData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(weatherData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Real OpenWeatherMap API
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${queryLat}&lon=${queryLon}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${queryLat}&lon=${queryLon}&units=metric&appid=${API_KEY}`),
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    const iconMap: Record<string, string> = {
      "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️",
      "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
      "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
      "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
      "50d": "🌫️", "50n": "🌫️",
    };

    const current = {
      temp: Math.round(currentData.main.temp),
      feels_like: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      wind_speed: Math.round(currentData.wind.speed * 3.6),
      description: currentData.weather[0].description,
      icon: iconMap[currentData.weather[0].icon] || "☁️",
      visibility: Math.round((currentData.visibility || 10000) / 1000),
      pressure: currentData.main.pressure,
      uv_index: 5,
    };

    // Group forecast by day
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyMap: Record<string, { temps: number[]; humidity: number[]; rain: number; icon: string; desc: string }> = {};

    forecastData.list?.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString();
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { temps: [], humidity: [], rain: 0, icon: iconMap[item.weather[0].icon] || "☁️", desc: item.weather[0].description };
      }
      dailyMap[dayKey].temps.push(item.main.temp);
      dailyMap[dayKey].humidity.push(item.main.humidity);
      if (item.pop) dailyMap[dayKey].rain = Math.max(dailyMap[dayKey].rain, item.pop * 100);
    });

    const forecast = Object.entries(dailyMap).slice(0, 7).map(([dateStr, data]) => {
      const date = new Date(dateStr);
      return {
        day: days[date.getDay()],
        temp_max: Math.round(Math.max(...data.temps)),
        temp_min: Math.round(Math.min(...data.temps)),
        humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length),
        rain_chance: Math.round(data.rain),
        description: data.desc,
        icon: data.icon,
      };
    });

    // Generate farming alerts
    const farming_alerts: any[] = [];
    if (current.temp > 38) {
      farming_alerts.push({ type: "danger", title: "Heat Stress Alert", message: "Extreme temperatures may damage crops. Ensure adequate irrigation." });
    }
    if (current.humidity > 85) {
      farming_alerts.push({ type: "warning", title: "High Humidity", message: "Fungal disease risk is elevated. Consider preventive fungicide application." });
    }
    const heavyRainDays = forecast.filter(d => d.rain_chance > 60);
    if (heavyRainDays.length > 0) {
      farming_alerts.push({ type: "warning", title: "Rain Expected", message: `Heavy rain likely on ${heavyRainDays.map(d => d.day).join(", ")}. Protect vulnerable crops and delay spraying.` });
    }
    if (current.wind_speed > 40) {
      farming_alerts.push({ type: "warning", title: "Strong Winds", message: "High winds may damage tall crops. Consider staking or support structures." });
    }
    if (farming_alerts.length === 0) {
      farming_alerts.push({ type: "info", title: "Conditions Favorable", message: "Current weather conditions are good for farming activities." });
    }

    return new Response(JSON.stringify({
      location_name: currentData.name || "Unknown",
      current,
      forecast,
      farming_alerts,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
