import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "StudyAI - Turn Chaotic Documents Into Crisp Study Suites",
  description: "AI-powered document synthesis that instantly transforms your scattered notes and PDFs into structured, interactive learning materials.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "dark", inter.variable)} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=auto_awesome,cloud_upload,description,history,home,image,picture_as_pdf,play_circle,quiz,account_tree,settings,style&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
