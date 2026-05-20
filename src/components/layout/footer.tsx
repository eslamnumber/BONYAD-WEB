import Link from 'next/link';

import {
  LogoIcon,
  SocialInstagramIcon,
  SocialLinkedinIcon,
  SocialTiktokIcon,
  SocialXIcon,
} from '@/components/icons';
import { SOCIAL_LINKS } from '@/config/constants';
import { ROUTES } from '@/config/routes';

type FooterColumn = { title: string; links: { href: string; label: string }[] };

type FooterProps = {
  labels: {
    siteName: string;
    tagline: string;
    copyright: string;
    columns: [FooterColumn, FooterColumn, FooterColumn];
    legal: { privacy: string; privacyHref: string; terms: string; termsHref: string };
    social: {
      xAriaLabel: string;
      linkedinAriaLabel: string;
      instagramAriaLabel: string;
      tiktokAriaLabel: string;
    };
  };
};

const FOCUS_RING =
  'rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

export function Footer({ labels }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-border bg-muted relative overflow-hidden border-t">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <div className="flex flex-col gap-10 md:flex-row md:gap-20">
            {labels.columns.map((col) => (
              <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
          <FooterBrand siteName={labels.siteName} tagline={labels.tagline} social={labels.social} />
        </div>
      </div>
      <div className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-base">
          <div className="flex gap-4">
            <Link
              href={labels.legal.termsHref}
              className={`${FOCUS_RING} hover:text-foreground transition-colors`}
            >
              {labels.legal.terms}
            </Link>
            <Link
              href={labels.legal.privacyHref}
              className={`${FOCUS_RING} hover:text-foreground transition-colors`}
            >
              {labels.legal.privacy}
            </Link>
          </div>
          <p className="text-start">
            © {year} {labels.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

type FooterBrandProps = {
  siteName: string;
  tagline: string;
  social: FooterProps['labels']['social'];
};

function FooterBrand({ siteName, tagline, social }: FooterBrandProps) {
  return (
    <div className="flex w-full shrink-0 flex-col items-start gap-6 lg:max-w-[372px]">
      <Link href={ROUTES.HOME} aria-label={siteName} className={FOCUS_RING}>
        <LogoIcon className="h-10 w-auto" aria-hidden />
        <span className="sr-only">{siteName}</span>
      </Link>
      <p className="text-muted-foreground text-start text-base">{tagline}</p>
      <SocialLinks social={social} />
    </div>
  );
}

type SocialLinksProps = { social: FooterProps['labels']['social'] };

function SocialLinks({ social }: SocialLinksProps) {
  const items = [
    { href: SOCIAL_LINKS.x, ariaLabel: social.xAriaLabel, Icon: SocialXIcon },
    { href: SOCIAL_LINKS.linkedin, ariaLabel: social.linkedinAriaLabel, Icon: SocialLinkedinIcon },
    {
      href: SOCIAL_LINKS.instagram,
      ariaLabel: social.instagramAriaLabel,
      Icon: SocialInstagramIcon,
    },
    { href: SOCIAL_LINKS.tiktok, ariaLabel: social.tiktokAriaLabel, Icon: SocialTiktokIcon },
  ];
  return (
    <div className="flex items-center gap-5">
      {items.map(({ href, ariaLabel, Icon }) => (
        <Link
          key={ariaLabel}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className={`${FOCUS_RING} text-muted-foreground motion-safe:hover:bg-icon-hover motion-safe:hover:text-foreground rounded-full p-2.5 transition-colors duration-200`}
        >
          <Icon className="size-6" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

function FooterLinkColumn({ title, links }: FooterColumn) {
  return (
    <nav aria-label={title} className="flex flex-col gap-8 text-start">
      <h2 className="text-foreground text-3xl font-semibold">{title}</h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className={`${FOCUS_RING} text-muted-foreground hover:text-foreground text-base transition-colors duration-200`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
