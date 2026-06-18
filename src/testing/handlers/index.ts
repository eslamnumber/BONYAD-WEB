import { authHandlers } from './auth';
import { bidHandlers } from './bids';
import { blogHandlers } from './blogs';
import { cardHandlers } from './cards';
import { chatHandlers } from './chat';
import { contactHandlers } from './contact';
import { contractHandlers } from './contracts';
import { faqHandlers } from './faqs';
import { notificationHandlers } from './notifications';
import { paymentHandlers } from './payments';
import { portfolioHandlers } from './portfolio';
import { profileHandlers } from './profile';
import { projectHandlers } from './projects';
import { referralHandlers } from './referral';
import { serviceHandlers } from './services';
import { subscriptionHandlers } from './subscriptions';
import { technicianHandlers } from './technicians';

export const handlers = [
  ...authHandlers,
  ...bidHandlers,
  ...blogHandlers,
  ...cardHandlers,
  ...chatHandlers,
  ...contactHandlers,
  ...contractHandlers,
  ...faqHandlers,
  ...notificationHandlers,
  ...paymentHandlers,
  ...portfolioHandlers,
  ...profileHandlers,
  ...projectHandlers,
  ...referralHandlers,
  ...serviceHandlers,
  ...subscriptionHandlers,
  ...technicianHandlers,
];
