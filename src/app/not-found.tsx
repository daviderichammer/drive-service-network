import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center px-4">
        <div className="font-montserrat font-black text-white/10 text-[180px] leading-none select-none">
          404
        </div>
        <div className="-mt-16 relative z-10">
          <h1 className="font-montserrat font-bold text-white text-3xl md:text-4xl mb-4">
            Page Not Found
          </h1>
          <p className="font-opensans text-white/60 text-lg mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link href="/">
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">
                <ArrowLeft className="w-5 h-5" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
