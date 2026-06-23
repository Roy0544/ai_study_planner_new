import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-muted-foreground/10 py-12 bg-background relative z-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Gkvk_AI</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Building the future of personalized, AI-driven agricultural and scientific education.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-foreground">Product</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-foreground">Support</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="mailto:roycomp44@gmail.com" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">mail</span>
              Support Mail
            </a></li>
            <li><a href="https://t.me/gkvk_ai_support" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">send</span>
              Telegram Group
            </a></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Privacy Policy
            </Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">gavel</span>
              Terms of Service
            </Link></li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-foreground">Connect</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="https://github.com/Roy0544" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">code</span>
              GitHub Profile
            </a></li>
            <li><a href="https://portfolio-nine-sable-39sv0g5oqj.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">person</span>
              My Portfolio
            </a></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-muted-foreground/5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GKVK AI. All rights reserved.
      </div>
    </footer>
  );
}
