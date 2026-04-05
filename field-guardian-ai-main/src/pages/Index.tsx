import { useState, useCallback } from "react";
import CinematicIntro from "@/components/CinematicIntro";
import HeroSection from "@/components/HeroSection";
import EmotionalSection from "@/components/EmotionalSection";
import FeaturesSection from "@/components/FeaturesSection";
import StorySection from "@/components/StorySection";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(
    () => sessionStorage.getItem("intro_seen") === "true"
  );

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  return (
    <>
      {!introComplete && <CinematicIntro onComplete={handleIntroComplete} />}
      {introComplete && (
        <main>
          <HeroSection />
          <EmotionalSection />
          <FeaturesSection />
          <StorySection />

          {/* Footer */}
          <footer className="py-12 border-t border-border/50">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
              <p>
                <span className="text-gradient font-display text-base">Smart Crop Monitor</span>
              </p>
              <p className="mt-2">Your AI Partner in Farming • © 2026</p>
            </div>
          </footer>
        </main>
      )}
    </>
  );
};

export default Index;
