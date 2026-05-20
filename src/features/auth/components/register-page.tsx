import Image from 'next/image';
import Link from 'next/link';

import { LogoIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { RegisterClient, type RegisterClientLabels } from './register-client';

export type RegisterPageLabels = RegisterClientLabels & {
  brandName: string;
  heading: string;
  subheading: string;
  hasAccount: string;
  loginLink: string;
};

function FormPanel({ labels }: { labels: RegisterPageLabels }) {
  return (
    <div className="flex flex-1 flex-col lg:max-w-[549px]">
      <header className="flex h-[78px] shrink-0 items-center justify-end px-6 lg:hidden">
        <Link
          href={ROUTES.HOME}
          aria-label={labels.brandName}
          className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{labels.brandName}</span>
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-[364px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground text-end text-[32px] leading-normal font-medium">
              {labels.heading}
            </h1>
            <p className="text-muted-foreground text-end text-base leading-normal">
              <bdi>{labels.subheading}</bdi>
            </p>
          </div>
          <RegisterClient labels={labels} />
          <p className="text-foreground text-center text-base">
            {labels.hasAccount}{' '}
            <Link
              href={ROUTES.LOGIN}
              className="text-primary focus-visible:outline-ring font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2"
            >
              {labels.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ImagePanel({ brandName }: { brandName: string }) {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-1">
      <Image
        src="/images/login/bg.png"
        alt=""
        fill
        sizes="60vw"
        className="object-cover"
        priority
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(var(--blend-to-form), var(--login-bg) 0%, transparent 40%)',
        }}
      />
      <div className="absolute end-0 top-0 z-10 flex h-[78px] items-center pe-28">
        <Link
          href={ROUTES.HOME}
          aria-label={brandName}
          className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{brandName}</span>
        </Link>
      </div>
    </div>
  );
}

export function RegisterPage({ labels }: { labels: RegisterPageLabels }) {
  return (
    <div className="bg-login-bg flex min-h-dvh flex-col lg:flex-row">
      <FormPanel labels={labels} />
      <ImagePanel brandName={labels.brandName} />
    </div>
  );
}
