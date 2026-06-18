import type { Metadata } from 'next';

import { ChangePasswordForm, ChangePhoneForm } from '@/features/auth';
import { EditProfileForm, MyInfoScreen } from '@/features/profile';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('profile.myInfo.title'), robots: { index: false, follow: false } };
}

/**
 * "My info" screen — account snapshot + a "Manage" accordion whose rows expand
 * their sub-screen inline. The route composes the forms (from `features/auth` /
 * `features/profile`) and hands them to {@link MyInfoScreen} as props, so neither
 * feature imports the other. Private surface, so `noindex`.
 */
export default function MyInfoPage() {
  return (
    <MyInfoScreen
      forms={{
        edit: <EditProfileForm />,
        phone: <ChangePhoneForm />,
        password: <ChangePasswordForm />,
      }}
    />
  );
}
