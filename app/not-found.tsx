import Link from "next/link";

export default function BulunamadiSayfasi() {
  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-20">
      <p className="font-mono text-sm text-murekkep-2">SİNYAL YOK — 404</p>
      <h1 className="mt-3 font-display text-3xl font-bold">Bu adreste henüz bir ölçüm yok.</h1>
      <p className="mt-4 max-w-[var(--govde-olcu)] text-murekkep-2">
        Aradığınız sayfa taşınmış, hiç var olmamış ya da henüz yayına alınmamış olabilir.
        Sinaptiklab bölüm bölüm açılıyor; bu bölüm de sırasını bekliyor olabilir.
      </p>
      <div className="cetvel mt-8 max-w-md" aria-hidden />
      <p className="mt-6">
        <Link href="/">← Ana sayfaya dön</Link>
      </p>
    </div>
  );
}
