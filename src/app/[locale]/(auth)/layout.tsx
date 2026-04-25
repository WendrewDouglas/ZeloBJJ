export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-dark-light lg:flex">
        <Link href="/" className="mb-8">
          <Image src="/logo.png" alt="Zelo BJJ" width={120} height={120} />
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-white">
          ZELO <span className="text-gold">BJJ</span>
        </h1>
        <p className="max-w-xs text-center text-gray-text">
          Domine o Jiu-Jitsu Brasileiro com quem entende de verdade
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <Image src="/logo.png" alt="Zelo BJJ" width={48} height={48} />
            <span className="text-xl font-bold text-white">
              ZELO <span className="text-gold">BJJ</span>
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
