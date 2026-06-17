import { describe, expect, it } from 'vitest';

import { type TFunction } from '@/lib/get-translations';

import { STATIC_ARTICLES, getStaticArticleBySlug } from '../data/static-articles';
import { type Blog } from '../schemas/blog';

import { blogToCardVM, staticArticleToCardVM } from './blog-card-vm';

const t = ((key: string) => key) as unknown as TFunction;

describe('STATIC_ARTICLES registry', () => {
  it('holds all 15 ported legacy articles with unique slugs', () => {
    expect(STATIC_ARTICLES).toHaveLength(15);
    const slugs = STATIC_ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('gives every article the required fields and a static image path + body', () => {
    for (const article of STATIC_ARTICLES) {
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.title.length).toBeGreaterThan(0);
      expect(article.summary.length).toBeGreaterThan(0);
      expect(article.category.length).toBeGreaterThan(0);
      expect(article.image).toBe(`/images/blog/static/${article.slug}.png`);
      expect(article.body.length).toBeGreaterThan(0);
    }
  });

  it('looks an article up by slug and returns undefined for unknown slugs', () => {
    expect(getStaticArticleBySlug('kod-albina-alsaudi')?.title).toBe(
      'كود البناء السعودي: دليلك الشامل',
    );
    expect(getStaticArticleBySlug('does-not-exist')).toBeUndefined();
  });
});

describe('staticArticleToCardVM', () => {
  it('maps a static article to a slug-linked card view-model', () => {
    const article = getStaticArticleBySlug('marahel-bina-manzil')!;
    const card = staticArticleToCardVM(article);

    expect(card.href).toBe('/blog/marahel-bina-manzil');
    expect(card.title).toBe(article.title);
    expect(card.summary).toBe(article.summary);
    expect(card.badgeLabel).toBe(article.category);
    expect(card.badgeTag).toBe(article.category);
    expect(card.imageSrc).toBe(article.image);
  });
});

describe('blogToCardVM', () => {
  it('maps a populated backend post to an id-linked card', () => {
    const post = {
      id: 42,
      title: 'منزل جديد',
      summary: 'ملخص',
      tags: ['تشطيبات'],
      images: ['https://cdn.example/img.png'],
    } as unknown as Blog;

    const card = blogToCardVM(post, t);

    expect(card.href).toBe('/blog/42');
    expect(card.title).toBe('منزل جديد');
    expect(card.summary).toBe('ملخص');
    expect(card.badgeLabel).toBe('تشطيبات');
    expect(card.badgeTag).toBe('تشطيبات');
    expect(card.imageSrc).toBe('https://cdn.example/img.png');
  });

  it('falls back to translated labels and the placeholder image when fields are missing', () => {
    const post = { id: 7 } as unknown as Blog;

    const card = blogToCardVM(post, t);

    expect(card.href).toBe('/blog/7');
    expect(card.title).toBe('blog.uncategorized');
    expect(card.summary).toBe('');
    expect(card.badgeLabel).toBe('blog.uncategorized');
    expect(card.badgeTag).toBeUndefined();
    expect(card.imageSrc).toBe('/images/blog/featured-1.webp');
  });
});
