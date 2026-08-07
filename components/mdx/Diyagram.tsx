// BRIEF §6.2 — <Diyagram kod={mermaidKaynagi} svg={yayindaUretilenSvg} />
// svg varsa doğrudan basılır (yayın hattı sanitize etmekle yükümlü);
// yoksa mermaid kaynağı kod bloğu olarak gösterilir + derleme notu.
export function Diyagram({ kod, svg, baslik }: { kod: string; svg?: string; baslik?: string }) {
  if (svg !== undefined && svg.length > 0) {
    return (
      <figure
        role="img"
        aria-label={baslik ?? "Diyagram"}
        className="my-6 overflow-x-auto [&_svg]:max-w-full"
        // Yayın anında üretilmiş, sanitize edilmiş SVG — yayın hattı sorumlu.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  return (
    <figure className="my-6 border border-doku bg-kagit-alt p-4">
      <pre className="my-0 overflow-x-auto bg-transparent p-0 text-sm">
        <code>{kod}</code>
      </pre>
      <figcaption className="mt-2 font-mono text-xs text-murekkep-2">
        Diyagram yayında SVG&apos;ye derlenir.
      </figcaption>
    </figure>
  );
}
