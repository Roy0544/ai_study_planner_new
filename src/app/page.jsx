"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Particles } from "@/components/ui/particles";
import { AuroraText } from "@/components/ui/aurora-text";
import { MagicCard } from "@/components/ui/magic-card";
import { WorkflowBeam } from "@/components/workflow-beam";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={150}
        ease={80}
        color="#ffffff"
        refresh
      />
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary tracking-tight">StudyAI</div>
          
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="#features" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Features
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="#resources" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Resources
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <Badge variant="outline" className="mb-4 py-1 px-4 text-sm font-medium border-primary/20 bg-primary/5">
            <AnimatedGradientText speed={2} colorFrom="#c0c1ff" colorTo="#8083ff">
              ✨ AI-Powered Learning Evolution
            </AnimatedGradientText>
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Turn Chaotic Documents <br /> Into <AuroraText>Crisp Study Suites</AuroraText>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Instantly transform scattered notes, messy PDFs, and raw text into structured, interactive learning materials with the power of generative AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <RainbowButton asChild className="px-8 font-semibold">
              <Link href="/dashboard">Get Started for Free</Link>
            </RainbowButton>
            <Button size="lg" variant="outline" className="px-8 text-md font-semibold gap-2">
              <span className="material-symbols-outlined text-lg">play_circle</span> Watch Demo
            </Button>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="container mx-auto px-4 py-24 border-t">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Powerful <LineShadowText className="italic" shadowColor="white">Study Tools</LineShadowText>
            </h2>
            <p className="text-muted-foreground text-lg">Everything you need to master your subjects in record time.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">quiz</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Interactive Quizzes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI generates practice questions based on your specific content, focusing on areas where you need improvement.
                </p>
              </div>
            </MagicCard>

            <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">style</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Smart Flashcards</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Key concepts are automatically extracted and turned into digital flashcards ready for active recall.
                </p>
              </div>
            </MagicCard>

            <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Structured Notes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No more scrolling through hundreds of PDF pages. Get a concise, beautifully formatted summary of the essentials.
                </p>
              </div>
            </MagicCard>

            <MagicCard className="p-8 flex flex-col items-start gap-4 cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">account_tree</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI Flowcharts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complex processes are transformed into clear visual diagrams, making logical connections obvious.
                </p>
              </div>
            </MagicCard>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 border-t bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Three <LineShadowText className="italic" shadowColor="white">Simple Steps</LineShadowText>
              </h2>
              <p className="text-muted-foreground text-lg">From raw documents to expert knowledge.</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <WorkflowBeam className="py-12" showLabels={false} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8 px-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">1. Upload</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Drop your PDFs, lecture notes, or research papers into the dash.
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-primary">2. Synthesize</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our AI engine analyzes and structures your material instantly.
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">3. Learn</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start practicing with adaptive quizzes and interactive diagrams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4 py-24 text-center">
          <Card className="bg-primary text-primary-foreground p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to transform your study routine?</h2>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                Join thousands of students and researchers who are learning 3x faster with StudyAI.
              </p>
              <RainbowButton asChild className="px-10 font-bold h-14 text-lg">
                <Link href="/dashboard">Create Free Account</Link>
              </RainbowButton>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">StudyAI</h3>
            <p className="text-sm text-muted-foreground">
              Building the future of personalized, AI-driven education.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features">Features</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="#">Chrome Extension</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#">Twitter</Link></li>
              <li><Link href="#">GitHub</Link></li>
              <li><Link href="#">Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2024 StudyAI Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
