// Allocates unique photos across homepage sections — guarantees that no
// single image is reused anywhere on the home page.
import { ALL_PHOTOS, HERO_SUNSET, FISHING, MARINA_BOAT } from "./images";

const hero = [HERO_SUNSET, FISHING, MARINA_BOAT];

// Remaining pool (preserves order, excludes hero shots).
const pool = ALL_PHOTOS.filter((p) => !hero.includes(p));

let cursor = 0;
const take = (n: number) => pool.slice(cursor, (cursor += n));

export const HOME_IMAGES = {
  hero,
  adventure: take(6),
  packages: take(3),
  gallery: take(7),
  latest: take(5),
  blog: take(3),
};
