import { authHandlers } from './auth';
import { blogHandlers } from './blogs';
import { contactHandlers } from './contact';
import { faqHandlers } from './faqs';

export const handlers = [...authHandlers, ...blogHandlers, ...contactHandlers, ...faqHandlers];
