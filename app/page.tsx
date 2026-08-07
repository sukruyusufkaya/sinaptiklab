export default function AnaSayfa() {
  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
      <section className="py-20 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-widest text-murekkep-2">
          Kalibrasyon aşaması — v0.1
        </p>
        <h1 className="mt-4 max-w-[22ch] font-display text-4xl font-bold">
          Saha verisi, uydurma yok.
        </h1>
        <p className="mt-6 max-w-[var(--govde-olcu)] text-lg text-murekkep-2">
          Sinaptiklab, yapay zeka sistemlerini gerçekten üretenler için yazılan Türkçe teknik yayın
          ve öğrenme platformudur: her iddia kaynaklı, her tutorial çalışan repo ile, her içerik
          sürümlü.
        </p>
      </section>

      <div className="cetvel" aria-hidden />

      <section aria-labelledby="ne-geliyor" className="py-14">
        <h2 id="ne-geliyor" className="font-display text-2xl font-bold">
          Tezgâhta ne var?
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          <li className="border border-doku bg-kagit-alt p-5">
            <p className="font-mono text-xs text-sinyal">01</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Kaynaklı derinlik</h3>
            <p className="mt-2 text-sm text-murekkep-2">
              Her sayı, tarih ve iddia kaynağına bağlanır; kaynağı olmayan içerik yayına teknik
              olarak çıkamaz.
            </p>
          </li>
          <li className="border border-doku bg-kagit-alt p-5">
            <p className="font-mono text-xs text-sinyal">02</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Çalışan kod</h3>
            <p className="mt-2 text-sm text-murekkep-2">
              Uygulamalar ve laboratuvarlar çalışan repo, model sürümü, donanım ve maliyet
              bilgisiyle gelir: yeniden üretilebilirlik varsayılandır.
            </p>
          </li>
          <li className="border border-doku bg-kagit-alt p-5">
            <p className="font-mono text-xs text-sinyal">03</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Kanonik Türkçe</h3>
            <p className="mt-2 text-sm text-murekkep-2">
              Türkçe yapay zeka terminolojisi tek sözlükte kanonikleşir; aynı kavram sitenin her
              yerinde aynı adla anılır.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
