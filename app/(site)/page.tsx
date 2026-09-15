import type { Metadata } from 'next';
import { Hero } from '@/components/ana-sayfa/Hero';
import { Gundem } from '@/components/ana-sayfa/Gundem';
import { Brief } from '@/components/ana-sayfa/Brief';
import { DerinAnalizler } from '@/components/ana-sayfa/DerinAnalizler';
import { AtlasBolumu } from '@/components/ana-sayfa/Atlas';
import { ModelIzleme } from '@/components/ana-sayfa/ModelIzleme';
import { OgrenmeYollari } from '@/components/ana-sayfa/OgrenmeYollari';
import { SeviyeOlcumu } from '@/components/ana-sayfa/SeviyeOlcumu';
import { Arastirma } from '@/components/ana-sayfa/Arastirma';
import { Dergi } from '@/components/ana-sayfa/Dergi';
import { Lab } from '@/components/ana-sayfa/Lab';
import { Kurumsal } from '@/components/ana-sayfa/Kurumsal';
import { Bulten } from '@/components/ana-sayfa/Bulten';
import { Uzmanlar } from '@/components/ana-sayfa/Uzmanlar';
import { OrganizasyonSemasi, SiteSemasi } from '@/lib/seo/jsonld';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Yapay Zekânın Nabzını Tut',
  description: SITE.aciklama,
  alternates: { canonical: '/' },
};

/**
 * Ana sayfa akışı MASTER-PLAN §114'e göre sıralanmıştır:
 * Hero + Radar → Gündem → Brief → Analiz → Atlas → Modeller → Öğrenme →
 * Seviye → Araştırma → Dergi → Lab → Kurumsal → Bülten → Uzmanlar
 */
export default function AnaSayfa() {
  return (
    <>
      <OrganizasyonSemasi />
      <SiteSemasi />

      <Hero />
      <Gundem />
      <Brief />
      <DerinAnalizler />
      <AtlasBolumu />
      <ModelIzleme />
      <OgrenmeYollari />
      <SeviyeOlcumu />
      <Arastirma />
      <Dergi />
      <Lab />
      <Kurumsal />
      <Bulten />
      <Uzmanlar />
    </>
  );
}
