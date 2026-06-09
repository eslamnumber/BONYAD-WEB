import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations, type TFunction } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { type StaticArticle } from '../data/static-articles';

import { pickBadgeClasses } from './badge-color';
import { StaticArticleBody } from './static-article-body';

type Props = { article: StaticArticle; locale: Locale };

function ArticleHeader({ article }: { article: StaticArticle }) {
  return (
    <header
      dir="rtl"
      className="mx-auto flex w-full max-w-[850px] flex-col items-start gap-5 text-start"
    >
      <span
        className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-bold ${pickBadgeClasses(article.category)}`}
      >
        {article.category}
      </span>
      <h1
        id="static-article-title"
        className="text-brand-dark-navy w-full text-3xl leading-tight font-semibold sm:text-4xl lg:text-[45px]"
      >
        {article.title}
      </h1>
      <div className="text-muted-foreground flex items-center gap-3 text-sm">
        <span className="font-semibold">{article.author}</span>
        <span className="bg-muted-foreground/40 size-1 rounded-full" aria-hidden />
        <span>{article.date}</span>
      </div>
    </header>
  );
}

function ArticleCta({ t }: { t: TFunction }) {
  return (
    <div className="bg-primary text-primary-foreground mx-auto mt-2 flex w-full max-w-[850px] flex-col items-start gap-3 rounded-[12px] px-6 py-8 text-start">
      <h2 className="text-2xl font-bold">{t('blog.cta.title')}</h2>
      <p className="text-primary-foreground/80">{t('blog.cta.body')}</p>
      <Link
        href={ROUTES.HOME}
        className="bg-primary-foreground text-primary mt-2 rounded-full px-6 py-3 text-base font-semibold transition-opacity motion-safe:hover:opacity-90"
      >
        {t('blog.cta.action')}
      </Link>
    </div>
  );
}

export function StaticArticleDetail({ article, locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <article
      aria-labelledby="static-article-title"
      className="bg-background mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-6 md:gap-10 md:py-16 lg:py-20"
    >
      <ArticleHeader article={article} />

      <div className="relative aspect-[2732/800] w-full overflow-hidden rounded-[12px]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
      </div>

      <StaticArticleBody blocks={article.body} />

      <ArticleCta t={t} />

      <div className="text-brand-dark-navy mx-auto w-full max-w-[850px] text-start text-base font-semibold">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 transition-opacity motion-safe:hover:opacity-80"
        >
          {t('blog.detail.backToHome')}
        </Link>
      </div>
    </article>
  );
}
