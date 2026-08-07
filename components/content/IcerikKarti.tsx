// İçerik özet kartı — ana sayfa "Son yayınlar" akışı ve liste sayfaları.
// RSC; IcerikOzetDTO alır, başlık türün rotasına lib/rotalar ile bağlanır.
import Link from "next/link";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { icerikYolu, seviyeEtiketi, turEtiketi } from "@/lib/rotalar";

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

export function IcerikKarti({ icerik }: { icerik: IcerikOzetDTO }) {
  const tarih = TARIH_TR.format(new Date(icerik.publishedAt ?? icerik.updatedAt));

  return (
    <article className="flex h-full flex-col border border-doku bg-kagit-alt p-5">
      <p className="font-mono text-xs tracking-widest text-sinyal">
        {turEtiketi(icerik.type).toLocaleUpperCase("tr-TR")}
      </p>
      <h3 className="mt-2 font-display text-lg font-semibold">
        <Link
          href={icerikYolu(icerik.type, icerik.slug)}
          className="text-murekkep no-underline hover:text-sinyal"
        >
          {icerik.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-murekkep-2">{icerik.dek}</p>
      <p className="mt-auto pt-4 font-mono text-xs text-murekkep-2">
        {seviyeEtiketi(icerik.level)} · {icerik.readingMinutes} dk · {tarih}
      </p>
    </article>
  );
}
