// BRIEF §6.2/6.3 — kod fence sarmalayıcısı:
//   <Kod dosya="eval.py" satirVurgu="3-5">```py ...```</Kod>
// Üst çubukta dosya adı + Kopyala; içerideki fence Shiki'den zaten geçmiş gelir.
//
// Satır vurgusu kararı: ```py {3-5} meta sözdizimi DEĞİL, kod içi
// `// [!code highlight]` (py'de `# [!code highlight]`) notasyonu kullanılır.
// @shikijs/transformers kurulu olmadığından notasyonu lib/mdx/derle.tsx'teki
// kendi transformer'ımız işler ve satıra `.highlighted` sınıfı basar (CSS
// globals.css'te). `satirVurgu` prop'u §6.2 API uyumu için kabul edilir ve
// Faz 3 araçları için data attribute olarak taşınır; görsel vurgu notasyondan gelir.
import type { ReactNode } from "react";
import { KopyalaButonu } from "./KopyalaButonu";

export function Kod({
  dosya,
  satirVurgu,
  children,
}: {
  dosya?: string;
  satirVurgu?: string;
  children: ReactNode;
}) {
  return (
    <figure
      data-kopyalanabilir
      data-satir-vurgu={satirVurgu}
      className="my-6 border border-doku rounded-md [&_.kod-sade]:my-0 [&_.kod-sade]:border-0 [&_.kod-sade-arac]:hidden"
    >
      <figcaption className="flex items-center justify-between gap-2 border-b border-doku bg-kagit-alt px-3 py-1.5">
        <span className="font-mono text-xs text-murekkep-2">{dosya ?? "kod"}</span>
        <KopyalaButonu />
      </figcaption>
      <div data-kopya-icerik>{children}</div>
    </figure>
  );
}
