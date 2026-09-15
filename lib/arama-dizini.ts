import 'server-only';
import { cache } from 'react';
import { ANA_MENU } from '@/lib/rotalar';
import type { AramaKaydi } from '@/lib/arama';
import { atlasListesi, sozluk } from '@/lib/icerik/atlas';
import { konuListesi } from '@/lib/icerik/temel';
import { analizler, tumGundem } from '@/lib/icerik/gundem';
import { dergiSayiListesi, podcastListesi, rehberListesi } from '@/lib/icerik/yayin';
import { dersler, ogrenmeYollari, testler } from '@/lib/icerik/ogrenme';
import { arastirmaListesi } from '@/lib/icerik/arastirma';
import { aracListesi, modelListesi, sirketListesi } from '@/lib/icerik/varliklar';
import { hizmetler, sektorler, vakalar } from '@/lib/icerik/kurumsal';
import { labProjeleri, meslekler } from '@/lib/icerik/lab';

/**
 * Arama dizini — VERİTABANINDAN.
 *
 * NEDEN YENİ BİR MODÜL: `lib/arama.ts` içindeki `aramaDizini()` dizini
 * `lib/veri/*` FIXTURE'larından kuruyordu. Site Atlas'a taşındıktan sonra
 * fixture'lar donmuş kaldı: dizin 234 kayıt görüyordu, yayında ise ~900 kayıt
 * vardı. Yani 100 testin, 50 vakanın, 50 lab projesinin, 20 rotanın, 55 konunun
 * ve 340 modelin büyük kısmı ne ⌘K paletinde ne `/ara/` sayfasında bulunuyordu
 * — arama, sitenin üçte birini göremiyordu.
 *
 * Eski fonksiyon SENKRONDU ve bir istemci bileşeninden çağrılıyordu; bu yüzden
 * veritabanına geçiş bir imza değişikliği gerektirdi. Puanlama, sadeleştirme ve
 * öneriler (`puanla`, `sadelestir`, `ARAMA_ONERILERI`) `lib/arama.ts` içinde
 * KALDI: onlar saf fonksiyonlar ve istemcide çalışmaları gerekiyor. Bu modül
 * yalnızca dizini üretir ve `server-only`dir.
 *
 * YÜK NOTU: dizin ~900 kayıttır. Her sayfanın RSC yüküne gömülmesi yanlış
 * olurdu; bu yüzden `/arama-dizini` JSON rotasından servis edilir ve komut
 * paleti onu İLK AÇILIŞTA çeker. `/ara/` sayfası aramanın kendisi olduğu için
 * dizini doğrudan prop olarak alır.
 */

/** "retrieval-augmented-generation" → ["retrieval","augmented","generation"] */
function slugParcalari(slug: string) {
  return [slug, ...slug.split('-')].filter((parca) => parca.length > 1);
}

/** Boş ve yinelenen anahtarları eler; puanlama boş dizgede zaman harcamasın. */
function anahtarla(...degerler: (string | undefined)[]): string[] {
  return [...new Set(degerler.filter((d): d is string => Boolean(d && d.trim())))];
}

export const siteAramaDizini = cache(async (): Promise<AramaKaydi[]> => {
  const [
    ATLAS,
    KONULAR,
    REHBERLER,
    GUNDEM,
    ANALIZLER,
    MODELLER,
    SIRKETLER,
    ARACLAR,
    ROTALAR,
    DERSLER,
    TESTLER,
    ARASTIRMA,
    DERGI,
    PODCAST,
    HIZMETLER,
    SEKTORLER,
    VAKALAR,
    LAB,
    MESLEKLER,
    TERIMLER,
  ] = await Promise.all([
    atlasListesi(),
    konuListesi(),
    rehberListesi(),
    tumGundem(),
    analizler(),
    modelListesi(),
    sirketListesi(),
    aracListesi(),
    ogrenmeYollari(),
    dersler(),
    testler(),
    arastirmaListesi(),
    dergiSayiListesi(),
    podcastListesi(),
    hizmetler(),
    sektorler(),
    vakalar(),
    labProjeleri(),
    meslekler(),
    sozluk(),
  ]);

  const dizin: AramaKaydi[] = [];

  for (const g of ATLAS)
    dizin.push({
      grup: 'Kavram',
      ad: g.ad,
      aciklama: g.kategori,
      yol: `/atlas/${g.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(g.slug), ...(g.ilgili ?? []), g.altAd),
    });

  /*
   * SÖZLÜK TERİMLERİ — 324 kayıt, dizinin en büyük tek grubu.
   *
   * Terimin kendi sayfası yok; Atlas girdisi olan `/atlas/<slug>/` adresine,
   * olmayan ise sözlükteki çapasına (`/sozluk/#terim-<slug>`) gider. Çapaya
   * gitmek bir sayfa açmaktan daha az tatmin edici ama dürüst: okur terimin
   * tanımını görür ve o tanımın nihai biçim olduğunu anlar.
   *
   * ANAHTARLARA İNGİLİZCE KARŞILIK VE KISALTMA da girer: bu alanın literatürü
   * İngilizce üretildiği için okur çoğu zaman "embedding" ya da "RAG" diye
   * arar, "gömme" diye değil.
   */
  for (const t of TERIMLER)
    dizin.push({
      grup: 'Terim',
      ad: t.terim,
      aciklama: t.tanim,
      yol: t.atlasSlug ? `/atlas/${t.atlasSlug}/` : `/sozluk/#terim-${t.slug}`,
      anahtarlar: anahtarla(...slugParcalari(t.slug), t.ingilizce, t.kisaltma, t.kategori),
    });

  for (const k of KONULAR)
    dizin.push({
      grup: 'Konu',
      ad: k.ad,
      aciklama: k.kume,
      yol: `/konu/${k.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(k.slug)),
    });

  for (const r of REHBERLER)
    dizin.push({
      grup: 'Rehber',
      ad: r.baslik,
      aciklama: r.konu,
      yol: `/rehber/${r.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(r.slug)),
    });

  for (const i of GUNDEM)
    dizin.push({
      grup: 'Gündem',
      ad: i.baslik,
      aciklama: i.konu?.ad,
      yol: i.yol,
      anahtarlar: anahtarla(...slugParcalari(i.slug)),
    });

  for (const a of ANALIZLER)
    dizin.push({
      grup: 'Analiz',
      ad: a.baslik,
      aciklama: a.konu,
      yol: `/analiz/${a.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(a.slug)),
    });

  for (const m of MODELLER)
    dizin.push({
      grup: 'Model',
      ad: m.ad,
      aciklama: m.saglayici,
      yol: `/modeller/${m.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(m.slug), m.saglayici, m.surum),
    });

  for (const s of SIRKETLER)
    dizin.push({
      grup: 'Şirket',
      ad: s.ad,
      aciklama: `${s.tur} · ${s.merkez}`,
      yol: `/sirketler/${s.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(s.slug)),
    });

  for (const a of ARACLAR)
    dizin.push({
      grup: 'Araç',
      ad: a.ad,
      aciklama: a.kategori,
      yol: `/araclar/${a.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(a.slug), a.kategori),
    });

  for (const y of ROTALAR)
    dizin.push({
      grup: 'Öğren',
      ad: y.ad,
      aciklama: y.rol,
      yol: `/ogren/yollar/${y.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(y.slug), y.rol),
    });

  for (const d of DERSLER)
    dizin.push({
      grup: 'Ders',
      ad: d.ad,
      aciklama: d.ozet,
      yol: `/ogren/dersler/${d.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(d.slug)),
    });

  for (const t of TESTLER)
    dizin.push({
      grup: 'Test',
      ad: t.ad,
      aciklama: t.konu,
      yol: `/testler/${t.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(t.slug), t.konu),
    });

  for (const y of ARASTIRMA)
    dizin.push({
      grup: 'Araştırma',
      ad: y.baslik,
      aciklama: y.tur,
      yol: `/arastirma/${y.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(y.slug)),
    });

  for (const s of DERGI)
    dizin.push({
      grup: 'Dergi',
      ad: `${s.sayi} — ${s.kapakKonusu}`,
      aciklama: s.ozet,
      yol: `/dergi/${s.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(s.slug)),
    });

  for (const b of PODCAST)
    dizin.push({
      grup: 'Podcast',
      ad: b.ad,
      aciklama: b.konuk,
      yol: `/podcast/${b.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(b.slug), b.konuk),
    });

  for (const h of HIZMETLER)
    dizin.push({
      grup: 'Kurumsal',
      ad: h.ad,
      aciklama: h.ozet,
      yol: `/kurumsal/${h.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(h.slug)),
    });

  for (const s of SEKTORLER)
    dizin.push({
      grup: 'Sektör',
      ad: s.ad,
      aciklama: s.ozet,
      yol: `/sektor/${s.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(s.slug)),
    });

  for (const v of VAKALAR)
    dizin.push({
      grup: 'Vaka',
      ad: v.baslik,
      aciklama: v.sektor,
      yol: `/vaka-calismalari/${v.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(v.slug), v.sektor),
    });

  for (const p of LAB)
    dizin.push({
      grup: 'Lab',
      ad: p.ad,
      aciklama: p.tur,
      yol: `/lab/${p.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(p.slug), p.tur),
    });

  /*
   * Mesleklerde ANAHTARLARA `esAdlar` da girer: aynı iş piyasada hem "Makine
   * Öğrenmesi Mühendisi" hem "ML Engineer" diye aranıyor. Slug parçaları
   * ingilizce unvanı her zaman kapsamıyor (`ai-uyum-sorumlusu` için
   * "compliance officer" hiçbir yerde geçmezdi), bu yüzden alan ayrıca eklenir.
   */
  for (const m of MESLEKLER)
    dizin.push({
      grup: 'Kariyer',
      ad: m.ad,
      aciklama: m.ozet,
      yol: `/kariyer/${m.slug}/`,
      anahtarlar: anahtarla(...slugParcalari(m.slug), ...(m.esAdlar ?? []), m.rolAilesi),
    });

  // Gezinme başlıkları: içerik değil ama aranan şeyler ("iletişim", "künye").
  for (const bolum of ANA_MENU)
    for (const sutun of bolum.sutunlar)
      for (const oge of sutun.ogeler)
        dizin.push({
          grup: 'Sayfa',
          ad: oge.ad,
          aciklama: `${bolum.ad} · ${sutun.baslik}`,
          yol: oge.yol,
          anahtarlar: anahtarla(...slugParcalari(oge.yol.replaceAll('/', ''))),
        });

  return dizin;
});
