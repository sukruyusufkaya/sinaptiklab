// YZ Görünürlük paneli (BRIEF §8.5 + §11): AI asistan referral'ları —
// hangi motor, hangi sayfalar, son 30 gün. Veri events koleksiyonundan
// (90 gün TTL); kayıt kaynağı components/analytics/OlayBeacon.
import type { Event } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const SAYI_TR = new Intl.NumberFormat("tr-TR");

interface GrupSatiri {
  _id: string;
  adet: number;
}

async function panelVerisi() {
  const db = await getDb();
  const otuzGunOnce = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const koleksiyon = db.collection<Event>("events");

  const [yzMotorlar, yzSayfalar, digerReferrerlar, toplamYz] = await Promise.all([
    koleksiyon
      .aggregate<GrupSatiri>([
        { $match: { aiAgent: { $exists: true }, ts: { $gte: otuzGunOnce } } },
        { $group: { _id: "$aiAgent", adet: { $sum: 1 } } },
        { $sort: { adet: -1 } },
      ])
      .toArray(),
    koleksiyon
      .aggregate<GrupSatiri>([
        { $match: { aiAgent: { $exists: true }, ts: { $gte: otuzGunOnce } } },
        { $group: { _id: "$path", adet: { $sum: 1 } } },
        { $sort: { adet: -1 } },
        { $limit: 15 },
      ])
      .toArray(),
    koleksiyon
      .aggregate<GrupSatiri>([
        { $match: { aiAgent: { $exists: false }, ts: { $gte: otuzGunOnce } } },
        { $group: { _id: "$referrerHost", adet: { $sum: 1 } } },
        { $sort: { adet: -1 } },
        { $limit: 10 },
      ])
      .toArray(),
    koleksiyon.countDocuments({ aiAgent: { $exists: true }, ts: { $gte: otuzGunOnce } }),
  ]);

  return { yzMotorlar, yzSayfalar, digerReferrerlar, toplamYz };
}

function Tablo({ baslik, satirlar }: { baslik: string; satirlar: GrupSatiri[] }) {
  return (
    <section className="border border-doku">
      <h2 className="border-b border-doku bg-kagit-alt px-4 py-2 font-mono text-xs uppercase tracking-widest text-murekkep-2">
        {baslik}
      </h2>
      {satirlar.length === 0 ? (
        <p className="px-4 py-6 text-sm text-murekkep-2">
          Henüz kayıt yok — veri, ziyaretçiler YZ asistanlarından geldikçe birikir.
        </p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {satirlar.map((satir) => (
              <tr key={satir._id} className="border-b border-doku last:border-b-0">
                <td className="max-w-0 truncate px-4 py-2 font-mono text-xs">{satir._id}</td>
                <td className="w-24 px-4 py-2 text-right font-mono text-xs text-sinyal">
                  {SAYI_TR.format(satir.adet)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function GeoPaneli() {
  const veri = await panelVerisi();

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
      <h1 className="font-display text-2xl font-bold">YZ Görünürlük</h1>
      <p className="mt-2 max-w-[60ch] text-sm text-murekkep-2">
        Son 30 günde YZ asistanlarından (ChatGPT, Perplexity, Claude, Gemini, Copilot) gelen
        ziyaretler. Toplam:{" "}
        <span className="font-mono text-sinyal">{SAYI_TR.format(veri.toplamYz)}</span>
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Tablo baslik="YZ motoru bazında" satirlar={veri.yzMotorlar} />
        <Tablo baslik="Diğer referrer'lar (ilk 10)" satirlar={veri.digerReferrerlar} />
      </div>
      <div className="mt-6">
        <Tablo baslik="YZ trafiği alan sayfalar (ilk 15)" satirlar={veri.yzSayfalar} />
      </div>
      <p className="mt-6 font-mono text-xs text-murekkep-2">
        Kaynak: events koleksiyonu (90 gün TTL) · haftalık manuel prompt seti denetimi Faz 10
        operasyonunda (BRIEF §8.5)
      </p>
    </div>
  );
}
