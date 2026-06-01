import { AboutTimelineDotIcon } from '@/components/icons';

type Props = {
  year: string;
  title: string;
  body: string;
};

/**
 * One milestone row of the Timeline (Figma 654:4782 et al).
 * Layout: [date content (flex-1, end-aligned)] + [progress rail (centered dot + dividers)].
 * Mirrors with locale via the dir-driven flex row — date on the start side, rail toward the title.
 * The year (654:4786) is a hollow outline: transparent fill + 1px navy text-stroke.
 */
export function AboutTimelineEntry({ year, title, body }: Props) {
  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-1 flex-col items-end gap-8 py-4 text-start">
        <div className="flex w-full flex-col items-end gap-4">
          <p className="text-[40px] leading-[1.2] font-medium text-transparent [-webkit-text-stroke:1px_var(--color-brand-dark-navy)]">
            {year}
          </p>
          <h3
            dir="auto"
            className="text-brand-dark-navy w-full text-[32px] leading-[1.3] font-medium"
          >
            {title}
          </h3>
        </div>
        <p dir="auto" className="text-brand-dark-navy/80 w-full text-lg leading-[1.5]">
          {body}
        </p>
      </div>

      <div aria-hidden className="flex w-12 shrink-0 flex-col items-center sm:w-16 lg:w-32">
        <div className="bg-about-accent h-6 w-[3px] shrink-0" />
        <AboutTimelineDotIcon className="text-about-accent size-[15px] shrink-0" />
        <div className="bg-about-accent w-[3px] flex-1" />
      </div>
    </div>
  );
}
