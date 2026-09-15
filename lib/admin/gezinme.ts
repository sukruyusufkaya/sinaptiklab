import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import type { Izin } from '@/lib/yetki/roller';

/**
 * Panel gezinmesinin tek kaynağı.
 *
 * Her öge bir izne bağlıdır; izni olmayan kullanıcıya öge GÖSTERİLMEZ. Ancak
 * bu bir güvenlik kontrolü DEĞİLDİR — ekranı gizlemek yazma yolunu korumaz.
 * Asıl kontrol `korumaliEylem` ve sayfa düzeyindeki `yetkiGerekli` ile yapılır.
 */

export type GezinmeOgesi = {
  ad: string;
  yol: string;
  izin: Izin;
  /** Genel CRUD motoruna bağlı ögelerde koleksiyon adı. */
  koleksiyon?: string;
  ipucu?: string;
};

export type GezinmeBolumu = {
  baslik: string;
  ogeler: GezinmeOgesi[];
};

export const PANEL_GEZINMESI: GezinmeBolumu[] = [
  {
    baslik: 'Genel',
    ogeler: [
      { ad: 'Panel', yol: '/admin/', izin: 'icerik:oku', ipucu: 'Özet ve bekleyen işler' },
      {
        // Kanonik yol genel koleksiyon ekranıdır. `/admin/icerik/` oraya
        // yönlendiren bir kısayol olarak durur (eski bağlantılar için), ama
        // gezinme kanonik yolu gösterir: aksi hâlde her tıklama fazladan bir
        // 307 turu atar ve etkin öge vurgusu (`yol.startsWith`) hiç eşleşmez.
        ad: 'İçerikler',
        yol: '/admin/koleksiyon/icerikler/',
        izin: 'icerik:oku',
        koleksiyon: KOLEKSIYONLAR.icerikler,
        ipucu: 'Haber, analiz, rehber, görüş, röportaj',
      },
      {
        ad: 'Tazelik denetimi',
        yol: '/admin/tazelik/',
        izin: 'icerik:oku',
        ipucu: 'Son doğrulama tarihi geçmiş kayıtlar',
      },
    ],
  },
  {
    baslik: 'Varlıklar',
    ogeler: [
      {
        ad: 'Atlas',
        yol: '/admin/koleksiyon/atlas/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.atlas,
      },
      {
        ad: 'Modeller',
        yol: '/admin/koleksiyon/modeller/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.modeller,
      },
      {
        ad: 'Şirketler',
        yol: '/admin/koleksiyon/sirketler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.sirketler,
      },
      {
        ad: 'Araçlar',
        yol: '/admin/koleksiyon/araclar/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.araclar,
      },
      {
        ad: 'Meslekler',
        yol: '/admin/koleksiyon/meslekler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.meslekler,
      },
    ],
  },
  {
    baslik: 'Öğrenme',
    ogeler: [
      {
        ad: 'Rotalar',
        yol: '/admin/koleksiyon/ogrenme_yollari/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.ogrenmeYollari,
      },
      {
        ad: 'Dersler',
        yol: '/admin/koleksiyon/dersler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.dersler,
      },
      {
        ad: 'Testler',
        yol: '/admin/koleksiyon/testler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.testler,
      },
      {
        ad: 'Soru bankası',
        yol: '/admin/koleksiyon/sorular/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.sorular,
      },
    ],
  },
  {
    baslik: 'Yayın',
    ogeler: [
      {
        ad: 'Araştırma',
        yol: '/admin/koleksiyon/arastirma/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.arastirma,
      },
      {
        ad: 'Dergi',
        yol: '/admin/koleksiyon/dergi_sayilari/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.dergiSayilari,
      },
      {
        ad: 'Podcast',
        yol: '/admin/koleksiyon/podcast/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.podcast,
      },
      {
        ad: 'Brief',
        yol: '/admin/koleksiyon/briefler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.briefler,
      },
      {
        ad: 'Radar',
        yol: '/admin/koleksiyon/radar/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.radar,
      },
    ],
  },
  {
    baslik: 'Kurumsal',
    ogeler: [
      {
        ad: 'Hizmetler',
        yol: '/admin/koleksiyon/hizmetler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.hizmetler,
      },
      {
        ad: 'Sektörler',
        yol: '/admin/koleksiyon/sektorler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.sektorler,
      },
      {
        ad: 'Vakalar',
        yol: '/admin/koleksiyon/vakalar/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.vakalar,
      },
      {
        ad: 'Lab projeleri',
        yol: '/admin/koleksiyon/lab_projeleri/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.labProjeleri,
      },
    ],
  },
  {
    baslik: 'Topluluk',
    ogeler: [
      {
        ad: 'Etkinlikler',
        yol: '/admin/koleksiyon/etkinlikler/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.etkinlikler,
      },
      {
        ad: 'Uzmanlar',
        yol: '/admin/koleksiyon/uzmanlar/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.uzmanlar,
      },
    ],
  },
  {
    baslik: 'Taksonomi ve künye',
    ogeler: [
      {
        ad: 'Konular',
        yol: '/admin/koleksiyon/konular/',
        izin: 'taksonomi:yaz',
        koleksiyon: KOLEKSIYONLAR.konular,
      },
      {
        ad: 'Yazarlar',
        yol: '/admin/koleksiyon/yazarlar/',
        izin: 'taksonomi:yaz',
        koleksiyon: KOLEKSIYONLAR.yazarlar,
      },
      {
        ad: 'Sayfalar',
        yol: '/admin/koleksiyon/sayfalar/',
        izin: 'varlik:yaz',
        koleksiyon: KOLEKSIYONLAR.sayfalar,
      },
      {
        ad: 'Politikalar',
        yol: '/admin/koleksiyon/politikalar/',
        izin: 'politika:yaz',
        koleksiyon: KOLEKSIYONLAR.politikalar,
      },
    ],
  },
  {
    baslik: 'Operasyon',
    ogeler: [
      {
        ad: 'Medya',
        yol: '/admin/koleksiyon/medya/',
        izin: 'medya:yaz',
        koleksiyon: KOLEKSIYONLAR.medya,
      },
      {
        ad: 'Yönlendirmeler',
        yol: '/admin/koleksiyon/yonlendirmeler/',
        izin: 'yonlendirme:yaz',
        koleksiyon: KOLEKSIYONLAR.yonlendirmeler,
      },
      {
        ad: 'Arama açığı',
        yol: '/admin/arama/',
        izin: 'arama:oku',
        koleksiyon: KOLEKSIYONLAR.aramaKayitlari,
        ipucu: 'Sonuç üretmeyen sorgular',
      },
    ],
  },
  {
    baslik: 'Yönetim',
    ogeler: [
      { ad: 'Kullanıcılar', yol: '/admin/kullanicilar/', izin: 'kullanici:oku' },
      // Siteden toplanan veri. İzin `kisiselveri:oku` olduğu için yalnızca sahip
      // ve yönetici görür; editör ve yazar bu ögeleri hiç görmez.
      {
        ad: 'Gelen kutusu',
        yol: '/admin/gelen/',
        izin: 'kisiselveri:oku',
        koleksiyon: KOLEKSIYONLAR.formKayitlari,
        ipucu: 'Form kayıtları ve bülten aboneleri',
      },
      {
        ad: 'Sonuçlar',
        yol: '/admin/sonuclar/',
        izin: 'kisiselveri:oku',
        koleksiyon: KOLEKSIYONLAR.testSonuclari,
        ipucu: 'Test çözümleri ve AI Readiness',
      },
      {
        ad: 'Kişisel veri',
        yol: '/admin/kisisel-veri/',
        izin: 'kisiselveri:oku',
        ipucu: 'KVKK talepleri ve saklama',
      },
      { ad: 'Denetim kaydı', yol: '/admin/denetim/', izin: 'denetim:oku' },
      { ad: 'Ayarlar', yol: '/admin/ayarlar/', izin: 'ayar:yaz' },
    ],
  },
];

/** Kullanıcının izinlerine göre süzülmüş gezinme. */
export function gezinmeyiSuz(izinler: readonly string[]): GezinmeBolumu[] {
  const kume = new Set(izinler);
  return PANEL_GEZINMESI.map((bolum) => ({
    ...bolum,
    ogeler: bolum.ogeler.filter((oge) => kume.has(oge.izin)),
  })).filter((bolum) => bolum.ogeler.length > 0);
}
