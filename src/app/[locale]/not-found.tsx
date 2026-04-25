export const dynamic = 'force-dynamic';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
        <p className="text-gray-400 mb-8">
          A página que você está procurando não existe.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
