// BRIEF §6.2 — MDX bileşen haritası. lib/mdx/derle.tsx buradan alır;
// route'lar da MDXRemote'a doğrudan geçmek isterse buradan import eder.
// Not: a/table/pre override'ları JSX içerdiğinden dosya index.tsx'tir
// (import yolu değişmez: "@/components/mdx").
//
// h2/h3 override'ı YOK: stabil id'ler rehype aşamasında (rehypeBaslikId)
// verildiği için başlıklar olduğu gibi render edilir.
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { Adim } from "./Adim";
import { Diyagram } from "./Diyagram";
import { Karsilastirma } from "./Karsilastirma";
import { Kaynak } from "./Kaynak";
import { KisaCevap } from "./KisaCevap";
import { Kod } from "./Kod";
import { KopyalaButonu } from "./KopyalaButonu";
import { Olcum } from "./Olcum";
import { Terim } from "./Terim";
import { Uyari } from "./Uyari";
import { Video } from "./Video";
import { YoneticiOzeti } from "./YoneticiOzeti";

/** Dış linkler yeni sekmede + rel; iç linkler next/link ile. */
function Baglanti({ href, children, ...devam }: ComponentPropsWithoutRef<"a">) {
  const adres = typeof href === "string" ? href : "";
  const disMi = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(adres) || adres.startsWith("mailto:");
  if (disMi) {
    return (
      <a href={adres} target="_blank" rel="noopener noreferrer" {...devam}>
        {children}
      </a>
    );
  }
  return (
    <Link href={adres} {...devam}>
      {children}
    </Link>
  );
}

/** GFM tabloları: Karsilastirma'daki kaydırma sarmalayıcısının sade hali. */
function Tablo(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="my-0" {...props} />
    </div>
  );
}

/** Fence'lerin sade hali: Kod sarmalayıcısı olmadan da kopyala butonu olsun.
 *  <Kod> içine yerleştiğinde üst çubuktaki buton yeterli olduğundan
 *  buradaki araç (.kod-sade-arac) Kod tarafından CSS ile gizlenir. */
function SadeKod(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <div data-kopyalanabilir className="kod-sade relative my-6 border border-doku">
      <div className="kod-sade-arac absolute right-2 top-2 z-10">
        <KopyalaButonu />
      </div>
      <div data-kopya-icerik>
        <pre {...props} />
      </div>
    </div>
  );
}

export const mdxBilesenleri = {
  KisaCevap,
  Kaynak,
  Terim,
  Kod,
  Uyari,
  Karsilastirma,
  Adim,
  YoneticiOzeti,
  Diyagram,
  Olcum,
  Video,
  a: Baglanti,
  table: Tablo,
  pre: SadeKod,
};
