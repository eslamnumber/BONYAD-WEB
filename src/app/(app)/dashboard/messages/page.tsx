import { type Metadata } from 'next';

import { ChatWorkspace, MessagesEmptyState } from '@/features/messages';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return {
    title: t('messages.meta.title'),
    robots: { index: false, follow: false },
  };
}

export default async function MessagesPage() {
  const locale = await getServerLocale();

  // The `(app)` layout already provides the `<main>` landmark — render content only.
  // `ChatWorkspace` (client) fetches the conversation list and renders the
  // populated two-panel chat, falling back to the server-rendered empty state at
  // zero conversations.
  return <ChatWorkspace emptyState={<MessagesEmptyState locale={locale} />} />;
}
