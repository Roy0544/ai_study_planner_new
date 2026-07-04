"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { handleGoogleLogin, handleEmailLogin } from "@/config/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");
    const result = await handleEmailLogin(values.email, values.password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Authentication failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-app-bg text-text-primary select-none">
      
      {/* Left Side: Dynamic Visual Banner (desktop only) */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 bg-app-inset border-r border-app-border relative overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-0 opacity-20">
          <FlickeringGrid
            className="w-full h-full"
            squareSize={4}
            gridGap={6}
            color="#60A5FA"
            maxOpacity={0.15}
            flickerChance={1}
            height={1000}
            width={1000}
          />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Link 
            href="/" 
            className="text-xl font-black text-text-primary tracking-tighter flex items-center gap-1.5 hover:opacity-95 transition-opacity"
            data-display="true"
          >
            <span className="w-5 h-5 rounded bg-app-brand flex items-center justify-center text-app-inset text-xs font-black">g</span>
            <span>gkvk<span className="text-app-brand">.ai</span></span>
          </Link>
        </div>

        {/* Dynamic Center Quote Container */}
        <div className="relative z-10 w-full">
          <div className="bg-app-card border border-app-border p-10 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-40 pointer-events-none" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="material-symbols-outlined text-app-brand text-xs fill-current">star</span>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary leading-[1.3] tracking-tight" data-display="true">
              &quot;The beautiful thing about learning is that no one can take it away from you.&quot;
            </h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-app-inset border border-app-border flex items-center justify-center text-app-brand font-black text-[10px] tracking-widest">
                BB
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">B.B. King</p>
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Legendary Musician</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          <Link href="#" className="hover:text-text-primary transition-colors">Help Center</Link>
          <Link href="#" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 bg-app-bg relative overflow-hidden">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden absolute top-8 flex items-center gap-1.5">
          <Link 
            href="/" 
            className="text-lg font-black text-text-primary tracking-tighter flex items-center gap-1.5"
            data-display="true"
          >
            <span className="w-5 h-5 rounded bg-app-brand flex items-center justify-center text-app-inset text-xs font-black">g</span>
            <span>gkvk<span className="text-app-brand">.ai</span></span>
          </Link>
        </div>

        <div className="w-full max-w-[420px] relative">
          <div className="relative bg-app-card border border-app-border rounded-2xl p-8 sm:p-10 shadow-xl overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-br from-app-brand/5 via-transparent to-transparent opacity-20 pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="text-center lg:text-left space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-text-primary" data-display="true">Welcome Back</h2>
                <p className="text-text-secondary text-xs">Sign in to continue your learning journey.</p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleLogin} 
                  variant="outline" 
                  disabled={isLoading}
                  className="w-full h-11 gap-2.5 font-bold border-app-border hover:bg-white/5 transition-all rounded-xl text-text-primary text-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full opacity-40 bg-app-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-text-muted">
                    <span className="bg-app-card px-3">or</span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                        {error}
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-bold text-text-primary uppercase tracking-wider ml-0.5">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                                mail
                              </span>
                              <Input
                                placeholder="name@example.com"
                                className="pl-12 h-11 bg-app-inset border border-app-border focus-visible:ring-app-brand text-text-primary rounded-xl text-xs"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <div className="flex justify-between items-center ml-0.5">
                            <FormLabel className="text-xs font-bold text-text-primary uppercase tracking-wider">Password</FormLabel>
                            <Link
                              href="#"
                              className="text-[10px] font-bold text-app-brand hover:underline underline-offset-4"
                            >
                              Forgot?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                                lock
                              </span>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-12 h-11 bg-app-inset border border-app-border focus-visible:ring-app-brand text-text-primary rounded-xl text-xs"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-11 font-bold bg-app-brand hover:bg-app-brand-hover text-app-inset rounded-xl mt-3 shadow-md border-none cursor-pointer text-xs"
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </div>

              <p className="text-center text-xs text-text-muted pt-2">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-app-brand hover:underline underline-offset-4">Sign up for free</Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
