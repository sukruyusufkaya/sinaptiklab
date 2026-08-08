import { notFound } from "next/navigation";
import { IcerikSayfasi } from "@/components/content/IcerikSayfasi";
import { icerikOnizlemeVerisi } from "@/lib/db/queries/admin";
import { icerikDetayDTO } from "@/lib/db/queries/dto";
import { MdxDerlemeHatasi, mdxDerle } from "@/lib/mdx/derle";

/**
 * Editördeki iframe'in kaynağı: içeriği HER durumda (taslak dahil) id ile çekip
 * public sayfa bileşeniyle (IcerikSayfasi) render eder — yayında nasıl
 * görünecekse öyle. Middleware Basic Auth koruması altındadır.
 */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OnizlemeSayfasi({ params }: Props) {
  const { id } = await params;
  const veri = await icerikOnizlemeVerisi(id);
  if (veri === null) notFound();

  // toc boşsa (içerik hiç kaydedilmemiş eski veri vb.) derlemeden doldurulur;
  // aynı çağrı MDX sözdizimi hatasını IcerikSayfasi'ndan ÖNCE yakalamamızı sağlar.
  let dto = icerikDetayDTO(veri.doc, veri.yazarlar, veri.teknikEditor);
  try {
    const { toc } = await mdxDerle(dto.body);
    if (dto.toc.length === 0) dto = { ...dto, toc };
  } catch (hata) {
    if (hata instanceof MdxDerlemeHatasi) {
      return (
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-10">
          <div role="alert" className="border border-uyari p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-uyari">
              MDX derleme hatası
              {hata.satir !== null && (
                <>
                  {" — satır "}
                  {hata.satir}
                  {hata.sutun !== null && <>, sütun {hata.sutun}</>}
                </>
              )}
            </p>
            <p className="mt-2 text-sm">{hata.message}</p>
            <p className="mt-2 text-sm text-murekkep-2">
              Gövdeyi düzeltip kaydedin; önizleme kaydetten sonra kendini yeniler.
            </p>
          </div>
        </div>
      );
    }
    throw hata;
  }

  return <IcerikSayfasi icerik={dto} />;
}
