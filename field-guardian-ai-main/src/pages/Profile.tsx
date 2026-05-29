import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Leaf, Settings, Globe, Pencil, Loader2, X, Save, Trophy, Activity, Wifi, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";

interface ProfileData {
  full_name: string | null;
  farm_location: string | null;
  farm_size: string | null;
  primary_crops: string[] | null;
  language_preference: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formCrops, setFormCrops] = useState("");
  const [formLanguage, setFormLanguage] = useState("English");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load profile");
    } else if (data) {
      setProfile(data);
      setFormName(data.full_name || "");
      setFormLocation(data.farm_location || "");
      setFormSize(data.farm_size || "");
      setFormCrops((data.primary_crops || []).join(", "));
      setFormLanguage(data.language_preference || "English");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    const crops = formCrops
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formName.trim(),
        farm_location: formLocation.trim() || null,
        farm_size: formSize.trim() || null,
        primary_crops: crops.length ? crops : null,
        language_preference: formLanguage.trim() || "English",
      })
      .eq("user_id", user!.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    }
  };

  if (authLoading || loading) {
    return (
      <main className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  const displayName = profile?.full_name || user?.email || "Farmer";
  const displayLocation = profile?.farm_location || "Not set";
  const displayCrops = profile?.primary_crops?.join(", ") || "Not set";
  const displaySize = profile?.farm_size || "Not set";
  const displayLanguage = profile?.language_preference || "English";

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <main className="pt-20 pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl mb-2">
            Your <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-muted-foreground">Manage your farm and account settings.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="glass-card rounded-2xl p-8 mb-6 bg-background/20 backdrop-blur-xl border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name" className="text-muted-foreground text-xs">Full Name *</Label>
                  <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Your name" className="mt-1 bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <Label htmlFor="location" className="text-muted-foreground text-xs">Farm Location</Label>
                  <Input id="location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="e.g. Ludhiana, Punjab" className="mt-1 bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <Label htmlFor="crops" className="text-muted-foreground text-xs">Primary Crops (comma-separated)</Label>
                  <Input id="crops" value={formCrops} onChange={(e) => setFormCrops(e.target.value)} placeholder="e.g. Wheat, Rice, Cotton" className="mt-1 bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <Label htmlFor="size" className="text-muted-foreground text-xs">Farm Size</Label>
                  <Input id="size" value={formSize} onChange={(e) => setFormSize(e.target.value)} placeholder="e.g. 12 Hectares" className="mt-1 bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <Label htmlFor="lang" className="text-muted-foreground text-xs">Language</Label>
                  <Input id="lang" value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} placeholder="English" className="mt-1 bg-secondary/30 border-border/50" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={saving} className="gap-2 border-border hover:bg-secondary">
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                {[
                  { icon: MapPin, label: "Farm Location", value: displayLocation },
                  { icon: Leaf, label: "Primary Crops", value: displayCrops },
                  { icon: Globe, label: "Language", value: displayLanguage },
                  { icon: Settings, label: "Farm Size", value: displaySize },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* New Profile Information Sections */}
        {!editing && (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            
            {/* Farm Statistics */}
            <motion.div className="glass-card rounded-2xl p-6 bg-background/20 backdrop-blur-xl border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-glow-green" />
                <h3 className="font-display text-xl text-foreground">Farm Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-sm text-muted-foreground">Total Detections Run</span>
                  <span className="text-sm font-medium text-foreground">142</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-sm text-muted-foreground">Acres Protected</span>
                  <span className="text-sm font-medium text-foreground">{displaySize !== "Not set" ? displaySize : "12 Hectares"}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-sm text-muted-foreground">Community Points</span>
                  <span className="text-sm font-medium text-sunlight">840 XP</span>
                </div>
              </div>
            </motion.div>

            {/* Achievements & Badges */}
            <motion.div className="glass-card rounded-2xl p-6 bg-background/20 backdrop-blur-xl border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-sunlight" />
                <h3 className="font-display text-xl text-foreground">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl border border-white/10 flex-1 hover:border-primary/40 transition-colors">
                  <Shield className="w-6 h-6 text-primary mb-1" />
                  <span className="text-xs font-medium text-center">Pest Guardian</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl border border-white/10 flex-1 hover:border-sunlight/40 transition-colors">
                  <Star className="w-6 h-6 text-sunlight mb-1" />
                  <span className="text-xs font-medium text-center">Early Adopter</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl border border-white/10 flex-1 opacity-40 grayscale">
                  <Leaf className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs font-medium text-center">Harvest King</span>
                </div>
              </div>
            </motion.div>

            {/* Hardware Hub */}
            <motion.div className="glass-card rounded-2xl p-6 md:col-span-2 bg-background/20 backdrop-blur-xl border-white/10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl text-foreground">Connected Hardware</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-glow-green shadow-[0_0_8px_hsl(var(--glow-green))]" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Main Field Camera</p>
                      <p className="text-xs text-muted-foreground">Zone A (Active)</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sunlight shadow-[0_0_8px_hsl(var(--sunlight))]" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Irrigation Sensor Node</p>
                      <p className="text-xs text-muted-foreground">Zone B (Standby)</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {!editing && (
          <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button onClick={() => setEditing(true)} className="gap-2 border-white/20 bg-background/30 backdrop-blur-xl hover:bg-background/50" variant="outline">
              <Pencil className="w-4 h-4" /> Edit Profile Settings
            </Button>
          </motion.div>
        )}
      </div>
    </main>
    </div>
  );
};

export default Profile;
