"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Globe } from "@/components/ui/globe";
import { BorderBeam } from "@/components/ui/border-beam";
import { handleGoogleLogin, handleEmailSignUp } from "@/config/client";
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

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setError("");
    
    try {
      const { data, error: signupError } = await handleEmailSignUp(values.email, values.password);
      
      if (!signupError) {
        setIsSuccess(true);
        // Supabase usually requires email verification, so we might not redirect immediately
        // But for this flow, let's assume they can go to dashboard or see a success message
        console.log("Signup successful:", data);
      } else {
        setError(signupError.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side: Aesthetic Branding */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-zinc-950 border-r border-white/5">
        <FlickeringGrid
          className="absolute inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
          squareSize={4}
          gridGap={6}
          color="#60a5fa"
          maxOpacity={0.15}
          flickerChance={0.1}
        />

        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
           <Globe className="top-20" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground rounded-xl p-2 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-2xl font-bold">auto_awesome</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">StudyAI</span>
          </Link>
        </div>

        <div className="relative z-10 w-full">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl space-y-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="material-symbols-outlined text-primary text-sm fill-current">star</span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white leading-[1.3] tracking-tight">
              &quot;Education is the most powerful weapon which you can use to change the world.&quot;
            </h1>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                NM
              </div>
              <div>
                <p className="text-white font-medium">Nelson Mandela</p>
                <p className="text-white/40 text-sm">Former President of South Africa</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 text-sm font-medium text-white/40">
          <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 bg-background relative overflow-hidden">
        <div className="lg:hidden absolute top-8 flex items-center gap-2">
           <span className="material-symbols-outlined text-primary text-3xl font-bold">auto_awesome</span>
           <span className="text-2xl font-bold tracking-tight">StudyAI</span>
        </div>

        <div className="w-full max-w-[450px] relative">
          <div className="relative bg-card/50 backdrop-blur-sm border border-muted-foreground/10 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden">
            <BorderBeam size={250} duration={12} delay={9} colorFrom="#60a5fa" colorTo="#c0c1ff" />
            <BorderBeam size={250} duration={12} delay={3} colorFrom="#c0c1ff" colorTo="#60a5fa" />
            
            <div className="space-y-8 relative z-10">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                <p className="text-muted-foreground text-sm">Start your intelligent learning journey today.</p>
              </div>

              {isSuccess ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                    </div>
                    <h3 className="text-lg font-bold">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification link to your email address. Please verify your account to continue.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold" asChild>
                    <Link href="/login">Back to Sign In</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Button 
                    onClick={handleGoogleLogin} 
                    variant="outline" 
                    disabled={isLoading}
                    className="w-full h-12 gap-3 font-medium border-muted-foreground/10 hover:bg-accent/50 transition-all rounded-xl"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Sign up with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full opacity-50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background/50 backdrop-blur-sm px-4 text-muted-foreground font-semibold tracking-widest">or</span>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                          {error}
                        </div>
                      )}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold ml-1">Email address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-lg">mail</span>
                                <Input 
                                  placeholder="name@example.com" 
                                  className="pl-12 h-12 bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary rounded-xl" 
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold ml-1">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-lg">lock</span>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="pl-12 h-12 bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary rounded-xl" 
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold shadow-lg shadow-primary/20 rounded-xl mt-2">
                        {isLoading ? "Creating account..." : "Sign Up"}
                      </Button>
                    </form>
                  </Form>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4">Sign in</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
