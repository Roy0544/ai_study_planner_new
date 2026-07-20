"use client";

import Link from "next/link";
import {
  HeroColorPanelsRoot,
  HeroColorPanelsContainer,
  HeroColorPanelsContent,
  HeroColorPanelsHeading,
  HeroColorPanelsDescription,
  HeroColorPanelsActions,
  HeroColorPanelsMobileVisual,
  HeroColorPanelsVisual,
} from "@/components/ui/hero-color-panel";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function CTA() {
  return (
    <HeroColorPanelsRoot
      srTitle="Transform your study routine"
      title={<span className="text-white font-extrabold">Ready to transform</span>}
      subtitle={<span className="bg-gradient-to-r from-[#ed40b3] via-[#adfa1e] to-[#6ef7cc] bg-clip-text text-transparent font-extrabold">your study routine?</span>}
      description="Join thousands of students and researchers who are learning 3x faster with AI-Powered Study Suites, Quizzes, Flashcards, and Crowd-sourced Exam Sheets."
      showCta={true}
      desktopShaderProps={{
        colors: ["#ed40b3", "#6ef7cc", "#adfa1e", "#b054de"],
        colorBack: "#00000000",
        density: 6.0,
        speed: 3.5,
        scale: 0.95,
      }}
      mobileShaderProps={{
        colors: ["#ed40b3", "#6ef7cc", "#adfa1e", "#b054de"],
        colorBack: "#00000000",
        density: 6.0,
        speed: 3.5,
        scale: 0.95,
      }}
      showBadges={false}
    >
      <HeroColorPanelsContainer className="py-24">
        <HeroColorPanelsContent>
          <HeroColorPanelsHeading headingClassName="font-extrabold" />
          <HeroColorPanelsDescription descriptionClassName="text-zinc-400" />
          
          <HeroColorPanelsActions
            renderCta={() => (
              <RainbowButton asChild className="px-10 font-bold h-14 text-lg select-none active:scale-[0.97] transition-transform">
                <Link href="/login" className="text-white font-bold">Create Free Account</Link>
              </RainbowButton>
            )}
          />
        </HeroColorPanelsContent>
        <HeroColorPanelsVisual />
      </HeroColorPanelsContainer>
      <HeroColorPanelsMobileVisual />
    </HeroColorPanelsRoot>
  );
}
