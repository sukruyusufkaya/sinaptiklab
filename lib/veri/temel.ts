/**
 * ÖRNEK VERİ — YER TUTUCU.
 *
 * `lib/veri/*` altındaki tüm kayıtlar arayüz geliştirme içindir; gerçek editoryal
 * içerik veya doğrulanmış ölçüm değildir. Buradaki hiçbir sayı kaynak gösterilemez.
 * MongoDB katmanı bağlandığında `lib/db/sorgular/*` bu modüllerin yerini alacak.
 * (MASTER-PLAN §59 — sayısal iddialar kaynaklandırılır.)
 */

import type { Konu, Yazar } from '@/lib/tipler';

export const VERI_YER_TUTUCU = true;

/* --- KONULAR -------------------------------------------------------------- */

export const KONULAR: Record<string, Konu> = {
  agent: { slug: 'ai-agent', ad: 'AI Agents', kume: 'Agentic AI' },
  llm: { slug: 'llm', ad: 'Büyük Dil Modelleri', kume: 'Generative AI' },
  rag: { slug: 'rag', ad: 'RAG', kume: 'Generative AI' },
  robotik: { slug: 'robotik', ad: 'Robotik & Embodied AI', kume: 'Robotics' },
  guvenlik: { slug: 'ai-guvenlik', ad: 'AI Güvenliği', kume: 'Responsible AI' },
  regulasyon: { slug: 'regulasyon', ad: 'Regülasyon', kume: 'Responsible AI' },
  altyapi: { slug: 'ai-altyapi', ad: 'AI Altyapısı', kume: 'Infrastructure' },
  mlops: { slug: 'mlops', ad: 'MLOps / LLMOps', kume: 'Operations' },
  gorus: { slug: 'computer-vision', ad: 'Computer Vision', kume: 'Perception' },
  isDunyasi: { slug: 'is-dunyasi', ad: 'AI Business', kume: 'Enterprise' },
  degerlendirme: { slug: 'degerlendirme', ad: 'Değerlendirme', kume: 'Operations' },
};

export const KONU_LISTESI = Object.values(KONULAR);

/* --- YAZARLAR ------------------------------------------------------------- */

export const YAZARLAR: Record<string, Yazar> = {
  sukru: {
    slug: 'sukru-yusuf-kaya',
    ad: 'Şükrü Yusuf Kaya',
    unvan: 'Kurucu & Genel Yayın Yönetmeni',
    basHarfler: 'ŞK',
    ozgecmis:
      'Sinaptik Lab’in kurucusu. Yapay zekâ platform mimarisi, kurumsal dönüşüm ve bilgi grafiği tasarımı üzerine çalışıyor.',
    uzmanlik: ['AI stratejisi', 'Platform mimarisi', 'Bilgi grafiği', 'Agentic sistemler'],
    sosyal: [
      { etiket: 'LinkedIn', adres: 'https://www.linkedin.com/company/sinaptiklab' },
      { etiket: 'X', adres: 'https://x.com/sinaptiklab' },
    ],
  },
  redaksiyon: {
    slug: 'sinaptik-redaksiyon',
    ad: 'Sinaptik Redaksiyon',
    unvan: 'Haber Masası',
    basHarfler: 'SR',
    ozgecmis: 'Gündem akışını birincil kaynaklardan doğrulayarak yayına hazırlayan editoryal ekip.',
    uzmanlik: ['Haber doğrulama', 'Birincil kaynak takibi'],
  },
  arastirma: {
    slug: 'sinaptik-research',
    ad: 'Sinaptik Research',
    unvan: 'Araştırma Birimi',
    basHarfler: 'SA',
    ozgecmis:
      'Benchmark, veri seti ve saha araştırmalarını açık metodolojiyle yürüten araştırma birimi.',
    uzmanlik: ['Benchmark tasarımı', 'Veri seti üretimi', 'Saha araştırması'],
  },
};

export const YAZAR_LISTESI = Object.values(YAZARLAR);

export function yazarBul(slug?: string): Yazar {
  return YAZAR_LISTESI.find((yazar) => yazar.slug === slug) ?? YAZARLAR.redaksiyon!;
}

/* --- ORTAK ETİKETLER ------------------------------------------------------ */

/**
 * Etiket sözlükleri ve tarih biçimleyicileri artık taksonomi/biçim
 * modüllerinde duruyor; buradan yeniden yayımlanır ki mevcut içe alımlar
 * kırılmasın. Fixture silindiğinde sayfalar doğrudan o modülleri kullanır.
 */
export { SEVIYE_ADI, TUR_ADI } from '@/lib/taksonomi';
export { tarihUzun, tarihKisa } from '@/lib/bicim';
