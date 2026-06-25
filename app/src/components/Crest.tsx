// Mostra o escudo das Águias da Graça (public/escudo.png).
// Enquanto o ficheiro não existir, mostra o favicon como reserva.
export function Crest({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/escudo.png"
      alt="Águias da Graça"
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith("/logo.jpg")) img.src = "/logo.jpg";
      }}
    />
  );
}
