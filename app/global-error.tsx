"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#e4e4e7",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Something went wrong
        </h2>
        <button
          onClick={unstable_retry}
          style={{
            padding: "0.5rem 1.25rem",
            backgroundColor: "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
