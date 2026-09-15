import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { SITE } from '@/lib/site';
import { atlasListesi } from '@/lib/icerik/atlas';
import { arastirmaListesi } from '@/lib/icerik/arastirma';

export const metadata: Metadata = {
  title: 'Sinaptik Lab — English',
  description:
    'Sinaptik Lab is a Turkish AI knowledge, intelligence and learning platform. The English edition is in preparation.',
  alternates: { canonical: '/en/', languages: { 'tr-TR': '/', 'en-US': '/en/' } },
};

const KATMANLAR_EN = [
  { ad: 'Discover', soru: 'What is happening in AI?', urun: 'News · Radar · Brief · Magazine' },
  { ad: 'Understand', soru: 'What does this mean?', urun: 'Atlas · Guides · Models · Tools' },
  { ad: 'Learn', soru: 'How do I learn it?', urun: 'Paths · Lessons · Tests' },
  { ad: 'Build', soru: 'How do I apply it?', urun: 'Lab · Consulting · Training' },
];

export default async function EnglishSayfasi() {
  const [ATLAS, ARASTIRMA] = await Promise.all([atlasListesi(), arastirmaListesi()]);

  return (
    <div lang="en">
      <SayfaBasligi
        kirintilar={[{ ad: 'English', yol: '/en/' }]}
        etiket="ENGLISH EDITION"
        baslik="AI intelligence, knowledge, learning and execution."
        ozet="Sinaptik Lab is a Turkish-first AI platform. The English edition is being prepared as a real localisation — not a machine translation of the Turkish site."
        olcumler={[
          { deger: `${ATLAS.length}`, etiket: 'Atlas entries (TR)' },
          { deger: `${ARASTIRMA.length}`, etiket: 'Research (TR)' },
          { deger: 'tr-TR', etiket: 'Primary language' },
          { deger: 'In progress', etiket: 'English edition' },
        ]}
        eylemler={
          <>
            <Dugme href="/">
              Go to the Turkish site
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/bulten/" gorunum="ikincil">
              Get launch updates
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="STRUCTURE" baslik="Four layers" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {KATMANLAR_EN.map((katman, sira) => (
            <li key={katman.ad} className="bg-zemin p-6">
              <span className="etiket-mono text-metin-soluk">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="etiket-mono mt-2 text-vurgu-parlak">{katman.ad}</p>
              <p className="mt-3 text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin">
                {katman.soru}
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-metin-soluk">{katman.urun}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="APPROACH" baslik="Why not machine translation?" />
        <div className="olcu">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Publishing hundreds of thousands of machine-translated pages is technically easy and
            editorially worthless. Each language gets its own URLs, its own keyword research and
            genuine localisation — or it does not get published.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Until the English edition is ready, {SITE.alanAdi} serves Turkish readers. Research
            publications with open methodology will be the first content localised, because data
            travels across languages better than prose.
          </p>
        </div>
        <div className="mt-7">
          <Link
            href="/arastirma/"
            className="inline-flex items-center gap-2 text-sm font-medium text-vurgu-parlak"
          >
            See research publications
            <Ok className="size-4" />
          </Link>
        </div>
      </Bolum>
    </div>
  );
}
