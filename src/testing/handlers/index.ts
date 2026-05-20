import { authHandlers } from './auth';
import { faqHandlers } from './faqs';

export const handlers = [...authHandlers, ...faqHandlers];
