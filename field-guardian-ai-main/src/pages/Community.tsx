import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, MessageCircle, Leaf, AlertTriangle, Award, Lightbulb, X, Send, Image, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import OrganicBackground from "@/components/OrganicBackground";

interface Story {
  id: string;
  user_id: string | null;
  author_name: string;
  title: string;
  content: string;
  story_type: string;
  region: string | null;
  crop_type: string | null;
  likes_count: number;
  image_url: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const storyTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  experience: { icon: MessageCircle, label: "Experience", color: "text-accent" },
  success: { icon: Award, label: "Success Story", color: "text-sunlight" },
  tip: { icon: Lightbulb, label: "Farming Tip", color: "text-glow-green" },
  warning: { icon: AlertTriangle, label: "Warning", color: "text-destructive" },
};

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", content: "", story_type: "experience", region: "", crop_type: "", author_name: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTopStories, setShowTopStories] = useState(true);

  // Comments state
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStories();
    if (user) fetchLikes();
  }, [user]);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("community_stories")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setStories(data as Story[]);
  };

  const fetchLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("story_likes")
      .select("story_id")
      .eq("user_id", user.id);
    if (data) setLikedStories(new Set(data.map((l: any) => l.story_id)));
  };

  const fetchComments = async (storyId: string) => {
    const { data } = await supabase
      .from("story_comments")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });
    if (data) setComments((prev) => ({ ...prev, [storyId]: data as Comment[] }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in to share your story", variant: "destructive" }); return; }
    if (!form.title.trim() || !form.content.trim()) { toast({ title: "Title and story are required", variant: "destructive" }); return; }

    setSubmitting(true);
    let imageUrl: string | null = null;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("story-images").upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("story-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("community_stories").insert({
        user_id: user.id,
        author_name: form.author_name.trim() || "Anonymous Farmer",
        title: form.title.trim(),
        content: form.content.trim(),
        story_type: form.story_type,
        region: form.region.trim() || null,
        crop_type: form.crop_type.trim() || null,
        image_url: imageUrl,
      });
      if (error) throw error;

      toast({ title: "Your story has been shared 🌱" });
      setShowForm(false);
      setForm({ title: "", content: "", story_type: "experience", region: "", crop_type: "", author_name: "" });
      setImageFile(null);
      setImagePreview(null);
      fetchStories();
    } catch {
      toast({ title: "Failed to post story", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (storyId: string) => {
    if (!user) { toast({ title: "Please sign in to like stories", variant: "destructive" }); return; }
    if (likedStories.has(storyId)) {
      await supabase.from("story_likes").delete().eq("story_id", storyId).eq("user_id", user.id);
      setLikedStories((prev) => { const n = new Set(prev); n.delete(storyId); return n; });
      setStories((prev) => prev.map((s) => s.id === storyId ? { ...s, likes_count: s.likes_count - 1 } : s));
    } else {
      await supabase.from("story_likes").insert({ story_id: storyId, user_id: user.id });
      setLikedStories((prev) => new Set(prev).add(storyId));
      setStories((prev) => prev.map((s) => s.id === storyId ? { ...s, likes_count: s.likes_count + 1 } : s));
    }
  };

  const toggleComments = (storyId: string) => {
    setExpandedComments((prev) => {
      const n = new Set(prev);
      if (n.has(storyId)) { n.delete(storyId); } else { n.add(storyId); fetchComments(storyId); }
      return n;
    });
  };

  const submitComment = async (storyId: string) => {
    if (!user) { toast({ title: "Please sign in to comment", variant: "destructive" }); return; }
    const text = commentInputs[storyId]?.trim();
    if (!text) return;

    const { error } = await supabase.from("story_comments").insert({
      story_id: storyId,
      user_id: user.id,
      author_name: user.user_metadata?.full_name || "Farmer",
      content: text,
    });
    if (error) { toast({ title: "Failed to post comment", variant: "destructive" }); return; }
    setCommentInputs((prev) => ({ ...prev, [storyId]: "" }));
    fetchComments(storyId);
  };

  const topStories = [...stories].sort((a, b) => b.likes_count - a.likes_count).slice(0, 3).filter((s) => s.likes_count > 0);
  const filtered = filter === "all" ? stories : stories.filter((s) => s.story_type === filter);

  return (
    <div className="relative min-h-screen">
      <OrganicBackground />
      <div className="relative z-10 pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Community Stories</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real stories from real farmers. Share your experiences, learn from others, and grow together.
          </p>
        </motion.div>

        {/* Top Stories */}
        {topStories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <button onClick={() => setShowTopStories(!showTopStories)} className="flex items-center gap-2 mb-4 text-sunlight font-display text-lg hover:opacity-80 transition-opacity">
              <Trophy className="w-5 h-5" />
              Top Stories
              {showTopStories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showTopStories && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-3 md:grid-cols-3 overflow-hidden">
                  {topStories.map((story, i) => (
                    <motion.div key={story.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl p-4 border border-sunlight/20 bg-background/20 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-sunlight/20 text-sunlight text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> #{i + 1}
                      </div>
                      <h3 className="font-display text-sm text-foreground mb-1 pr-12 line-clamp-2">{story.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{story.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3 text-red-400 fill-current" />
                        <span>{story.likes_count}</span>
                        <span>• {story.author_name}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {["all", "experience", "success", "tip", "warning"].map((t) => (
              <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} onClick={() => setFilter(t)} className="capitalize">
                {t === "all" ? "All" : storyTypeConfig[t]?.label || t}
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Share Your Story
          </Button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl text-foreground">Share Your Story</h2>
                  <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input placeholder="Your name (optional)" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="bg-secondary/30 border-border/50" />
                  <Input placeholder="Story title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/30 border-border/50" />
                  <textarea placeholder="Tell your story... *" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="w-full bg-secondary/30 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />

                  {/* Image upload */}
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Image className="w-4 h-4" /> Add Photo (optional)
                    </Button>
                    {imagePreview && (
                      <div className="mt-2 relative inline-block">
                        <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg" />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select value={form.story_type} onChange={(e) => setForm({ ...form, story_type: e.target.value })} className="bg-secondary/30 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground">
                      <option value="experience">Experience</option>
                      <option value="success">Success Story</option>
                      <option value="tip">Farming Tip</option>
                      <option value="warning">Warning</option>
                    </select>
                    <Input placeholder="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="bg-secondary/30 border-border/50" />
                  </div>
                  <Input placeholder="Crop type (e.g., Rice, Wheat)" value={form.crop_type} onChange={(e) => setForm({ ...form, crop_type: e.target.value })} className="bg-secondary/30 border-border/50" />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Sharing..." : "Share Story 🌾"}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories Feed */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No stories yet. Be the first to share!</p>
            </div>
          )}
          {filtered.map((story, i) => {
            const cfg = storyTypeConfig[story.story_type] || storyTypeConfig.experience;
            const Icon = cfg.icon;
            const storyComments = comments[story.id] || [];
            const isExpanded = expandedComments.has(story.id);

            return (
              <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card bg-background/20 backdrop-blur-xl border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      {story.crop_type && <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full text-muted-foreground">{story.crop_type}</span>}
                      {story.region && <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full text-muted-foreground">📍 {story.region}</span>}
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-1">{story.title}</h3>

                    {story.image_url && (
                      <img src={story.image_url} alt={story.title} className="w-full max-h-64 object-cover rounded-xl mb-3" />
                    )}

                    <p className="text-sm text-muted-foreground whitespace-pre-line">{story.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>👨‍🌾 {story.author_name}</span>
                      <span>{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <button onClick={() => toggleLike(story.id)} className={`flex flex-col items-center gap-1 ${likedStories.has(story.id) ? "text-red-400" : "text-muted-foreground hover:text-red-400"} transition-colors`}>
                      <Heart className={`w-5 h-5 ${likedStories.has(story.id) ? "fill-current" : ""}`} />
                      <span className="text-xs">{story.likes_count}</span>
                    </button>
                    <button onClick={() => toggleComments(story.id)} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">{storyComments.length || ""}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
                        {storyComments.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
                        )}
                        {storyComments.map((c) => (
                          <div key={c.id} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent shrink-0 mt-0.5">
                              {c.author_name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">{c.author_name}</span>
                                <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <Input
                            placeholder="Write a comment..."
                            value={commentInputs[story.id] || ""}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [story.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && submitComment(story.id)}
                            className="bg-secondary/30 border-border/50 text-sm h-8"
                          />
                          <Button size="sm" variant="ghost" onClick={() => submitComment(story.id)} className="h-8 px-2">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Community;
