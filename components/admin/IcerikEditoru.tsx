"use client";

// İçerik editörü — BRIEF §11 Faz 2 alt kümesi. Sol kolon: form; sağ kolon:
// "Önizleme" (iframe → /admin/onizleme/<id>) / "Yayın Kontrolü" sekmeleri.
// Veri çekme YOK (server sayfalar düz props geçirir; useEffect-fetch yasağı);
// tüm durum useState'te, yazma yolları Server Action'lara gider.
//
// DİKKAT: lib/db/schemas'tan yalnız TYPE import edilir (barrel, mongodb'yi
// değer olarak çeker; client bundle'a giremez). Enum seçenekleri bu yüzden
// burada `satisfies` ile şema tiplerine sabitlenmiş yerel listelerdir.
import { useState, useTransition } from "react";
import { DurumRozeti } from "@/components/admin/DurumRozeti";
import type { AdminIcerikDTO, KonuSecenegiDTO, YazarSecenegiDTO } from "@/lib/db/queries/admin";
import type { Content, Kaynak } from "@/lib/db/schemas";
import {
  icerikDurumDegistir,
  icerikKaydet,
  icerikYayinla,
  type YayinSonucu,
} from "@/lib/editorial/actions";
import { DURUM_ETIKETLERI, type Durum } from "@/lib/editorial/durum-makinesi";
import { icerikYolu, seviyeEtiketi, turEtiketi, type IcerikTuru } from "@/lib/rotalar";

// ── Yerel seçenek listeleri (şema tiplerine `satisfies` ile bağlı) ──

const SEVIYELER = [
  "giris",
  "orta",
  "ileri",
  "uzman",
] as const satisfies readonly Content["level"][];

const KAYNAK_TURLERI = [
  { deger: "paper", etiket: "Akademik yayın (paper)" },
  { deger: "docs", etiket: "Resmî doküman (docs)" },
  { deger: "vendor", etiket: "Üretici (vendor)" },
  { deger: "data", etiket: "Veri seti (data)" },
  { deger: "news", etiket: "Haber (news)" },
  { deger: "own_field_data", etiket: "Kendi saha verimiz" },
] as const satisfies readonly { deger: Kaynak["kind"]; etiket: string }[];

/** Durum makinesindeki (durum-makinesi.ts) geçişlerin panel karşılığı. */
const GECIS_DUGMESI: Record<Durum, { hedef: Durum; etiket: string } | null> = {
  draft: { hedef: "in_review", etiket: "İncelemeye gönder" },
  in_review: { hedef: "draft", etiket: "Taslağa çek" },
  scheduled: { hedef: "draft", etiket: "Taslağa çek" },
  published: { hedef: "archived", etiket: "Arşivle" },
  archived: { hedef: "draft", etiket: "Taslağa çek" },
};

// ── Küçük yardımcılar ────────────────────────────────────────────────

const ETIKET = "font-mono text-xs uppercase tracking-wider text-murekkep-2";
const GIRDI = "mt-1 w-full border border-doku bg-kagit px-3 py-2 text-sm text-murekkep";
const DUGME =
  "border border-doku px-4 py-2 font-mono text-sm text-murekkep hover:border-sinyal hover:text-sinyal disabled:cursor-not-allowed disabled:opacity-50";
const BIRINCIL_DUGME =
  "border border-sinyal bg-sinyal px-4 py-2 font-mono text-sm text-kagit hover:bg-sinyal-dip disabled:cursor-not-allowed disabled:opacity-50";
const KUCUK_DUGME =
  "border border-doku px-2 py-1 font-mono text-xs text-murekkep-2 hover:border-uyari hover:text-uyari";

function bugunTarihGirdisi(): string {
  return new Date().toISOString().slice(0, 10);
}

/** ISO string → date input değeri (yyyy-mm-dd). */
function tarihGirdisi(iso: string): string {
  return iso.slice(0, 10);
}

function kelimeSay(metin: string): number {
  return metin.split(/\s+/).filter((kelime) => kelime.length > 0).length;
}

function seviyeCoz(deger: string): Content["level"] {
  return SEVIYELER.find((seviye) => seviye === deger) ?? "orta";
}

function kaynakTuruCoz(deger: string): Kaynak["kind"] {
  return KAYNAK_TURLERI.find((tur) => tur.deger === deger)?.deger ?? "docs";
}

interface KaynakSatiri {
  label: string;
  url: string;
  publisher: string;
  kind: Kaynak["kind"];
  accessedAt: string; // yyyy-mm-dd (date input)
}

interface SssSatiri {
  q: string;
  a: string;
}

interface Props {
  /** null → yeni içerik; dolu → mevcut içeriğin düzenlenmesi. */
  icerik: AdminIcerikDTO | null;
  varsayilanTur: IcerikTuru;
  konular: KonuSecenegiDTO[];
  yazarSecenekleri: YazarSecenegiDTO[];
}

export function IcerikEditoru({ icerik, varsayilanTur, konular, yazarSecenekleri }: Props) {
  const tur = icerik?.type ?? varsayilanTur;
  const pillarlar = konular.filter((konu) => konu.kind === "pillar");

  // ── Form durumu ────────────────────────────────────────────────────
  const [id, setId] = useState<string | null>(icerik?.id ?? null);
  const [durum, setDurum] = useState<Durum | null>(icerik?.status ?? null);
  const [baslik, setBaslik] = useState(icerik?.title ?? "");
  const [slug, setSlug] = useState(icerik?.slug ?? "");
  const [dek, setDek] = useState(icerik?.dek ?? "");
  const [kisaCevap, setKisaCevap] = useState(icerik?.answerFirst ?? "");
  const [seviye, setSeviye] = useState<Content["level"]>(icerik?.level ?? "orta");
  const [pillar, setPillar] = useState(icerik?.pillar ?? pillarlar[0]?.slug ?? "");
  const [clusters, setClusters] = useState<string[]>(icerik?.clusters ?? []);
  const [tagsMetni, setTagsMetni] = useState((icerik?.tags ?? []).join(", "));
  const [yazarlar, setYazarlar] = useState<string[]>(icerik?.authors ?? []);
  const [teknikEditor, setTeknikEditor] = useState(icerik?.technicalReviewer ?? "");
  const [dogrulamaTarihi, setDogrulamaTarihi] = useState(
    icerik !== null ? tarihGirdisi(icerik.lastVerifiedAt) : bugunTarihGirdisi(),
  );
  const [govde, setGovde] = useState(icerik?.body ?? "");
  const [sss, setSss] = useState<SssSatiri[]>(icerik?.faq ?? []);
  const [kaynaklar, setKaynaklar] = useState<KaynakSatiri[]>(
    (icerik?.sources ?? []).map((kaynak) => ({
      label: kaynak.label,
      url: kaynak.url,
      publisher: kaynak.publisher,
      kind: kaynak.kind,
      accessedAt: tarihGirdisi(kaynak.accessedAt),
    })),
  );
  const [seoAciklama, setSeoAciklama] = useState(icerik?.seo.description ?? "");

  // ── Panel durumu ───────────────────────────────────────────────────
  const [beklemede, gecisBaslat] = useTransition();
  const [kayitMesaji, setKayitMesaji] = useState("");
  const [hatalar, setHatalar] = useState<string[]>([]);
  const [kayitSayisi, setKayitSayisi] = useState(0);
  const [sekme, setSekme] = useState<"onizleme" | "kontrol">("onizleme");
  const [yayinSonucu, setYayinSonucu] = useState<YayinSonucu | null>(null);

  const clusterSecenekleri = konular.filter(
    (konu) => konu.kind === "cluster" && konu.parent === pillar,
  );

  const dekSayisi = dek.length;
  const dekAralikta = dekSayisi >= 140 && dekSayisi <= 180;
  const kisaCevapKelime = kelimeSay(kisaCevap);
  const kisaCevapAralikta = kisaCevapKelime >= 40 && kisaCevapKelime <= 80;

  // ── Form → IcerikGirdisi serileştirme ──────────────────────────────
  // actions.ts girdi sözleşmesi: ObjectId alanları 24'lük hex STRING, tarihler
  // ISO-ayrıştırılabilir string. Formda alanı olmayan repro/relatedManual/i18n
  // ve seo'nun diğer alanları, mevcut belgeden DEĞİŞMEDEN geri taşınır ki
  // kaydet veri kaybetmesin (yeni içerikte null/[]/{lang:"tr"}).
  function girdiOlustur(): Record<string, unknown> {
    const temizSlug = slug.trim();
    const seo: Record<string, unknown> = { ...(icerik?.seo ?? {}) };
    const temizAciklama = seoAciklama.trim();
    if (temizAciklama.length > 0) seo["description"] = temizAciklama;
    else delete seo["description"];

    return {
      ...(id !== null ? { id } : {}),
      type: tur,
      ...(temizSlug.length > 0 ? { slug: temizSlug } : {}),
      title: baslik,
      dek,
      answerFirst: kisaCevap,
      body: govde,
      level: seviye,
      pillar,
      clusters,
      tags: tagsMetni
        .split(",")
        .map((etiket) => etiket.trim())
        .filter((etiket) => etiket.length > 0),
      authors: yazarlar,
      technicalReviewer: teknikEditor.length > 0 ? teknikEditor : null,
      lastVerifiedAt: dogrulamaTarihi,
      faq: sss
        .map((satir) => ({ q: satir.q.trim(), a: satir.a.trim() }))
        .filter((satir) => satir.q.length > 0 || satir.a.length > 0),
      sources: kaynaklar,
      repro: icerik?.repro ?? null,
      relatedManual: icerik?.relatedManual ?? [],
      seo,
      i18n: icerik?.i18n ?? { lang: "tr" },
    };
  }

  // ── Aksiyonlar ─────────────────────────────────────────────────────

  function kaydet() {
    gecisBaslat(async () => {
      const sonuc = await icerikKaydet(girdiOlustur());
      if (sonuc.ok) {
        const ilkKayit = id === null;
        setId(sonuc.id);
        setSlug(sonuc.slug);
        if (ilkKayit) setDurum("draft");
        setHatalar([]);
        setKayitMesaji(
          ilkKayit ? `Taslak oluşturuldu (/${sonuc.slug}).` : `Kaydedildi (/${sonuc.slug}).`,
        );
        setKayitSayisi((sayi) => sayi + 1); // iframe key'i değişir → önizleme yenilenir
      } else {
        setKayitMesaji("");
        setHatalar(sonuc.hatalar);
      }
    });
  }

  function yayinla() {
    if (id === null) return;
    gecisBaslat(async () => {
      const sonuc = await icerikYayinla(id);
      setYayinSonucu(sonuc);
      if (sonuc.ok) {
        setDurum("published");
        setKayitMesaji("İçerik yayınlandı.");
        setHatalar([]);
      }
    });
  }

  function durumGecisi(hedef: Durum) {
    if (id === null) return;
    gecisBaslat(async () => {
      const sonuc = await icerikDurumDegistir(id, hedef);
      if (sonuc.ok) {
        setDurum(sonuc.durum);
        setHatalar([]);
        setKayitMesaji(`Durum güncellendi: ${DURUM_ETIKETLERI[sonuc.durum]}.`);
      } else {
        setKayitMesaji("");
        setHatalar(sonuc.hatalar);
      }
    });
  }

  // ── Satır yardımcıları ─────────────────────────────────────────────

  function pillarDegistir(yeniPillar: string) {
    setPillar(yeniPillar);
    // Önceki pillar'ın cluster seçimleri yeni ağaçta geçersizdir — ayıkla.
    setClusters((mevcut) =>
      mevcut.filter((secili) =>
        konular.some(
          (konu) => konu.kind === "cluster" && konu.parent === yeniPillar && konu.slug === secili,
        ),
      ),
    );
  }

  function clusterSec(clusterSlug: string) {
    setClusters((mevcut) =>
      mevcut.includes(clusterSlug)
        ? mevcut.filter((secili) => secili !== clusterSlug)
        : [...mevcut, clusterSlug],
    );
  }

  function yazarSec(yazarId: string) {
    setYazarlar((mevcut) =>
      mevcut.includes(yazarId)
        ? mevcut.filter((secili) => secili !== yazarId)
        : [...mevcut, yazarId],
    );
  }

  function sssGuncelle(sira: number, degisiklik: Partial<SssSatiri>) {
    setSss((mevcut) =>
      mevcut.map((satir, i) => (i === sira ? { ...satir, ...degisiklik } : satir)),
    );
  }

  function kaynakGuncelle(sira: number, degisiklik: Partial<KaynakSatiri>) {
    setKaynaklar((mevcut) =>
      mevcut.map((satir, i) => (i === sira ? { ...satir, ...degisiklik } : satir)),
    );
  }

  const gecis = durum !== null ? GECIS_DUGMESI[durum] : null;

  // ── Görünüm ────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
      <h1 className="font-display text-2xl font-bold">
        {icerik === null ? `Yeni içerik — ${turEtiketi(tur)}` : "İçeriği düzenle"}
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* ── SOL: form ── */}
        <form
          onSubmit={(olay) => {
            olay.preventDefault();
            kaydet();
          }}
          className="space-y-5"
        >
          <div>
            <span className={ETIKET}>Tür</span>
            <p className="mt-1 border border-doku bg-kagit-alt px-3 py-2 font-mono text-sm">
              {turEtiketi(tur)} ({tur})
            </p>
          </div>

          <div>
            <label htmlFor="alan-baslik" className={ETIKET}>
              Başlık
            </label>
            <input
              id="alan-baslik"
              type="text"
              value={baslik}
              onChange={(olay) => setBaslik(olay.target.value)}
              className={GIRDI}
            />
          </div>

          <div>
            <label htmlFor="alan-slug" className={ETIKET}>
              Slug
            </label>
            <input
              id="alan-slug"
              type="text"
              value={slug}
              onChange={(olay) => setSlug(olay.target.value)}
              className={`${GIRDI} font-mono`}
            />
            <p className="mt-1 text-xs text-murekkep-2">
              Boş bırakılırsa başlıktan otomatik üretilir.
            </p>
          </div>

          <div>
            <label htmlFor="alan-dek" className={ETIKET}>
              Dek
            </label>
            <textarea
              id="alan-dek"
              value={dek}
              onChange={(olay) => setDek(olay.target.value)}
              rows={3}
              className={GIRDI}
            />
            <p
              className={`mt-1 font-mono text-xs ${dekAralikta ? "text-onay" : "text-uyari"}`}
              aria-live="polite"
            >
              {dekSayisi} karakter — hedef 140–180
            </p>
          </div>

          <div>
            <label htmlFor="alan-kisa-cevap" className={ETIKET}>
              Kısa cevap (answerFirst)
            </label>
            <textarea
              id="alan-kisa-cevap"
              value={kisaCevap}
              onChange={(olay) => setKisaCevap(olay.target.value)}
              rows={4}
              className={GIRDI}
            />
            <p
              className={`mt-1 font-mono text-xs ${kisaCevapAralikta ? "text-onay" : "text-uyari"}`}
              aria-live="polite"
            >
              {kisaCevapKelime} kelime — hedef 40–80
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="alan-seviye" className={ETIKET}>
                Seviye
              </label>
              <select
                id="alan-seviye"
                value={seviye}
                onChange={(olay) => setSeviye(seviyeCoz(olay.target.value))}
                className={GIRDI}
              >
                {SEVIYELER.map((secenek) => (
                  <option key={secenek} value={secenek}>
                    {seviyeEtiketi(secenek)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="alan-pillar" className={ETIKET}>
                Pillar
              </label>
              <select
                id="alan-pillar"
                value={pillar}
                onChange={(olay) => pillarDegistir(olay.target.value)}
                className={GIRDI}
              >
                {pillarlar.map((secenek) => (
                  <option key={secenek.slug} value={secenek.slug}>
                    {secenek.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={ETIKET}>Cluster&apos;lar (seçili pillar&apos;dan)</legend>
            {clusterSecenekleri.length === 0 ? (
              <p className="mt-1 text-sm text-murekkep-2">Bu pillar altında tanımlı cluster yok.</p>
            ) : (
              <div className="mt-2 grid max-h-48 gap-1 overflow-y-auto border border-doku p-3 sm:grid-cols-2">
                {clusterSecenekleri.map((secenek) => (
                  <label key={secenek.slug} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={clusters.includes(secenek.slug)}
                      onChange={() => clusterSec(secenek.slug)}
                    />
                    {secenek.title}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <div>
            <label htmlFor="alan-tags" className={ETIKET}>
              Etiketler (virgülle ayırın)
            </label>
            <input
              id="alan-tags"
              type="text"
              value={tagsMetni}
              onChange={(olay) => setTagsMetni(olay.target.value)}
              className={`${GIRDI} font-mono`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset>
              <legend className={ETIKET}>Yazarlar</legend>
              <div className="mt-2 space-y-1 border border-doku p-3">
                {yazarSecenekleri.map((yazar) => (
                  <label key={yazar.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={yazarlar.includes(yazar.id)}
                      onChange={() => yazarSec(yazar.id)}
                    />
                    {yazar.name}
                    <span className="text-xs text-murekkep-2">{yazar.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="alan-teknik-editor" className={ETIKET}>
                Teknik editör (opsiyonel)
              </label>
              <select
                id="alan-teknik-editor"
                value={teknikEditor}
                onChange={(olay) => setTeknikEditor(olay.target.value)}
                className={GIRDI}
              >
                <option value="">— yok —</option>
                {yazarSecenekleri.map((yazar) => (
                  <option key={yazar.id} value={yazar.id}>
                    {yazar.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="alan-dogrulama" className={ETIKET}>
              Son veri doğrulaması (lastVerifiedAt)
            </label>
            <input
              id="alan-dogrulama"
              type="date"
              value={dogrulamaTarihi}
              onChange={(olay) => setDogrulamaTarihi(olay.target.value)}
              className={`${GIRDI} font-mono sm:max-w-56`}
            />
          </div>

          <div>
            <label htmlFor="alan-govde" className={ETIKET}>
              Gövde (MDX)
            </label>
            <textarea
              id="alan-govde"
              value={govde}
              onChange={(olay) => setGovde(olay.target.value)}
              spellCheck={false}
              className={`${GIRDI} min-h-[24rem] font-mono`}
            />
          </div>

          {/* SSS — dinamik satırlar */}
          <fieldset>
            <legend className={ETIKET}>SSS (yayın için en az 2 soru)</legend>
            <div className="mt-2 space-y-3">
              {sss.map((satir, sira) => (
                <div key={sira} className="border border-doku p-3">
                  <div className="flex items-start justify-between gap-2">
                    <label htmlFor={`sss-soru-${sira}`} className={ETIKET}>
                      Soru {sira + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSss((mevcut) => mevcut.filter((_, i) => i !== sira))}
                      className={KUCUK_DUGME}
                    >
                      Sil
                    </button>
                  </div>
                  <input
                    id={`sss-soru-${sira}`}
                    type="text"
                    value={satir.q}
                    onChange={(olay) => sssGuncelle(sira, { q: olay.target.value })}
                    className={GIRDI}
                  />
                  <label htmlFor={`sss-cevap-${sira}`} className={`${ETIKET} mt-2 block`}>
                    Cevap
                  </label>
                  <textarea
                    id={`sss-cevap-${sira}`}
                    value={satir.a}
                    onChange={(olay) => sssGuncelle(sira, { a: olay.target.value })}
                    rows={2}
                    className={GIRDI}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSss((mevcut) => [...mevcut, { q: "", a: "" }])}
                className={DUGME}
              >
                + Soru ekle
              </button>
            </div>
          </fieldset>

          {/* Kaynaklar — dinamik satırlar */}
          <fieldset>
            <legend className={ETIKET}>Kaynaklar</legend>
            {kaynaklar.length === 0 && (
              <p className="mt-1 text-sm text-uyari">
                En az 1 kaynak ekleyin — kaynaksız içerik kaydedilse bile yayınlanamaz.
              </p>
            )}
            <div className="mt-2 space-y-3">
              {kaynaklar.map((satir, sira) => (
                <div key={sira} className="border border-doku p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-sinyal">[{sira + 1}]</span>
                    <button
                      type="button"
                      onClick={() => setKaynaklar((mevcut) => mevcut.filter((_, i) => i !== sira))}
                      className={KUCUK_DUGME}
                    >
                      Sil
                    </button>
                  </div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`kaynak-etiket-${sira}`} className={ETIKET}>
                        Etiket
                      </label>
                      <input
                        id={`kaynak-etiket-${sira}`}
                        type="text"
                        value={satir.label}
                        onChange={(olay) => kaynakGuncelle(sira, { label: olay.target.value })}
                        className={GIRDI}
                      />
                    </div>
                    <div>
                      <label htmlFor={`kaynak-url-${sira}`} className={ETIKET}>
                        URL
                      </label>
                      <input
                        id={`kaynak-url-${sira}`}
                        type="url"
                        value={satir.url}
                        onChange={(olay) => kaynakGuncelle(sira, { url: olay.target.value })}
                        className={`${GIRDI} font-mono`}
                      />
                    </div>
                    <div>
                      <label htmlFor={`kaynak-yayinci-${sira}`} className={ETIKET}>
                        Yayıncı
                      </label>
                      <input
                        id={`kaynak-yayinci-${sira}`}
                        type="text"
                        value={satir.publisher}
                        onChange={(olay) => kaynakGuncelle(sira, { publisher: olay.target.value })}
                        className={GIRDI}
                      />
                    </div>
                    <div>
                      <label htmlFor={`kaynak-tur-${sira}`} className={ETIKET}>
                        Tür
                      </label>
                      <select
                        id={`kaynak-tur-${sira}`}
                        value={satir.kind}
                        onChange={(olay) =>
                          kaynakGuncelle(sira, { kind: kaynakTuruCoz(olay.target.value) })
                        }
                        className={GIRDI}
                      >
                        {KAYNAK_TURLERI.map((secenek) => (
                          <option key={secenek.deger} value={secenek.deger}>
                            {secenek.etiket}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`kaynak-erisim-${sira}`} className={ETIKET}>
                        Erişim tarihi
                      </label>
                      <input
                        id={`kaynak-erisim-${sira}`}
                        type="date"
                        value={satir.accessedAt}
                        onChange={(olay) => kaynakGuncelle(sira, { accessedAt: olay.target.value })}
                        className={`${GIRDI} font-mono`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setKaynaklar((mevcut) => [
                    ...mevcut,
                    {
                      label: "",
                      url: "",
                      publisher: "",
                      kind: "docs",
                      accessedAt: bugunTarihGirdisi(),
                    },
                  ])
                }
                className={DUGME}
              >
                + Kaynak ekle
              </button>
            </div>
          </fieldset>

          <div>
            <label htmlFor="alan-seo-aciklama" className={ETIKET}>
              SEO açıklaması (seo.description)
            </label>
            <textarea
              id="alan-seo-aciklama"
              value={seoAciklama}
              onChange={(olay) => setSeoAciklama(olay.target.value)}
              rows={2}
              className={GIRDI}
            />
          </div>
        </form>

        {/* ── SAĞ: Önizleme / Yayın Kontrolü ── */}
        <section
          aria-label="Önizleme ve yayın kontrolü"
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <div className="flex gap-2 border-b border-doku">
            <button
              type="button"
              onClick={() => setSekme("onizleme")}
              aria-pressed={sekme === "onizleme"}
              className={`px-4 py-2 font-mono text-sm ${
                sekme === "onizleme"
                  ? "border border-b-0 border-doku text-sinyal"
                  : "text-murekkep-2 hover:text-sinyal"
              }`}
            >
              Önizleme
            </button>
            <button
              type="button"
              onClick={() => setSekme("kontrol")}
              aria-pressed={sekme === "kontrol"}
              className={`px-4 py-2 font-mono text-sm ${
                sekme === "kontrol"
                  ? "border border-b-0 border-doku text-sinyal"
                  : "text-murekkep-2 hover:text-sinyal"
              }`}
            >
              Yayın Kontrolü
            </button>
          </div>

          {sekme === "onizleme" &&
            (id === null ? (
              <p className="mt-4 border border-doku bg-kagit-alt p-4 text-sm text-murekkep-2">
                Önizleme için önce içeriği <strong>Kaydet</strong> ile kaydedin — taslak
                oluşturulunca burada canlı görünüm belirir.
              </p>
            ) : (
              <>
                {/* key her başarılı kayıtta değişir → iframe taze render alır */}
                <iframe
                  key={`${id}-${kayitSayisi}`}
                  src={`/admin/onizleme/${id}`}
                  title="İçerik önizleme"
                  className="mt-4 h-[70vh] w-full border border-doku bg-kagit"
                />
                <p className="mt-2 font-mono text-xs text-murekkep-2">
                  Önizleme kaydedilmiş sürümü gösterir; formdaki değişiklikler için önce Kaydet.
                </p>
              </>
            ))}

          {sekme === "kontrol" && (
            <div className="mt-4">
              <button
                type="button"
                onClick={yayinla}
                disabled={beklemede || id === null}
                className={BIRINCIL_DUGME}
              >
                Yayınla
              </button>
              {id === null && (
                <p className="mt-2 text-sm text-murekkep-2">
                  Yayın kontrolü için önce içeriği kaydedin.
                </p>
              )}
              {id !== null && yayinSonucu === null && (
                <p className="mt-2 text-sm text-murekkep-2">
                  Yayınla, kaydedilmiş sürümü BRIEF §4.3&apos;teki 10 kontrolden geçirir; hepsi
                  geçmeden içerik yayına çıkmaz.
                </p>
              )}

              {yayinSonucu !== null &&
                (yayinSonucu.ok ? (
                  <div className="mt-4 border border-onay p-4">
                    <p className="text-onay">Tüm kontroller geçti — içerik yayında.</p>
                    <p className="mt-2 text-sm">
                      <a
                        href={icerikYolu(tur, yayinSonucu.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Canlı sayfayı aç: {icerikYolu(tur, yayinSonucu.slug)}
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {yayinSonucu.hatalar !== undefined && yayinSonucu.hatalar.length > 0 && (
                      <ul className="space-y-1 border border-uyari p-3 text-sm text-uyari">
                        {yayinSonucu.hatalar.map((hata) => (
                          <li key={hata}>{hata}</li>
                        ))}
                      </ul>
                    )}
                    {yayinSonucu.kontroller.length > 0 && (
                      <ul className="space-y-2">
                        {yayinSonucu.kontroller.map((kontrol) => (
                          <li key={kontrol.kural} className="border border-doku p-3 text-sm">
                            <p className={kontrol.gecti ? "text-onay" : "text-uyari"}>
                              <span aria-hidden className="mr-2 font-mono">
                                {kontrol.gecti ? "✓" : "✗"}
                              </span>
                              <span className="sr-only">{kontrol.gecti ? "geçti:" : "kaldı:"}</span>
                              <span className="font-mono text-xs uppercase tracking-wider">
                                {kontrol.kural}
                              </span>
                            </p>
                            <p className="mt-1 text-murekkep-2">{kontrol.mesaj}</p>
                            {kontrol.oneriler !== undefined && kontrol.oneriler.length > 0 && (
                              <p className="mt-1 font-mono text-xs text-murekkep-2">
                                Öneri: {kontrol.oneriler.join(", ")}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Alt bar ── */}
      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-doku bg-kagit py-4">
        <button type="button" onClick={kaydet} disabled={beklemede} className={BIRINCIL_DUGME}>
          {beklemede ? "Çalışıyor…" : "Kaydet"}
        </button>
        {durum !== null ? (
          <DurumRozeti durum={durum} />
        ) : (
          <span className="font-mono text-xs text-murekkep-2">henüz kaydedilmedi</span>
        )}
        {gecis !== null && id !== null && (
          <button
            type="button"
            onClick={() => durumGecisi(gecis.hedef)}
            disabled={beklemede}
            className={DUGME}
          >
            {gecis.etiket}
          </button>
        )}
        <div aria-live="polite" className="min-w-0 flex-1">
          {kayitMesaji.length > 0 && <p className="text-sm text-onay">{kayitMesaji}</p>}
          {hatalar.length > 0 && (
            <ul className="space-y-1 text-sm text-uyari">
              {hatalar.map((hata) => (
                <li key={hata}>{hata}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
