import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import { BlogDetail, getBlog, type Blog } from '@/features/blog';
import { ApiError } from '@/lib/api-client';
import { getTranslations } from '@/lib/get-translations';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;
  const url = `${site}/blog/${id}`;
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
