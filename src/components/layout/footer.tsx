import Link from 'next/link';

import {
  LogoIcon,
  SocialInstagramIcon,
  SocialLinkedinIcon,
  SocialTiktokIcon,
  SocialXIcon,
} from '@/components/icons';

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

export function Footer({ labels }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="overflow-hidden bg-muted">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col-reverse gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap gap-12">
            {labels.columns.map((col) => (
              <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
          <FooterBrand tagline={labels.tagline} social={labels.social} />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs text-muted-foreground">
          <div className="flex gap-4">
            <Link href={labels.legal.termsHref} className="transition-colors hover:text-foreground">
              {labels.legal.terms}
            </Link>
            <Link href={labels.legal.privacyHref} className="transition-colors hover:text-foreground">
              {labels.legal.privacy}
            </Link>
          </div>
          <p>© {year} {labels.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

type FooterBrandProps = {
  tagline: string;
  social: FooterProps['labels']['social'];
};

function FooterBrand({ tagline, social }: FooterBrandProps) {
  return (
    <div className="flex shrink-0 flex-col items-start gap-5 md:w-[340px]">
      <LogoIcon className="h-10 w-auto" aria-hidden />
      <p className="text-start text-sm text-muted-foreground">{tagline}</p>
      <SocialLinks social={social} />
    </div>
  );
}

type SocialLinksProps = { social: FooterProps['labels']['social'] };

function SocialLinks({ social }: SocialLinksProps) {
  const items = [
    { ariaLabel: social.xAriaLabel, Icon: SocialXIcon },
    { ariaLabel: social.linkedinAriaLabel, Icon: SocialLinkedinIcon },
    { ariaLabel: social.instagramAriaLabel, Icon: SocialInstagramIcon },
    { ariaLabel: social.tiktokAriaLabel, Icon: SocialTiktokIcon },
  ];
  return (
    <div className="flex items-center gap-1">
      {items.map(({ ariaLabel, Icon }) => (
        <Link
          key={ariaLabel}
          href="#"
          aria-label={ariaLabel}
          className="rounded-full p-2 text-muted-foreground transition-colors duration-200 motion-safe:hover:bg-icon-hover motion-safe:hover:text-foreground"
        >
          <Icon className="size-6" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

function FooterLinkColumn({ title, links }: FooterColumn) {
  return (
    <div className="flex flex-col gap-6 text-start">
      <p className="text-2xl font-semibold text-foreground">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
