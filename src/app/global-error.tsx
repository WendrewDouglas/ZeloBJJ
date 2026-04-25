"use client";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#e5e5e5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Algo deu errado
          </h2>
          <p style={{ color: "#a3a3a3", marginBottom: "1.5rem" }}>
            {error.message || "Erro inesperado. Tente novamente."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: 9999,
              background: "#c5a028",
              color: "#0a0a0a",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
