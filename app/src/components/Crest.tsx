// Mostra o logótipo das Águias da Graça (public/logo.jpg).
// Se não existir, mostra o favicon como reserva.
export function Crest({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/logo.jpg"
      alt="Águias da Graça"
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith("/favicon.svg")) img.src = "/favicon.svg";
      }}
    />
  );
}
