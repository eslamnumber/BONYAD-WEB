import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { type BlogCardVM } from './blog-card-vm';
import { BlogPostCard } from './blog-post-card';

type BlogPostsGridProps = { locale: Locale; cards: BlogCardVM[] };

export function BlogPostsGrid({ locale, cards }: BlogPostsGridProps) {
  const { t } = getTranslations(locale);

  if (cards.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:py-16">
        <h2 className="text-foreground text-xl font-semibold">{t('blog.empty.title')}</h2>
        <p className="text-foreground/70 mt-2">{t('blog.empty.body')}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {cards.map((card) => (
          <li key={card.href} className="flex">
            <BlogPostCard card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
