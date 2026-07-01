"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ParticlesBackground } from "@/components/landing/particles-background";
import { motion } from "motion/react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-app-bg text-text-primary">
      <ParticlesBackground />
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 px-4 max-w-4xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8 md:p-10 rounded-xl bg-app-card border border-app-border space-y-8 flex flex-col shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-app-border pb-6 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-app-brand/10 flex items-center justify-center text-app-brand border border-app-brand/20 shrink-0">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
                  Privacy Policy
                </h1>
                <p className="text-xs text-text-secondary">Last updated: June 23, 2026</p>
              </div>
            </div>

            {/* Policy Content */}
            <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  1. Introduction
                </h2>
                <p>
                  At <strong>GKVK AI</strong>, we take your privacy extremely seriously. This Privacy Policy document outlines the types of user data we collect, how it is processed and secured, and your choices regarding the study materials you upload to our platform.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  2. Information We Collect
                </h2>
                <p>We collect information to deliver a personalized, AI-driven study experience. This includes:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-1 text-xs text-text-secondary">
                  <li><strong>Account Metadata</strong>: Email addresses, names, and Google account profile photos retrieved during Google OAuth authentication.</li>
                  <li><strong>Academic Documents</strong>: Textbooks, notes, assignments, and past exam papers uploaded by you (in PDF, DOCX, or PPTX format) to generate study sets.</li>
                  <li><strong>Usage Statistics</strong>: Generation history, credit transaction logs, and search filters applied inside the community sharing feed.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  3. AI Processing & Document Security
                </h2>
                <p>
                  Any study material you upload is securely transmitted to our database hosted on <strong>Supabase</strong>. 
                  To generate summaries, mindmaps, flashcards, and quizzes, we process your document contents using <strong>Google Gemini API</strong> models.
                </p>
                <p>
                  Your uploaded documents are private by default. They are never shared publicly or indexed by search engines, unless you explicitly choose to publish them to our peer-to-peer <strong>Community Sharing Feed</strong> to earn extra credits.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  4. Payment Processing
                </h2>
                <p>
                  Credit packages are purchased securely via <strong>Razorpay</strong>. GKVK AI does not store or process your credit card numbers, netbanking credentials, or UPI PINs. All financial parameters are handled directly on Razorpay's PCI-DSS compliant checkout portals.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  5. Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, your data, or would like to request data deletion, please contact us:
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a href="mailto:roycomp44@gmail.com" className="p-3 bg-app-inset border border-app-border rounded-lg flex items-center gap-2 text-xs text-app-brand hover:bg-white/5 transition-colors w-fit">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    roycomp44@gmail.com
                  </a>
                  <a href="https://t.me/gkvk_ai_support" target="_blank" rel="noreferrer" className="p-3 bg-app-inset border border-app-border rounded-lg flex items-center gap-2 text-xs text-app-brand hover:bg-white/5 transition-colors w-fit">
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Telegram Support
                  </a>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
