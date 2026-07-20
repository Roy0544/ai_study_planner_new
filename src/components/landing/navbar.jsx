"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-app-border/40 bg-app-bg/70 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo with Outfit font and tech-style lowercasing */}
        <Link 
          href="/" 
          className="text-xl font-black text-text-primary tracking-tighter flex items-center gap-1.5 hover:opacity-95 transition-opacity"
          data-display="true"
        >
          <span className="w-5 h-5 rounded bg-app-brand flex items-center justify-center text-app-inset text-xs font-black">g</span>
          <span>gkvk<span className="text-app-brand">.ai</span></span>
        </Link>
        
        {/* Nav items list */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="#features" 
            className="text-xs font-bold text-text-secondary hover:text-app-brand transition-colors tracking-wider uppercase"
          >
            Features
          </Link>
          <Link 
            href="#pricing" 
            className="text-xs font-bold text-text-secondary hover:text-app-brand transition-colors tracking-wider uppercase"
          >
            Pricing
          </Link>
          <Link 
            href="#resources" 
            className="text-xs font-bold text-text-secondary hover:text-app-brand transition-colors tracking-wider uppercase"
          >
            Resources
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-white">
          <Link 
            href="/login" 
            className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors tracking-wider uppercase hidden sm:inline-block"
          >
            Login
          </Link>
          <Button asChild className="rounded-lg bg-app-brand hover:bg-app-brand-hover text-white font-bold text-xs h-9 px-4 border-none shadow-sm transition-all">
            <Link href="/login" className="text-white">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
