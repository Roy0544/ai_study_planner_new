import Link from "next/link";

export function Footer() {
  return (
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
  );
}
