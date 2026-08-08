// BRIEF §6.1/12 — ilgili içerik bloğu. Faz 6'ya kadar aynı pillar'ın son
// yayınları (vektör benzerliği embedding backfill ile eklenecek).
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { ilgiliIcerikler } from "@/lib/db/queries/contents";

export async function IlgiliIcerikler({
  pillar,
  haricSlug,
}: {
  pillar: string;
  haricSlug: string;
}) {
  const icerikler = await ilgiliIcerikler(pillar, haricSlug);
  if (icerikler.length === 0) return null;

  return (
    <section aria-labelledby="ilgili-baslik">
      <h2 id="ilgili-baslik" className="font-display text-2xl font-bold">
        İlgili içerik
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {icerikler.map((icerik) => (
          <li key={icerik.id} className="min-w-0">
            <IcerikKarti icerik={icerik} />
          </li>
        ))}
      </ul>
    </section>
  );
}
