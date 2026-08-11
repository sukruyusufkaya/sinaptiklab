export * from "./ortak";
export * from "./content";
export * from "./author";
export * from "./term";
export * from "./quiz";
export * from "./topic";
export * from "./redirect";
export * from "./event";

import { authorIndexes } from "./author";
import { contentIndexes } from "./content";
import { eventIndexes } from "./event";
import type { IndexTanimi } from "./ortak";
import { testIndexes } from "./quiz";
import { redirectIndexes } from "./redirect";
import { termIndexes } from "./term";
import { topicIndexes } from "./topic";

// ensure-indexes.ts bu listeyi gezer; yeni koleksiyon buraya eklenir
export const TUM_KOLEKSIYONLAR: { ad: string; indexler: IndexTanimi[] }[] = [
  { ad: "contents", indexler: contentIndexes },
  { ad: "authors", indexler: authorIndexes },
  { ad: "terms", indexler: termIndexes },
  { ad: "quizzes", indexler: testIndexes },
  { ad: "topics", indexler: topicIndexes },
  { ad: "redirects", indexler: redirectIndexes },
  { ad: "events", indexler: eventIndexes },
];
