import { authHandlers } from './auth';
import { bidHandlers } from './bids';
import { blogHandlers } from './blogs';
import { chatHandlers } from './chat';
import { contactHandlers } from './contact';
import { faqHandlers } from './faqs';
import { notificationHandlers } from './notifications';
import { projectHandlers } from './projects';

export const handlers = [
  ...authHandlers,
  ...bidHandlers,
  ...blogHandlers,
  ...chatHandlers,
  ...contactHandlers,
  ...faqHandlers,
  ...notificationHandlers,
  ...projectHandlers,
];
