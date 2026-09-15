'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Kilit, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { uzunBaglamMi } from '@/lib/icerik/baglam-penceresi';
import type { ModelKaydi } from '@/lib/icerik/varliklar';
import { HesapDuzeni, SecimAlani } from './HesapAlanlari';

type Senaryo = 'sohbet' | 'ajan' | 'belge' | 'siniflandirma' | 'gorsel';
type Barindirma = 'farketmez' | 'kendi' | 'yonetilen';
type Oncelik = 'kalite' | 'maliyet' | 'gecikme';

const SENARYOLAR: Record<Senaryo, { ad: string; arananlar: string[] }> = {
  sohbet: { ad: 'Sohbet / asistan', arananlar: ['Sohbet arayüzleri', 'Yapılandırılmış çıktı'] },
  ajan: { ad: 'Ajan / araç kullanımı', arananlar: ['Araç çağırma', 'Ajan iş akışları'] },
  belge: {
    ad: 'Uzun doküman işleme',
    arananlar: ['Uzun doküman işleme', 'Uzun bağlam tutarlılığı', 'Doküman işleme'],
  },
  siniflandirma: {
    ad: 'Yüksek hacimli sınıflandırma',
    arananlar: ['Yüksek hacimli sınıflandırma', 'Verimli çıkarım'],
  },
  gorsel: { ad: 'Görsel / çok modlu', arananlar: ['Görsel anlama', 'Çok modlu girdi'] },
};

/**
 * Model seçimi bir sıralama sorusu değil kısıt sorusudur. Bu araç kısıtlara göre
 * kısa liste üretir; nihai karar kendi görev setinizde yapılan ölçümle verilir.
 */
export function ModelSeciciArayuzu({ modeller }: { modeller: ModelKaydi[] }) {
  const [senaryo, setSenaryo] = useState<Senaryo>('ajan');
  const [barindirma, setBarindirma] = useState<Barindirma>('farketmez');
  const [oncelik, setOncelik] = useState<Oncelik>('kalite');
  const [cokModlu, setCokModlu] = useState(false);

  const sonuclar = useMemo(() => {
    const aranan = SENARYOLAR[senaryo].arananlar;

    return modeller
      .map((model) => {
        const gerekceler: string[] = [];
        let puan = 0;

        // Senaryo uyumu
        const yetenekler = [...(model.yetenekler ?? []), ...(model.kullanimAlanlari ?? [])];
        const eslesen = aranan.filter((istek) =>
          yetenekler.some((yetenek) =>
            yetenek.toLocaleLowerCase('tr').includes(istek.toLocaleLowerCase('tr')),
          ),
        );
        if (eslesen.length > 0) {
          puan += eslesen.length * 30;
          gerekceler.push(`Senaryo uyumu: ${eslesen.join(', ')}`);
        }

        // Barındırma kısıtı
        if (barindirma === 'kendi') {
          if (model.acikKaynak) {
            puan += 40;
            gerekceler.push('Açık ağırlık — kendi altyapınızda barındırılabilir');
          } else {
            puan -= 100;
            gerekceler.push('Kapalı ağırlık — kendi altyapınızda barındırılamaz');
          }
        }
        if (barindirma === 'yonetilen') {
          if (model.api) {
            puan += 30;
            gerekceler.push('Yönetilen API mevcut');
          } else {
            puan -= 60;
            gerekceler.push('Yönetilen API yok — operasyon yükü sizde');
          }
        }

        // Öncelik
        if (oncelik === 'maliyet') {
          if (model.acikKaynak) {
            puan += 25;
            gerekceler.push('Maliyet öngörülebilirliği yüksek');
          }
          if (model.tip.includes('Açık')) puan += 5;
        }
        if (oncelik === 'gecikme' && model.vurgu?.toLocaleLowerCase('tr').includes('verimlilik')) {
          puan += 25;
          gerekceler.push('Verimlilik odaklı dağıtım');
        }
        if (oncelik === 'kalite' && uzunBaglamMi(model.baglamPenceresi)) {
          puan += 15;
          gerekceler.push(`Uzun bağlam desteği (${model.baglamPenceresi})`);
        }

        // Çok modlu gereksinim
        const modaliteler = model.modaliteler ?? ['metin'];
        if (cokModlu) {
          if (modaliteler.length > 1) {
            puan += 30;
            gerekceler.push(`Modaliteler: ${modaliteler.join(' · ')}`);
          } else {
            puan -= 80;
            gerekceler.push('Yalnızca metin — görsel girdi desteklemiyor');
          }
        }

        return { model, puan, gerekceler };
      })
      .filter((kayit) => kayit.puan > 0)
      .sort((a, b) => b.puan - a.puan)
      .slice(0, 4);
  }, [modeller, senaryo, barindirma, oncelik, cokModlu]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SecimAlani
            etiket="Kullanım senaryosu"
            deger={senaryo}
            degisti={setSenaryo}
            secenekler={(Object.keys(SENARYOLAR) as Senaryo[]).map((anahtar) => ({
              deger: anahtar,
              ad: SENARYOLAR[anahtar].ad,
            }))}
          />
          <SecimAlani
            etiket="Barındırma kısıtı"
            deger={barindirma}
            degisti={setBarindirma}
            secenekler={[
              { deger: 'farketmez', ad: 'Fark etmez' },
              { deger: 'kendi', ad: 'Kendi altyapımızda olmalı' },
              { deger: 'yonetilen', ad: 'Yönetilen API tercih ederiz' },
            ]}
            ipucu="Veri ikametgâhı veya denetim gereksinimi varsa bu kısıt her şeyin önüne geçer."
          />
          <SecimAlani
            etiket="Birincil öncelik"
            deger={oncelik}
            degisti={setOncelik}
            secenekler={[
              { deger: 'kalite', ad: 'Kalite' },
              { deger: 'maliyet', ad: 'Maliyet öngörülebilirliği' },
              { deger: 'gecikme', ad: 'Gecikme' },
            ]}
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-kenar bg-zemin/60 p-4">
            <input
              type="checkbox"
              checked={cokModlu}
              onChange={(olay) => setCokModlu(olay.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--vurgu)]"
            />
            <span>
              <span className="block text-sm font-medium text-metin">Görsel girdi gerekiyor</span>
              <span className="mt-0.5 block text-xs text-metin-soluk">
                Ekran görüntüsü, form veya fotoğraf işlenecekse işaretleyin.
              </span>
            </span>
          </label>
        </>
      }
      sonuclar={
        sonuclar.length > 0 ? (
          <ul className="space-y-3">
            {sonuclar.map((kayit, sira) => (
              <li
                key={kayit.model.slug}
                className={`rounded-xl border p-5 ${
                  sira === 0 ? 'border-vurgu/40 bg-vurgu-zemin/40' : 'border-kenar bg-yuzey/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="etiket-mono text-metin-soluk">
                      {sira === 0 ? 'En uygun aday' : `${sira + 1}. aday`} · {kayit.model.saglayici}
                    </p>
                    <Link
                      href={`/modeller/${kayit.model.slug}/`}
                      className="mt-1.5 block text-[1.0625rem] font-semibold tracking-tight text-metin transition-colors hover:text-vurgu-parlak"
                    >
                      {kayit.model.ad}
                    </Link>
                  </div>
                  {kayit.model.acikKaynak ? (
                    <span className="etiket-mono shrink-0 rounded-full border border-basari/35 bg-basari/12 px-2 py-1 text-basari">
                      Açık
                    </span>
                  ) : (
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full border border-kenar text-metin-soluk"
                      title="Kapalı ağırlık"
                    >
                      <Kilit className="size-3" />
                    </span>
                  )}
                </div>

                <ul className="mt-3.5 space-y-1.5">
                  {kayit.gerekceler.map((gerekce) => (
                    <li key={gerekce} className="flex items-start gap-2 text-xs text-metin-ikincil">
                      <Onay className="mt-0.5 size-3.5 shrink-0 text-basari" />
                      {gerekce}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/modeller/${kayit.model.slug}/`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
                >
                  Model sayfası
                  <Ok className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
            <p className="etiket-mono mb-2 text-uyari">Aday yok</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              Seçtiğiniz kısıtları birlikte karşılayan bir model ailesi veritabanımızda yok.
              Kısıtlardan birini gevşetmeniz veya kurumsal değerlendirme talep etmeniz gerekiyor.
            </p>
          </div>
        )
      }
      not={
        <>
          Bu araç bir sıralama üretmez, kısıtlara göre kısa liste çıkarır. Nihai karar kendi görev
          setinizde yapılan ölçümle verilir — genel benchmark sıralamaları sizin iş akışınızı temsil
          etmez.
        </>
      }
    />
  );
}
