import Image from 'next/image';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import type { Blog } from '../schemas/blog';

type Props = { post: Blog; locale: Locale };

function splitParagraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null;
  return (
    <div className="text-foreground/80 flex w-full flex-col gap-6 text-end text-lg leading-8 sm:text-xl">
      {paragraphs.map((p, i) => (
        <p key={i} dir="auto" className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

export function BlogDetailBody({ post, locale }: Props) {
  const { t } = getTranslations(locale);
  const summaryParas = splitParagraphs(post.summary);
  const contentParas = splitParagraphs(post.content);
  const extraImage = post.images?.[1];
  const title = post.title ?? '';

  return (
    <div className="mx-auto flex w-full max-w-[850px] flex-col gap-8 px-4 sm:px-0">
      <Paragraphs paragraphs={summaryParas} />
      <Paragraphs paragraphs={contentParas} />
      {extraImage && (
        <div className="relative aspect-[850/462] w-full overflow-hidden rounded-[12px]">
          <Image
            src={extraImage}
            alt={t('blog.detail.imageAlt').replace('{{title}}', title)}
            fill
            sizes="(min-width: 1024px) 850px, 100vw"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
