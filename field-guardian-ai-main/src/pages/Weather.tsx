import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudSun, Droplets, Wind, Thermometer, Eye, CloudRain, Loader2, MapPin, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WeatherData {
  location_name: string;
  current: {
    temp: number;
    feels_like?: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
    uv_index?: number;
    visibility?: number;
    pressure?: number;
  };
  forecast: Array<{
    day: string;
    temp_max: number;
    temp_min: number;
    humidity?: number;
    rain_chance: number;
    description?: string;
    icon: string;
  }>;
  farming_alerts: Array<{
    type: "warning" | "info" | "danger";
    title: string;
    message: string;
  }>;
}

const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weather", {
        body: { lat: 30.9, lon: 75.85, location: "Punjab, India" },
      });
      if (error) throw error;
      setWeather(data);
    } catch (err: any) {
      toast.error("Failed to fetch weather data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <main className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Fetching weather data...</p>
        </div>
      </main>
    );
  }

  if (!weather) {
    return (
      <main className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CloudSun className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Could not load weather data</p>
          <Button onClick={fetchWeather} variant="outline" className="border-border">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  const alertStyles: Record<string, string> = {
    danger: "bg-destructive/10 border-destructive/20",
    warning: "bg-wheat/5 border-wheat/20",
    info: "bg-accent/5 border-accent/20",
  };

  const alertIcons: Record<string, typeof CloudRain> = {
    danger: Thermometer,
    warning: CloudRain,
    info: CloudSun,
  };

  return (
    <main className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8 flex items-start justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">
              Weather <span className="text-gradient">Intelligence</span>
            </h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {weather.location_name} — Live weather data with farming alerts
            </p>
          </div>
          <Button variant="outline" size="icon" className="border-border mt-2" onClick={fetchWeather}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Current Weather */}
        <motion.div
          className="glass-card rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left">
              <span className="text-6xl">{weather.current.icon}</span>
              <p className="font-display text-5xl mt-2 text-foreground">{weather.current.temp}°C</p>
              <p className="text-muted-foreground mt-1 capitalize">{weather.current.description}</p>
              {weather.current.feels_like !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">Feels like {weather.current.feels_like}°C</p>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
              {[
                { icon: Droplets, label: "Humidity", value: `${weather.current.humidity}%` },
                { icon: Wind, label: "Wind", value: `${weather.current.wind_speed} km/h` },
                { icon: Eye, label: "Visibility", value: `${weather.current.visibility ?? 10} km` },
                { icon: CloudSun, label: "UV Index", value: `${weather.current.uv_index ?? "N/A"}` },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 7-Day Forecast */}
        <motion.div
          className="glass-card rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display text-lg mb-4">7-Day Forecast</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weather.forecast.map((day, i) => (
              <motion.div
                key={i}
                className="text-center p-3 rounded-xl bg-secondary/30 border border-border/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
                <span className="text-2xl">{day.icon}</span>
                <p className="font-medium text-sm text-foreground mt-2">{day.temp_max}°</p>
                <p className="text-xs text-muted-foreground">{day.temp_min}°</p>
                <p className="text-xs text-muted-foreground mt-1">💧 {day.rain_chance}%</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Farming Alerts */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-display text-lg mb-4">🌾 Farming Alerts</h3>
          <div className="space-y-3">
            {weather.farming_alerts.map((alert, i) => {
              const AlertIcon = alertIcons[alert.type] || CloudSun;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${alertStyles[alert.type] || alertStyles.info}`}
                >
                  <AlertIcon className="w-5 h-5 text-wheat mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Weather;
