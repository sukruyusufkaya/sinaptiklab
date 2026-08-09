// BRIEF §6.2 — <Olcum id="..."> benchmark koleksiyonundan canlı veri bloğu.
// Faz 2 sonunda `benchmarks` koleksiyonuna bağlanacak; şimdilik placeholder.
export function Olcum({ id }: { id: string }) {
  return (
    <aside
      aria-label={`Ölçüm: ${id}`}
      className="my-6 border border-doku rounded-lg bg-kagit-alt px-4 py-3 font-mono text-sm text-murekkep-2"
    >
      Ölçüm verisi: <span className="text-murekkep">{id}</span> (benchmark koleksiyonu Faz 2 sonunda
      bağlanacak)
    </aside>
  );
}
