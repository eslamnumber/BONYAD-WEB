import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import {
  BlogDetail,
  getBlog,
  getStaticArticleBySlug,
  StaticArticleDetail,
  type Blog,
  type StaticArticle,
} from '@/features/blog';
import { ApiError } from '@/lib/api-client';
import { getTranslations, type TFunction } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';

export const revalidate = 1800;

type Params = { id: string };
type PageProps = { params: Promise<Params> };

async function fetchOrNotFound(id: string): Promise<Blog> {
  try {
    return await getBlog(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

async function tryGetBlog(id: string): Promise<Blog | null> {
  try {
    return await getBlog(id);
  } catch {
    return null;
  }
}

function buildOpenGraph(post: Blog | null, title: string, description: string, url: string) {
  return {
    title,
    description,
    url,
    type: 'article' as const,
    locale: 'en_SA',
    alternateLocale: 'ar_SA',
    images: post?.images?.[0] ? [{ url: post.images[0] }] : undefined,
    publishedTime: post?.publishedAt ?? post?.createdAt,
    authors: post?.author?.name ? [post.author.name] : undefined,
  };
}

function staticArticleMetadata(article: StaticArticle, url: string, site: string): Metadata {
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url, languages: { en: url, ar: url } },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      type: 'article',
      locale: 'ar_SA',
      images: [{ url: `${site}${article.image}` }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

function staticArticleJsonLd(
  article: StaticArticle,
  site: string,
  t: TFunction,
): Record<string, unknown>[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.summary,
      image: `${site}${article.image}`,
      datePublished: `${article.date}-01-01`,
      author: { '@type': 'Organization', name: article.author },
      publisher: { '@type': 'Organization', name: t('site.name'), url: site },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${site}/blog/${article.slug}` },
      inLanguage: ['ar', 'en'],
    },
  ];
}

async function renderStaticArticle(article: StaticArticle) {
  const [locale, nonce] = await Promise.all([getServerLocale(), getRequestNonce()]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;
  return (
    <>
      <JsonLd data={staticArticleJsonLd(article, site, t)} nonce={nonce} />
      <StaticArticleDetail article={article} locale={locale} />
    </>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;
  const url = `${site}/blog/${id}`;

  const article = getStaticArticleBySlug(id);
  if (article) return staticArticleMetadata(article, url, site);

  const post = await tryGetBlog(id);

  const title = post?.title ?? t('blog.detail.metaTitleFallback');
  const description = post?.summary ?? t('blog.detail.metaDescriptionFallback');

  return {
    title,
    description,
    alternates: { canonical: url, languages: { en: url, ar: url } },
    openGraph: buildOpenGraph(post, title, description, url),
    twitter: { card: 'summary_large_image' },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;

  const article = getStaticArticleBySlug(id);
  if (article) return renderStaticArticle(article);

  const [locale, nonce, post] = await Promise.all([
    getServerLocale(),
    getRequestNonce(),
    fetchOrNotFound(id),
  ]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;
  const url = `${site}/blog/${id}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title ?? t('blog.uncategorized'),
      description: post.summary,
      image: post.images?.[0],
      datePublished: post.publishedAt ?? post.createdAt,
      dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
      author: post.author?.name
        ? { '@type': 'Person', name: post.author.name }
        : { '@type': 'Organization', name: t('site.name') },
      publisher: { '@type': 'Organization', name: t('site.name'), url: site },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      inLanguage: ['en', 'ar'],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <BlogDetail post={post} locale={locale} />
    </>
  );
}
