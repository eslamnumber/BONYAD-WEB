import { authHandlers } from './auth';
import { bidHandlers } from './bids';
import { blogHandlers } from './blogs';
import { chatHandlers } from './chat';
import { contactHandlers } from './contact';
import { contractHandlers } from './contracts';
import { faqHandlers } from './faqs';
import { notificationHandlers } from './notifications';
import { projectHandlers } from './projects';
import { serviceHandlers } from './services';
import { technicianHandlers } from './technicians';

export const handlers = [
  ...authHandlers,
  ...bidHandlers,
  ...blogHandlers,
  ...chatHandlers,
  ...contactHandlers,
  ...contractHandlers,
  ...faqHandlers,
  ...notificationHandlers,
  ...projectHandlers,
  ...serviceHandlers,
  ...technicianHandlers,
];
