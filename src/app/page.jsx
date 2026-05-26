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

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
          <Badge variant="outline" className="mb-4 py-1 px-4 text-sm font-medium">
            ✨ AI-Powered Learning Evolution
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container">
            Turn Chaotic Documents <br /> Into Crisp Study Suites
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Instantly transform scattered notes, messy PDFs, and raw text into structured, interactive learning materials with the power of generative AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild className="px-8 text-md font-semibold">
              <Link href="/dashboard">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 text-md font-semibold gap-2">
              <span className="material-symbols-outlined text-lg">play_circle</span> Watch Demo
            </Button>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="container mx-auto px-4 py-24 border-t">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Study Tools</h2>
            <p className="text-muted-foreground text-lg">Everything you need to master your subjects in record time.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all border-muted/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">quiz</span>
                </div>
                <CardTitle>Interactive Quizzes</CardTitle>
                <CardDescription>Adaptive questions that test your depth of knowledge.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI generates practice questions based on your specific content, focusing on areas where you need improvement.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-muted/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">style</span>
                </div>
                <CardTitle>Smart Flashcards</CardTitle>
                <CardDescription>Automated spaced repetition for long-term memory.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Key concepts are automatically extracted and turned into digital flashcards ready for active recall.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-muted/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <CardTitle>Structured Notes</CardTitle>
                <CardDescription>Clean Markdown summaries from any source.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No more scrolling through hundreds of PDF pages. Get a concise, beautifully formatted summary of the essentials.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-muted/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">account_tree</span>
                </div>
                <CardTitle>AI Flowcharts</CardTitle>
                <CardDescription>Visualize complex logic and hierarchies.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complex processes are transformed into clear visual diagrams, making logical connections obvious.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Three Simple Steps</h2>
              <p className="text-muted-foreground">From raw documents to expert knowledge.</p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex-1 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-background border-2 border-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">1</div>
                <h3 className="text-xl font-semibold">Upload</h3>
                <p className="text-muted-foreground">Drop your PDFs, lecture notes, or research papers into the dash.</p>
              </div>
              <div className="hidden md:block w-12 h-px bg-muted-foreground/20" />
              <div className="flex-1 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-xl shadow-primary/20">2</div>
                <h3 className="text-xl font-semibold">Synthesize</h3>
                <p className="text-muted-foreground">Our AI engine analyzes and structures your material instantly.</p>
              </div>
              <div className="hidden md:block w-12 h-px bg-muted-foreground/20" />
              <div className="flex-1 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-background border-2 border-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">3</div>
                <h3 className="text-xl font-semibold">Learn</h3>
                <p className="text-muted-foreground">Start practicing with adaptive quizzes and interactive diagrams.</p>
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
              <Button size="lg" variant="secondary" asChild className="px-10 font-bold h-14 text-lg">
                <Link href="/dashboard">Create Free Account</Link>
              </Button>
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
