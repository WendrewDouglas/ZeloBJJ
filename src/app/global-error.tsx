'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-dark text-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
          <p className="text-gray-400 mb-6">Ocorreu um erro inesperado.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
