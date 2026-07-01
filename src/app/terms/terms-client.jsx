"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ParticlesBackground } from "@/components/landing/particles-background";
import { motion } from "motion/react";

export default function TermsPage() {
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
                <span className="material-symbols-outlined text-2xl">gavel</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
                  Terms of Service
                </h1>
                <p className="text-xs text-text-secondary">Last updated: June 23, 2026</p>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  1. Terms Acceptance
                </h2>
                <p>
                  By registering an account or using any feature on <strong>GKVK AI</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not access or use the platform.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  2. Credit Purchases & Refund Policy
                </h2>
                <p>
                  GKVK AI operates on a pay-as-you-go credits economy. 
                </p>
                <ul className="list-disc pl-5 space-y-1.5 mt-1 text-xs text-text-secondary">
                  <li><strong>Non-Refundable</strong>: All credit purchases made through Razorpay are final and non-refundable.</li>
                  <li><strong>Credit Deductions</strong>: Credits are deducted when trigger buttons are clicked to generate study suites (150 credits), mindmaps (2 credits), flashcards (2 credits), or quizzes (3 credits).</li>
                  <li><strong>Credit Expiration</strong>: Purchased credits do not expire and remain active on your account indefinitely until consumed.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  3. Acceptable Document Upload Rules
                </h2>
                <p>
                  When uploading lecture notes, slides, study logs, or past exam question papers, you warrant that you either own the copyright or have explicit permission to upload and process these documents.
                </p>
                <p>
                  You agree NOT to upload malicious files, copyrighted books without publisher permission, or inappropriate material to the public Community Sharing Feed. GKVK AI reserves the right to remove any file violating copyright rules.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  4. AI Output Disclaimer
                </h2>
                <p>
                  GKVK AI processes documents using automated generative AI technologies. While we strive to maintain the highest quality, AI-generated flashcards, summaries, and quizzes may occasionally contain factual errors, inconsistencies, or hallucinations.
                </p>
                <p>
                  All generated material is intended as a supplementary learning reference. GKVK AI does not warrant that materials are completely error-free or represent official university syllabus standards.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-brand" />
                  5. Contact & Inquiries
                </h2>
                <p>
                  For credit disputes, voucher inquiries, or other platform help, reach out to our team:
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
