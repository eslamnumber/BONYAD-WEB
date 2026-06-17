import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const qiraatArdSierMuqawel: StaticArticle = {
  slug: 'qiraat-ard-sier-muqawel',
  title: 'كيف تقرأ عرض سعر المقاول؟',
  summary: 'دليل مبسط يشرح كيف تقرأ عرض سعر المقاول وتفهم التفاصيل المالية',
  category: 'نصائح',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/qiraat-ard-sier-muqawel.png',
  body: [
    {
      type: 'paragraph',
      text: 'فهم عرض السعر بشكل صحيح يحميك من المفاجآت المالية ويساعدك في المقارنة بين المقاولين.',
    },
    { type: 'heading', level: 2, text: 'عناصر عرض السعر' },
    { type: 'heading', level: 3, text: 'تكاليف المواد' },
    {
      type: 'paragraph',
      text: 'تشمل أسعار جميع المواد المستخدمة من أسمنت وحديد وبلاط ودهانات وغيرها مع تحديد الأنواع والماركات.',
    },
    { type: 'heading', level: 3, text: 'تكاليف العمالة' },
    {
      type: 'paragraph',
      text: 'أجور العمال والفنيين المشاركين في التنفيذ وتختلف حسب نوع العمل والمهارة المطلوبة.',
    },
    { type: 'heading', level: 3, text: 'التكاليف الإدارية' },
    {
      type: 'paragraph',
      text: 'تشمل الإشراف والنقل والمعدات وهامش ربح المقاول وعادة تكون نسبة من إجمالي التكاليف.',
    },
    { type: 'heading', level: 2, text: 'نقاط يجب الانتباه لها' },
    { type: 'heading', level: 3, text: 'البنود المخفية' },
    {
      type: 'paragraph',
      text: 'تأكد من شمول العرض لجميع الأعمال المطلوبة وعدم وجود بنود غير مذكورة ستضاف لاحقًا.',
    },
    { type: 'heading', level: 3, text: 'جودة المواد' },
    {
      type: 'paragraph',
      text: 'السعر المنخفض قد يعني استخدام مواد رديئة. تأكد من تحديد ماركات وجودة المواد في العرض.',
    },
    { type: 'heading', level: 3, text: 'شروط الدفع' },
    {
      type: 'paragraph',
      text: 'افهم جدول الدفعات ونسبة المقدم وشروط الدفعة الأخيرة المرتبطة بالاستلام.',
    },
    { type: 'heading', level: 2, text: 'المقارنة بين العروض' },
    {
      type: 'paragraph',
      text: 'قارن العروض على أساس نفس المواصفات والمواد وليس السعر الإجمالي فقط.',
    },
  ],
};
