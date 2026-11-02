export function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes pulse-amber {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
        }
      }
      .pulse-amber {
        animation: pulse-amber 2s infinite;
      }
    `}</style>
  );
}
