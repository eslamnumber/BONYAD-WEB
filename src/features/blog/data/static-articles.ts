/**
 * Editorial blog articles ported from the legacy app's static "Latest Blog
 * Posts" section. Each article lives in its own file under ./articles; this
 * module assembles them in display order and exposes a slug lookup. Content is
 * Arabic and rendered as-is in both locales (the hero banners bake in Arabic
 * text). This is local editorial content, not a UI string table.
 */

import { type StaticArticle } from './article-types';
import { afdalMuqawelTashteebat } from './articles/afdal-muqawel-tashteebat';
import { akhtaTashteebManazil } from './articles/akhta-tashteeb-manazil';
import { anwaDahaatSaudia } from './articles/anwa-dahaat-saudia';
import { anwaJibsAsqof } from './articles/anwa-jibs-asqof';
import { farqTashteebKamelNesf } from './articles/farq-tashteeb-kamel-nesf';
import { jibsAdiAwBord } from './articles/jibs-adi-aw-bord';
import { kodAlbinaAlsaudi } from './articles/kod-albina-alsaudi';
import { marahelBinaManzil } from './articles/marahel-bina-manzil';
import { marahelTashteebShaqqa } from './articles/marahel-tashteeb-shaqqa';
import { mayaeerIkhtiyarMuqawel } from './articles/mayaeer-ikhtiyar-muqawel';
import { qiraatArdSierMuqawel } from './articles/qiraat-ard-sier-muqawel';
import { rokhsatBinaSaudia } from './articles/rokhsat-bina-saudia';
import { tajannubTakheerMuqawel } from './articles/tajannub-takheer-muqawel';
import { tamdeedNohasMukayfat } from './articles/tamdeed-nohas-mukayfat';
import { tasisTakyefat } from './articles/tasis-takyefat';

export type { ArticleBlock, StaticArticle } from './article-types';

// Display order mirrors the legacy `all.html` grid (blog-1 … blog-15).
export const STATIC_ARTICLES: StaticArticle[] = [
  marahelBinaManzil,
  marahelTashteebShaqqa,
  farqTashteebKamelNesf,
  kodAlbinaAlsaudi,
  rokhsatBinaSaudia,
  anwaDahaatSaudia,
  tasisTakyefat,
  tamdeedNohasMukayfat,
  anwaJibsAsqof,
  akhtaTashteebManazil,
  jibsAdiAwBord,
  afdalMuqawelTashteebat,
  tajannubTakheerMuqawel,
  qiraatArdSierMuqawel,
  mayaeerIkhtiyarMuqawel,
];

export function getStaticArticleBySlug(slug: string): StaticArticle | undefined {
  return STATIC_ARTICLES.find((article) => article.slug === slug);
}
