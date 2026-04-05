import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Leaf, Settings, Globe, Pencil, Loader2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    <main className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl mb-2">
            Your <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-muted-foreground">Manage your farm and account settings.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="glass-card rounded-2xl p-8 mb-6"
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

        {!editing && (
          <motion.div className="mt-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button onClick={() => setEditing(true)} className="gap-2 border-border hover:bg-secondary" variant="outline">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Profile;
