# Sinaptiklab

Türkçe teknik yapay zeka yayın ve öğrenme platformu. **Saha verisi, uydurma yok.**

Proje anayasası: [docs/BRIEF.md](docs/BRIEF.md) · Karar kayıtları: [docs/ADR/](docs/ADR/) · Faz planı: BRIEF §13.

## Yığın

Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind CSS v4 (token tabanlı, bkz. `app/globals.css`) · MongoDB Atlas (resmi driver + zod) · Vercel (fra1).

## Geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldurun (MONGODB_URI vb.)
npm run dev
```

| Komut                                         | İş                                                         |
| --------------------------------------------- | ---------------------------------------------------------- |
| `npm run lint` / `format:check` / `typecheck` | statik kontroller (CI'da zorunlu, uyarı = hata)            |
| `npm test`                                    | birim testleri (Vitest)                                    |
| `npm run build && npm run test:e2e`           | E2E + erişilebilirlik (Playwright + axe) — önce build şart |
| `npm run db:indexes`                          | MongoDB index'lerini idempotent kurar                      |

## Kurallar (özet — tamamı BRIEF §14)

- Bileşende token dışı hex/px yok; `any` ve `@ts-ignore` yok; `process.env`'e yalnız `lib/env.ts` üzerinden erişilir.
- Client component'te DB/sır yok; veri çekmek için `useEffect` yok (RSC/Server Action var).
- Her commit tek iş, Conventional Commits; faz DoD'si kapanmadan sonraki faza geçilmez.

Fontlar (Bricolage Grotesque, Newsreader, JetBrains Mono — OFL) `next/font/google` ile **build zamanında** indirilip self-host edilir; runtime'da Google CDN'e istek gitmez (gerekçe: ADR 0001).
