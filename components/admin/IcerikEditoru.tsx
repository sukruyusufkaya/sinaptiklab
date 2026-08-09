"use client";

// İçerik editörü — BRIEF §11. Sol kolon: form; sağ kolon "Önizleme" /
// "SEO" / "Yayın Kontrolü" sekmeleri (iframe → /admin/onizleme/<id>).
// Veri çekme YOK (server sayfalar düz props geçirir; useEffect-fetch yasağı);
// tüm durum useState'te, yazma yolları Server Action'lara gider.
//
// DİKKAT: lib/db/schemas'tan yalnız TYPE import edilir (barrel, mongodb'yi
// değer olarak çeker; client bundle'a giremez). Enum seçenekleri bu yüzden
// burada `satisfies` ile şema tiplerine sabitlenmiş yerel listelerdir.
import { useState, useTransition } from "react";
import { DurumRozeti } from "@/components/admin/DurumRozeti";
import { PanelBasligi } from "@/components/admin/PanelBasligi";
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

/** §4.3 kural 6: bu türlerde repro.repoUrl olmadan yayın yapılamaz. */
const REPRO_ZORUNLU_TURLER = ["tutorial", "lab"] as const satisfies readonly IcerikTuru[];

// SEO hedefleri (BRIEF §7.1): title ≤60, description ≤155 karakter.
const SEO_BASLIK_SINIRI = 60;
const SEO_ACIKLAMA_SINIRI = 155;

// ── Küçük yardımcılar ────────────────────────────────────────────────

const ETIKET = "font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2";
const GIRDI = "mt-1 w-full border border-doku rounded-md bg-kagit px-3 py-2 text-sm text-murekkep";
const KUCUK_DUGME =
  "border border-doku rounded-md px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-murekkep-2 transition-colors hover:border-uyari hover:text-uyari";
const KUTU = "border border-doku rounded-lg bg-kagit-alt p-4";

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

/** Anlık URL göstergesi — http(s) ile başlayan, boşluksuz adres. */
function urlGecerliMi(deger: string): boolean {
  return /^https?:\/\/\S+$/i.test(deger.trim());
}

function repoZorunluMu(tur: IcerikTuru): boolean {
  return REPRO_ZORUNLU_TURLER.some((aday) => aday === tur);
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
  /** SERP önizlemesinde gösterilen kanonik host (env'den, sunucudan gelir). */
  siteHost: string;
}

export function IcerikEditoru({
  icerik,
  varsayilanTur,
  konular,
  yazarSecenekleri,
  siteHost,
}: Props) {
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
  const [seoBaslik, setSeoBaslik] = useState(icerik?.seo.title ?? "");
  const [seoAciklama, setSeoAciklama] = useState(icerik?.seo.description ?? "");

  // Yeniden üretilebilirlik (BRIEF §4.1 repro / §6): tutorial ve lab için şart.
  const [repoUrl, setRepoUrl] = useState(icerik?.repro?.repoUrl ?? "");
  const [notebookUrl, setNotebookUrl] = useState(icerik?.repro?.notebookUrl ?? "");
  const [modelIdMetni, setModelIdMetni] = useState((icerik?.repro?.modelIds ?? []).join(", "));
  const [donanim, setDonanim] = useState(icerik?.repro?.hardware ?? "");
  const [kosumTarihi, setKosumTarihi] = useState(
    icerik?.repro?.runDate !== undefined ? tarihGirdisi(icerik.repro.runDate) : "",
  );
  const [maliyetMetni, setMaliyetMetni] = useState(
    icerik?.repro?.approxCostUsd !== undefined ? String(icerik.repro.approxCostUsd) : "",
  );

  // ── Panel durumu ───────────────────────────────────────────────────
  const [beklemede, gecisBaslat] = useTransition();
  const [kayitMesaji, setKayitMesaji] = useState("");
  const [hatalar, setHatalar] = useState<string[]>([]);
  const [kayitSayisi, setKayitSayisi] = useState(0);
  const [sekme, setSekme] = useState<"onizleme" | "seo" | "kontrol">("onizleme");
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
  // ISO-ayrıştırılabilir string. Formda alanı olmayan relatedManual/i18n ve
  // seo'nun diğer alanları mevcut belgeden DEĞİŞMEDEN geri taşınır ki kaydet
  // veri kaybetmesin (yeni içerikte []/{lang:"tr"}).

  /** repro: hiçbir alan doldurulmadıysa null (şema `nullable`). */
  function reproOlustur(): Record<string, unknown> | null {
    const alanlar: Record<string, unknown> = {};
    if (repoUrl.trim().length > 0) alanlar["repoUrl"] = repoUrl.trim();
    if (notebookUrl.trim().length > 0) alanlar["notebookUrl"] = notebookUrl.trim();
    const modelListesi = modelIdMetni
      .split(",")
      .map((model) => model.trim())
      .filter((model) => model.length > 0);
    if (modelListesi.length > 0) alanlar["modelIds"] = modelListesi;
    if (donanim.trim().length > 0) alanlar["hardware"] = donanim.trim();
    if (kosumTarihi.trim().length > 0) alanlar["runDate"] = kosumTarihi.trim();
    const maliyet = Number.parseFloat(maliyetMetni.replace(",", "."));
    if (maliyetMetni.trim().length > 0 && Number.isFinite(maliyet)) {
      alanlar["approxCostUsd"] = maliyet;
    }
    return Object.keys(alanlar).length > 0 ? alanlar : null;
  }

  function girdiOlustur(): Record<string, unknown> {
    const temizSlug = slug.trim();
    const seo: Record<string, unknown> = { ...(icerik?.seo ?? {}) };
    const temizBaslik = seoBaslik.trim();
    if (temizBaslik.length > 0) seo["title"] = temizBaslik;
    else delete seo["title"];
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
      repro: reproOlustur(),
      relatedManual: icerik?.relatedManual ?? [],
      seo,
      i18n: icerik?.i18n ?? { lang: "tr" },
    };
  }

  // ── Kaydedilmemiş değişiklik izi ───────────────────────────────────
  // beforeunload YOK (BRIEF §14 pop-up yasağının ruhu): yalnız görsel rozet.
  // Kirlilik, düzenlenebilir alanların imzası ile son kaydedilen imzanın
  // karşılaştırmasıdır — her setter'a bayrak asmaya gerek kalmaz.
  function formImzasi(ezme?: { slug?: string }): string {
    return JSON.stringify([
      baslik,
      ezme?.slug ?? slug.trim(),
      dek,
      kisaCevap,
      seviye,
      pillar,
      clusters,
      tagsMetni,
      yazarlar,
      teknikEditor,
      dogrulamaTarihi,
      govde,
      sss,
      kaynaklar,
      seoBaslik,
      seoAciklama,
      reproOlustur(),
    ]);
  }

  const [kayitliImza, setKayitliImza] = useState(() => formImzasi());
  const kirli = formImzasi() !== kayitliImza;

  // ── Aksiyonlar ─────────────────────────────────────────────────────

  function kaydet() {
    gecisBaslat(async () => {
      const sonuc = await icerikKaydet(girdiOlustur());
      if (sonuc.ok) {
        const ilkKayit = id === null;
        setId(sonuc.id);
        setSlug(sonuc.slug);
        // Sunucu slug'ı üretmiş olabilir; imzayı YENİ slug'la sabitle.
        setKayitliImza(formImzasi({ slug: sonuc.slug }));
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

  // ── SEO türetilmişleri ─────────────────────────────────────────────
  const serpBaslik = seoBaslik.trim().length > 0 ? seoBaslik.trim() : baslik;
  const serpAciklama = seoAciklama.trim().length > 0 ? seoAciklama.trim() : dek;
  const serpYol = icerikYolu(tur, slug.trim().length > 0 ? slug.trim() : "…");
  const baslikSayisi = serpBaslik.length;
  const aciklamaSayisi = serpAciklama.length;

  // ── Yayın kontrolü türetilmişleri (kalanlar önce) ──────────────────
  const kontroller = yayinSonucu !== null && !yayinSonucu.ok ? yayinSonucu.kontroller : [];
  const gecenSayisi = kontroller.filter((kontrol) => kontrol.gecti).length;
  const kalanSayisi = kontroller.length - gecenSayisi;
  const siraliKontroller = [...kontroller].sort(
    (a, b) => Number(a.gecti) - Number(b.gecti) || a.kural.localeCompare(b.kural, "tr"),
  );

  const sekmeSinifi = (aktif: boolean) =>
    `border-b-2 px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] transition-colors ${
      aktif ? "border-sinyal text-sinyal" : "border-transparent text-murekkep-2 hover:text-murekkep"
    }`;

  // ── Görünüm ────────────────────────────────────────────────────────

  return (
    <>
      <PanelBasligi
        indeks={icerik === null ? "yeni kayıt" : "içerik editörü"}
        baslik={icerik === null ? `Yeni ${turEtiketi(tur)}` : baslik.length > 0 ? baslik : "İçerik"}
        aciklama={
          icerik === null
            ? "Kaydedince taslak oluşur; önizleme ve yayın kontrolü ancak kayıttan sonra çalışır."
            : "Kaydet, MDX'i sunucuda derleyip içindekiler ağacını yeniden üretir. Yayın için §4.3 kontrolleri geçmelidir."
        }
        aksiyon={
          id !== null && (
            <a
              href={`/admin/onizleme/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dugme-cerceve bg-kagit"
            >
              Önizlemeyi ayrı sekmede aç <span aria-hidden>↗</span>
            </a>
          )
        }
      >
        <div className="veri-rayi mt-7 max-w-3xl bg-kagit">
          <div>
            tür
            <br />
            <span className="deger">{turEtiketi(tur)}</span>
          </div>
          <div>
            durum
            <br />
            <span className="deger">
              {durum !== null ? DURUM_ETIKETLERI[durum] : "kaydedilmedi"}
            </span>
          </div>
          <div>
            gövde
            <br />
            <span className="deger tabular-nums">{kelimeSay(govde)} kelime</span>
          </div>
          <div>
            kaynak
            <br />
            <span className={`deger tabular-nums ${kaynaklar.length === 0 ? "text-uyari" : ""}`}>
              {kaynaklar.length}
            </span>
          </div>
          <div>
            kayıt
            <br />
            <span className={`deger ${kirli ? "text-olcum" : "text-onay"}`}>
              {kirli ? "kirli" : "temiz"}
            </span>
          </div>
        </div>
      </PanelBasligi>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── SOL: form ── */}
          <form
            onSubmit={(olay) => {
              olay.preventDefault();
              kaydet();
            }}
            className="space-y-5"
          >
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
                spellCheck={false}
                className={`${GIRDI} font-mono`}
              />
              <p className="mt-1 font-mono text-[0.65rem] text-murekkep-2">
                Boş bırakılırsa başlıktan otomatik üretilir. Yayındaki slug değişirse yönlendirme
                kaydı ekleyin.
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
                className={`mt-1 font-mono text-[0.65rem] ${dekAralikta ? "text-onay" : "text-uyari"}`}
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
                className={`mt-1 font-mono text-[0.65rem] ${kisaCevapAralikta ? "text-onay" : "text-uyari"}`}
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
                <p className="mt-1 text-sm text-murekkep-2">
                  Bu pillar altında tanımlı cluster yok.
                </p>
              ) : (
                <div className="mt-2 grid max-h-48 gap-1 overflow-y-auto border border-doku rounded-md p-3 sm:grid-cols-2">
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
                <div className="mt-2 space-y-1 border border-doku rounded-md p-3">
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
                  <div key={sira} className="border border-doku rounded-md p-3">
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
                  className="dugme-cerceve"
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
                {kaynaklar.map((satir, sira) => {
                  const urlBos = satir.url.trim().length === 0;
                  const urlOk = urlGecerliMi(satir.url);
                  return (
                    <div key={sira} className="border border-doku rounded-md p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[0.65rem] text-sinyal">[{sira + 1}]</span>
                        <button
                          type="button"
                          onClick={() =>
                            setKaynaklar((mevcut) => mevcut.filter((_, i) => i !== sira))
                          }
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
                            spellCheck={false}
                            aria-describedby={`kaynak-url-durum-${sira}`}
                            className={`${GIRDI} font-mono`}
                          />
                          <p
                            id={`kaynak-url-durum-${sira}`}
                            aria-live="polite"
                            className={`mt-1 font-mono text-[0.65rem] ${
                              urlBos ? "text-murekkep-2" : urlOk ? "text-onay" : "text-uyari"
                            }`}
                          >
                            {urlBos
                              ? "http(s):// ile başlamalı"
                              : urlOk
                                ? "✓ geçerli adres"
                                : "✗ http(s):// ile başlamalı, boşluk içeremez"}
                          </p>
                        </div>
                        <div>
                          <label htmlFor={`kaynak-yayinci-${sira}`} className={ETIKET}>
                            Yayıncı
                          </label>
                          <input
                            id={`kaynak-yayinci-${sira}`}
                            type="text"
                            value={satir.publisher}
                            onChange={(olay) =>
                              kaynakGuncelle(sira, { publisher: olay.target.value })
                            }
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
                            onChange={(olay) =>
                              kaynakGuncelle(sira, { accessedAt: olay.target.value })
                            }
                            className={`${GIRDI} font-mono`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  className="dugme-cerceve"
                >
                  + Kaynak ekle
                </button>
              </div>
            </fieldset>

            {/* Yeniden üretilebilirlik (repro) — §4.3 kural 6 */}
            <fieldset>
              <legend className={ETIKET}>Yeniden üretilebilirlik (repro)</legend>
              <p className="mt-1 text-sm text-murekkep-2">
                {repoZorunluMu(tur) ? (
                  <span className="text-uyari">
                    {turEtiketi(tur)} türünde depo bağlantısı zorunludur — repoUrl boşsa yayın
                    kontrolü kalır (§4.3 kural 6).
                  </span>
                ) : (
                  <>
                    Bu tür için zorunlu değil; ölçüm ya da kod paylaşan içerikte doldurmak yeniden
                    üretilebilirliği belgeler.
                  </>
                )}
              </p>
              <div className="mt-2 grid gap-3 border border-doku rounded-md p-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="repro-repo" className={ETIKET}>
                    Depo (repoUrl)
                  </label>
                  <input
                    id="repro-repo"
                    type="url"
                    value={repoUrl}
                    onChange={(olay) => setRepoUrl(olay.target.value)}
                    placeholder="https://github.com/..."
                    spellCheck={false}
                    aria-describedby="repro-repo-durum"
                    className={`${GIRDI} font-mono`}
                  />
                  <p
                    id="repro-repo-durum"
                    aria-live="polite"
                    className={`mt-1 font-mono text-[0.65rem] ${
                      repoUrl.trim().length === 0
                        ? repoZorunluMu(tur)
                          ? "text-uyari"
                          : "text-murekkep-2"
                        : urlGecerliMi(repoUrl)
                          ? "text-onay"
                          : "text-uyari"
                    }`}
                  >
                    {repoUrl.trim().length === 0
                      ? repoZorunluMu(tur)
                        ? "✗ bu tür için zorunlu"
                        : "opsiyonel"
                      : urlGecerliMi(repoUrl)
                        ? "✓ geçerli adres"
                        : "✗ http(s):// ile başlamalı"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="repro-notebook" className={ETIKET}>
                    Notebook (notebookUrl)
                  </label>
                  <input
                    id="repro-notebook"
                    type="url"
                    value={notebookUrl}
                    onChange={(olay) => setNotebookUrl(olay.target.value)}
                    spellCheck={false}
                    className={`${GIRDI} font-mono`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="repro-modeller" className={ETIKET}>
                    Model kimlikleri (virgülle ayırın)
                  </label>
                  <input
                    id="repro-modeller"
                    type="text"
                    value={modelIdMetni}
                    onChange={(olay) => setModelIdMetni(olay.target.value)}
                    placeholder="llama-3.1-8b-instruct, bge-m3"
                    spellCheck={false}
                    className={`${GIRDI} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="repro-donanim" className={ETIKET}>
                    Donanım
                  </label>
                  <input
                    id="repro-donanim"
                    type="text"
                    value={donanim}
                    onChange={(olay) => setDonanim(olay.target.value)}
                    placeholder="RTX 4090 24GB / 64GB RAM"
                    className={GIRDI}
                  />
                </div>
                <div>
                  <label htmlFor="repro-kosum" className={ETIKET}>
                    Koşum tarihi
                  </label>
                  <input
                    id="repro-kosum"
                    type="date"
                    value={kosumTarihi}
                    onChange={(olay) => setKosumTarihi(olay.target.value)}
                    className={`${GIRDI} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="repro-maliyet" className={ETIKET}>
                    Yaklaşık maliyet (USD)
                  </label>
                  <input
                    id="repro-maliyet"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={maliyetMetni}
                    onChange={(olay) => setMaliyetMetni(olay.target.value)}
                    className={`${GIRDI} font-mono sm:max-w-40`}
                  />
                </div>
              </div>
            </fieldset>
          </form>

          {/* ── SAĞ: Önizleme / SEO / Yayın Kontrolü ── */}
          <section
            aria-label="Önizleme, SEO ve yayın kontrolü"
            className="lg:sticky lg:top-6 lg:self-start"
          >
            <div className="flex flex-wrap gap-2 border-b border-doku">
              <button
                type="button"
                onClick={() => setSekme("onizleme")}
                aria-pressed={sekme === "onizleme"}
                className={sekmeSinifi(sekme === "onizleme")}
              >
                Önizleme
              </button>
              <button
                type="button"
                onClick={() => setSekme("seo")}
                aria-pressed={sekme === "seo"}
                className={sekmeSinifi(sekme === "seo")}
              >
                SEO
              </button>
              <button
                type="button"
                onClick={() => setSekme("kontrol")}
                aria-pressed={sekme === "kontrol"}
                className={sekmeSinifi(sekme === "kontrol")}
              >
                Yayın Kontrolü
              </button>
            </div>

            {sekme === "onizleme" &&
              (id === null ? (
                <p className={`mt-4 text-sm text-murekkep-2 ${KUTU}`}>
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
                    className="mt-4 h-[70vh] w-full border border-doku rounded-md bg-kagit"
                  />
                  <p className="mt-2 font-mono text-[0.65rem] text-murekkep-2">
                    Önizleme kaydedilmiş sürümü gösterir; formdaki değişiklikler için önce Kaydet.
                  </p>
                </>
              ))}

            {sekme === "seo" && (
              <div className="mt-4 space-y-5">
                <div>
                  <label htmlFor="alan-seo-baslik" className={ETIKET}>
                    SEO başlığı (seo.title)
                  </label>
                  <input
                    id="alan-seo-baslik"
                    type="text"
                    value={seoBaslik}
                    onChange={(olay) => setSeoBaslik(olay.target.value)}
                    placeholder={baslik}
                    className={GIRDI}
                  />
                  <p
                    aria-live="polite"
                    className={`mt-1 font-mono text-[0.65rem] ${
                      baslikSayisi > SEO_BASLIK_SINIRI ? "text-uyari" : "text-onay"
                    }`}
                  >
                    {baslikSayisi}/{SEO_BASLIK_SINIRI} karakter
                    {baslikSayisi > SEO_BASLIK_SINIRI
                      ? ` — ${baslikSayisi - SEO_BASLIK_SINIRI} fazla, SERP'te kesilir`
                      : seoBaslik.trim().length === 0
                        ? " — boşsa içerik başlığı kullanılır"
                        : ""}
                  </p>
                </div>

                <div>
                  <label htmlFor="alan-seo-aciklama" className={ETIKET}>
                    SEO açıklaması (seo.description)
                  </label>
                  <textarea
                    id="alan-seo-aciklama"
                    value={seoAciklama}
                    onChange={(olay) => setSeoAciklama(olay.target.value)}
                    placeholder={dek}
                    rows={3}
                    className={GIRDI}
                  />
                  <p
                    aria-live="polite"
                    className={`mt-1 font-mono text-[0.65rem] ${
                      aciklamaSayisi > SEO_ACIKLAMA_SINIRI ? "text-uyari" : "text-onay"
                    }`}
                  >
                    {aciklamaSayisi}/{SEO_ACIKLAMA_SINIRI} karakter
                    {aciklamaSayisi > SEO_ACIKLAMA_SINIRI
                      ? ` — ${aciklamaSayisi - SEO_ACIKLAMA_SINIRI} fazla, SERP'te kesilir`
                      : seoAciklama.trim().length === 0
                        ? " — boşsa dek kullanılır"
                        : ""}
                  </p>
                </div>

                {/* SERP önizlemesi — gerçek arama sonucu görünümü */}
                <div>
                  <p className={ETIKET}>Arama sonucu önizlemesi</p>
                  <div className={`mt-2 ${KUTU}`}>
                    <p className="font-mono text-[0.7rem] text-murekkep-2">
                      {siteHost}
                      {serpYol
                        .split("/")
                        .filter((parca) => parca.length > 0)
                        .map((parca, sira) => (
                          <span key={`${sira}-${parca}`}>
                            <span aria-hidden className="mx-1">
                              ›
                            </span>
                            {parca}
                          </span>
                        ))}
                    </p>
                    <p className="mt-1 text-lg leading-snug text-sinyal">
                      {serpBaslik.length > 0 ? serpBaslik : "Başlık girilmedi"}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-murekkep-2">
                      {serpAciklama.length > 0
                        ? serpAciklama
                        : "Açıklama girilmedi — dek veya seo.description doldurun."}
                    </p>
                  </div>
                  <p className="mt-2 font-mono text-[0.65rem] text-murekkep-2">
                    Google metni piksel genişliğine göre kırpar; karakter sayısı yaklaşık bir
                    göstergedir.
                  </p>
                </div>
              </div>
            )}

            {sekme === "kontrol" && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={yayinla}
                  disabled={beklemede || id === null}
                  className="dugme-birincil disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Yayınla
                </button>
                {id === null && (
                  <p className="mt-3 text-sm text-murekkep-2">
                    Yayın kontrolü için önce içeriği kaydedin.
                  </p>
                )}
                {id !== null && yayinSonucu === null && (
                  <p className="mt-3 text-sm text-murekkep-2">
                    Yayınla, kaydedilmiş sürümü BRIEF §4.3&apos;teki 10 kontrolden geçirir; hepsi
                    geçmeden içerik yayına çıkmaz.
                  </p>
                )}

                {yayinSonucu !== null &&
                  (yayinSonucu.ok ? (
                    <div className="mt-4 border border-onay rounded-lg p-4">
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
                        <ul className="space-y-1 border border-uyari rounded-md p-3 text-sm text-uyari">
                          {yayinSonucu.hatalar.map((hata) => (
                            <li key={hata}>{hata}</li>
                          ))}
                        </ul>
                      )}

                      {kontroller.length > 0 && (
                        <>
                          {/* Özet önce: kaç kontrol kaldı, kaçı geçti */}
                          <div className="veri-rayi" aria-live="polite">
                            <div>
                              kalan
                              <br />
                              <span
                                className={`deger tabular-nums ${kalanSayisi > 0 ? "text-uyari" : "text-onay"}`}
                              >
                                {kalanSayisi}
                              </span>
                            </div>
                            <div>
                              geçen
                              <br />
                              <span className="deger tabular-nums text-onay">{gecenSayisi}</span>
                            </div>
                            <div>
                              toplam
                              <br />
                              <span className="deger tabular-nums">{kontroller.length}</span>
                            </div>
                          </div>

                          <ul className="space-y-2">
                            {siraliKontroller.map((kontrol) => (
                              <li
                                key={kontrol.kural}
                                className={`border p-3 text-sm ${
                                  kontrol.gecti ? "border-doku" : "border-uyari"
                                }`}
                              >
                                <p className={kontrol.gecti ? "text-onay" : "text-uyari"}>
                                  <span aria-hidden className="mr-2 font-mono">
                                    {kontrol.gecti ? "✓" : "✗"}
                                  </span>
                                  <span className="sr-only">
                                    {kontrol.gecti ? "geçti:" : "kaldı:"}
                                  </span>
                                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">
                                    {kontrol.kural}
                                  </span>
                                </p>
                                <p className="mt-1 text-murekkep-2">{kontrol.mesaj}</p>
                                {kontrol.oneriler !== undefined && kontrol.oneriler.length > 0 && (
                                  <p className="mt-1 font-mono text-[0.65rem] text-murekkep-2">
                                    Öneri: {kontrol.oneriler.join(", ")}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Alt bar: enstrüman kumanda şeridi ── */}
      <div className="sticky bottom-0 border-t border-doku bg-kagit">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-2 px-[var(--gutter)] py-3">
          <button
            type="button"
            onClick={kaydet}
            disabled={beklemede}
            className="dugme-birincil disabled:cursor-not-allowed disabled:opacity-50"
          >
            {beklemede ? "Çalışıyor…" : "Kaydet"}
          </button>
          {durum !== null ? (
            <DurumRozeti durum={durum} />
          ) : (
            <span className={ETIKET}>henüz kaydedilmedi</span>
          )}
          {gecis !== null && id !== null && (
            <button
              type="button"
              onClick={() => durumGecisi(gecis.hedef)}
              disabled={beklemede}
              className="dugme-cerceve disabled:cursor-not-allowed disabled:opacity-50"
            >
              {gecis.etiket}
            </button>
          )}
          {kirli && (
            <span className="inline-flex items-center gap-1.5 border border-olcum rounded-md px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-olcum">
              <span aria-hidden className="inline-block size-1.5 shrink-0 bg-olcum" />
              Kaydedilmemiş değişiklikler var
            </span>
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
    </>
  );
}
