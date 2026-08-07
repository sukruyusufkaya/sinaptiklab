export * from "./ortak";
export * from "./content";
export * from "./author";
export * from "./term";
export * from "./topic";
export * from "./redirect";

import { authorIndexes } from "./author";
import { contentIndexes } from "./content";
import type { IndexTanimi } from "./ortak";
import { redirectIndexes } from "./redirect";
import { termIndexes } from "./term";
import { topicIndexes } from "./topic";

// ensure-indexes.ts bu listeyi gezer; yeni koleksiyon buraya eklenir
export const TUM_KOLEKSIYONLAR: { ad: string; indexler: IndexTanimi[] }[] = [
  { ad: "contents", indexler: contentIndexes },
  { ad: "authors", indexler: authorIndexes },
  { ad: "terms", indexler: termIndexes },
  { ad: "topics", indexler: topicIndexes },
  { ad: "redirects", indexler: redirectIndexes },
];
