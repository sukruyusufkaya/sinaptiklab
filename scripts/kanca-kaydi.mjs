/** Alias çözücüsünü kaydeder. Betikler bunu `--import` ile alır. */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

register(pathToFileURL(resolve('scripts/alias-kancasi.mjs')).href);
