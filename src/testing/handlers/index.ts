import { authHandlers } from './auth';
import { bidHandlers } from './bids';
import { blogHandlers } from './blogs';
import { cardHandlers } from './cards';
import { changeRequestHandlers } from './change-requests';
import { chatHandlers } from './chat';
import { contactHandlers } from './contact';
import { contractHandlers } from './contracts';
import { faqHandlers } from './faqs';
import { feedbackHandlers } from './feedback';
import { notificationHandlers } from './notifications';
import { paymentHandlers } from './payments';
import { portfolioHandlers } from './portfolio';
import { profileHandlers } from './profile';
import { projectHandlers } from './projects';
import { referralHandlers } from './referral';
import { serviceHandlers } from './services';
import { sketchHandlers } from './sketch';
import { subscriptionHandlers } from './subscriptions';
import { technicianHandlers } from './technicians';
import { termsHandlers } from './terms';

export const handlers = [
  ...authHandlers,
  ...bidHandlers,
  ...blogHandlers,
  ...cardHandlers,
  ...changeRequestHandlers,
  ...chatHandlers,
  ...contactHandlers,
  ...contractHandlers,
  ...faqHandlers,
  ...feedbackHandlers,
  ...notificationHandlers,
  ...paymentHandlers,
  ...portfolioHandlers,
  ...profileHandlers,
  ...projectHandlers,
  ...referralHandlers,
  ...serviceHandlers,
  ...sketchHandlers,
  ...subscriptionHandlers,
  ...technicianHandlers,
  ...termsHandlers,
];
