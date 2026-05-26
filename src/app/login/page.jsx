"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side: Branding & Motivation (Hidden on mobile) */}
      <div className="hidden lg:flex w-[60%] bg-primary relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract background effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground">
            <div className="bg-primary-foreground text-primary rounded-lg p-1.5">
              <span className="material-symbols-outlined text-2xl font-bold">auto_awesome</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">StudyAI</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
            <span className="material-symbols-outlined text-primary-foreground/40 text-6xl mb-4 block">format_quote</span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground leading-tight mb-8">
              The beautiful thing about learning is that no one can take it away from you.
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-primary-foreground/50" />
              <p className="text-lg text-primary-foreground/80 font-medium">B.B. King</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-primary-foreground/60">
          <Link href="#" className="hover:text-primary-foreground transition-colors">Help Center</Link>
          <Link href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-6 sm:p-12 bg-background relative overflow-hidden">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 flex items-center gap-2">
           <span className="material-symbols-outlined text-primary text-3xl font-bold">auto_awesome</span>
           <span className="text-2xl font-bold tracking-tight">StudyAI</span>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your learning journey.</p>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12 gap-3 font-medium border-muted-foreground/20 hover:bg-accent transition-all" onClick={() => {}}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-semibold tracking-widest">or</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">mail</span>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" name="password" className="text-sm font-semibold">Password</Label>
                  <Link href="#" className="text-xs font-bold text-primary hover:underline underline-offset-4">Forgot password?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">lock</span>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 border-muted-foreground/20 focus-visible:ring-primary" 
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20" asChild>
                <Link href="/dashboard">Sign In</Link>
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="#" className="font-bold text-primary hover:underline underline-offset-4">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
