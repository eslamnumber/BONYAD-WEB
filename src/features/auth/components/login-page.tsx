import Image from 'next/image';
import Link from 'next/link';

import { LogoIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getActiveEnvironment } from '@/lib/api-environment.server';
import { type Locale } from '@/types/locale';

import { AuthHeader, type AuthHeaderLabels } from './auth-header';
import { LoginClient, type LoginClientLabels } from './login-client';
import { LoginEnvHeading } from './login-env-heading';

export type LoginPageLabels = LoginClientLabels & {
  heading: string;
  headingBrand: string;
  subheading: string;
  noAccount: string;
  createAccount: string;
};

function LoginImagePanel({ logoLabel }: { logoLabel: string }) {
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
      <div className="absolute end-0 top-0 z-10 flex h-[78px] items-center pe-8">
        <Link
          href={ROUTES.HOME}
          aria-label={logoLabel}
          className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{logoLabel}</span>
        </Link>
      </div>
    </div>
  );
}

export async function LoginPage({
  labels,
  locale,
  headerLabels,
}: {
  labels: LoginPageLabels;
  locale: Locale;
  headerLabels: AuthHeaderLabels;
}) {
  const { key: envKey } = await getActiveEnvironment();

  return (
    <div className="bg-login-bg flex min-h-dvh flex-col lg:flex-row">
      <div className="flex flex-1 flex-col lg:max-w-[549px]">
        <AuthHeader locale={locale} labels={headerLabels} />
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-[364px] flex-col gap-8">
            <LoginEnvHeading heading={labels.heading} brand={labels.headingBrand} envKey={envKey} />
            <p className="text-muted-foreground text-end text-base leading-normal">
              <bdi>{labels.subheading}</bdi>
            </p>
            <LoginClient labels={labels} />
            <p className="text-foreground text-center text-base">
              {labels.noAccount}{' '}
              <Link
                href={ROUTES.REGISTER}
                className="text-primary focus-visible:outline-ring font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2"
              >
                {labels.createAccount}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <LoginImagePanel logoLabel={labels.headingBrand} />
    </div>
  );
}
