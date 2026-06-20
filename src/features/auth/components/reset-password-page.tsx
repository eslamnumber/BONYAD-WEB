import Image from 'next/image';
import Link from 'next/link';

import { LogoIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import { AuthHeader, type AuthHeaderLabels } from './auth-header';
import { ResetPasswordForm, type ResetPasswordFormLabels } from './reset-password-form';

export type ResetPasswordPageLabels = ResetPasswordFormLabels & {
  heading: string;
  subheading: string;
  backToLogin: string;
  headingBrand: string;
};

type FormPanelProps = {
  labels: ResetPasswordPageLabels;
  phone: string;
  accountRole: 'USER' | 'TECHNICIAN';
  locale: Locale;
  headerLabels: AuthHeaderLabels;
};

function FormPanel({ labels, phone, accountRole, locale, headerLabels }: FormPanelProps) {
  return (
    <div className="flex flex-1 flex-col lg:max-w-[549px]">
      <AuthHeader locale={locale} labels={headerLabels} />
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-[364px] flex-col gap-8">
          <div className="flex flex-col gap-8 text-end">
            <h1 className="text-foreground text-[32px] leading-normal font-medium">
              {labels.heading}
            </h1>
            <p className="text-muted-foreground text-base leading-normal">
              <bdi>{labels.subheading}</bdi>
            </p>
          </div>
          <ResetPasswordForm labels={labels} phone={phone} accountRole={accountRole} />
          <p className="text-center text-base">
            <Link
              href={ROUTES.LOGIN}
              className="text-primary focus-visible:outline-ring font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2"
            >
              {labels.backToLogin}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ImagePanel({ headingBrand }: { headingBrand: string }) {
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
          aria-label={headingBrand}
          className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{headingBrand}</span>
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordPage({
  labels,
  phone,
  accountRole,
  locale,
  headerLabels,
}: {
  labels: ResetPasswordPageLabels;
  phone: string;
  accountRole: 'USER' | 'TECHNICIAN';
  locale: Locale;
  headerLabels: AuthHeaderLabels;
}) {
  return (
    <div className="bg-login-bg flex min-h-dvh flex-col lg:flex-row">
      <FormPanel
        labels={labels}
        phone={phone}
        accountRole={accountRole}
        locale={locale}
        headerLabels={headerLabels}
      />
      <ImagePanel headingBrand={labels.headingBrand} />
    </div>
  );
}
