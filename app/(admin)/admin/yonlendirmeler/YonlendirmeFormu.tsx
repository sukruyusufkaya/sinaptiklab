"use client";

// Yönlendirme ekleme formu — tek client parçası (useActionState ile sunucudan
// dönen hata/uyarı listesini basar). Doğrulamanın TAMAMI sunucuda (actions.ts);
// buradaki göstergeler yalnız anlık ipucudur, güvenlik sınırı değildir.
import { useActionState, useState } from "react";
import { yonlendirmeEkle, type YonlendirmeSonucu } from "./actions";

const ETIKET = "font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2";
const GIRDI =
  "mt-1 w-full border border-doku rounded-md bg-kagit px-3 py-2 font-mono text-sm text-murekkep";

const BASLANGIC: YonlendirmeSonucu = { ok: false, mesaj: "", hatalar: [], uyarilar: [] };

/** Anlık ipucu: site içi yol mu (yalnız görsel; sunucu yeniden doğrular). */
function yolIpucu(deger: string, mutlakIzinli: boolean): { simge: string; sinif: string } | null {
  const kirpilmis = deger.trim();
  if (kirpilmis.length === 0) return null;
  const gecerli =
    kirpilmis.startsWith("/") && !kirpilmis.startsWith("//") && !/\s/.test(kirpilmis)
      ? true
      : mutlakIzinli && /^https?:\/\/\S+$/i.test(kirpilmis);
  return gecerli
    ? { simge: "✓ geçerli", sinif: "text-onay" }
    : { simge: "✗ geçersiz yol", sinif: "text-uyari" };
}

export function YonlendirmeFormu() {
  const [durum, gonder, beklemede] = useActionState(yonlendirmeEkle, BASLANGIC);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [islenenMesaj, setIslenenMesaj] = useState("");

  // Başarılı kayıttan sonra alanları boşalt. useEffect DEĞİL: React'in
  // "render sırasında duruma göre durumu düzelt" deseni — aksiyon sonucu her
  // başarıda farklı bir mesaj taşıdığı için tam bir kez çalışır.
  if (durum.ok && durum.mesaj !== islenenMesaj) {
    setIslenenMesaj(durum.mesaj);
    setFrom("");
    setTo("");
  }

  const fromIpucu = yolIpucu(from, false);
  const toIpucu = yolIpucu(to, true);

  return (
    <form action={gonder} className="border border-doku rounded-lg bg-kagit-alt p-5">
      <p className={ETIKET}>yeni yönlendirme</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
        <div>
          <label htmlFor="yonlendirme-from" className={ETIKET}>
            Kaynak (from)
          </label>
          <input
            id="yonlendirme-from"
            name="from"
            type="text"
            value={from}
            onChange={(olay) => setFrom(olay.target.value)}
            placeholder="/makale/eski-slug"
            spellCheck={false}
            className={GIRDI}
          />
          <p className={`mt-1 font-mono text-[0.65rem] ${fromIpucu?.sinif ?? "text-murekkep-2"}`}>
            {fromIpucu?.simge ?? "site içi yol · / ile başlar"}
          </p>
        </div>
        <div>
          <label htmlFor="yonlendirme-to" className={ETIKET}>
            Hedef (to)
          </label>
          <input
            id="yonlendirme-to"
            name="to"
            type="text"
            value={to}
            onChange={(olay) => setTo(olay.target.value)}
            placeholder="/makale/yeni-slug"
            spellCheck={false}
            className={GIRDI}
          />
          <p className={`mt-1 font-mono text-[0.65rem] ${toIpucu?.sinif ?? "text-murekkep-2"}`}>
            {toIpucu?.simge ?? "site içi yol veya http(s):// adresi"}
          </p>
        </div>
        <div>
          <label htmlFor="yonlendirme-kod" className={ETIKET}>
            Kod
          </label>
          <select id="yonlendirme-kod" name="code" defaultValue="301" className={GIRDI}>
            <option value="301">301 kalıcı</option>
            <option value="308">308 kalıcı</option>
          </select>
          <p className="mt-1 font-mono text-[0.65rem] text-murekkep-2">308 metodu korur</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={beklemede} className="dugme-birincil disabled:opacity-50">
          {beklemede ? "Kaydediliyor…" : "Yönlendirme ekle"}
        </button>
        <div aria-live="polite" className="min-w-0 flex-1 space-y-1">
          {durum.ok && durum.mesaj.length > 0 && (
            <p className="font-mono text-xs text-onay">{durum.mesaj}</p>
          )}
          {durum.hatalar.map((hata) => (
            <p key={hata} className="text-sm text-uyari">
              {hata}
            </p>
          ))}
          {durum.uyarilar.map((uyari) => (
            <p key={uyari} className="text-sm text-olcum">
              Uyarı: {uyari}
            </p>
          ))}
        </div>
      </div>
    </form>
  );
}
