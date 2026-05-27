"use client";

type TGlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: TGlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          background: "#0f172a",
          color: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1.5rem",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>Climatica</span>
        <p style={{ opacity: 0.7, maxWidth: "400px", margin: 0 }}>
          Something went wrong with the application. Please reload the page.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.5rem",
            borderRadius: "0.375rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "1rem",
          }}
        >
          Reload page
        </button>
      </body>
    </html>
  );
}
