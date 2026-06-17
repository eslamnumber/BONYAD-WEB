import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const tajannubTakheerMuqawel: StaticArticle = {
  slug: 'tajannub-takheer-muqawel',
  title: 'كيف تتجنب تأخير المقاول؟',
  summary: 'نصائح مهمة توضح كيف تتجنب تأخير المقاول عبر تنظيم العقود والمتابعة',
  category: 'نصائح',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/tajannub-takheer-muqawel.png',
  body: [
    {
      type: 'paragraph',
      text: 'تأخير المقاول من أكثر المشاكل شيوعًا في مشاريع البناء والتشطيب. إليك استراتيجيات فعالة لتجنب ذلك.',
    },
    { type: 'heading', level: 2, text: 'أسباب التأخير الشائعة' },
    { type: 'heading', level: 3, text: 'ضعف التخطيط' },
    {
      type: 'paragraph',
      text: 'عدم وجود جدول زمني واضح ومفصل يؤدي إلى فوضى في التنفيذ وتأخير متراكم.',
    },
    { type: 'heading', level: 3, text: 'تغيير المتطلبات' },
    {
      type: 'paragraph',
      text: 'التعديلات المتكررة من العميل أثناء التنفيذ تسبب تأخيرًا كبيرًا وزيادة في التكاليف.',
    },
    { type: 'heading', level: 3, text: 'مشاكل التوريد' },
    {
      type: 'paragraph',
      text: 'تأخر وصول المواد أو عدم توفرها يوقف العمل ويؤخر المشروع بالكامل.',
    },
    { type: 'heading', level: 2, text: 'حلول عملية' },
    { type: 'heading', level: 3, text: 'العقد الواضح' },
    {
      type: 'paragraph',
      text: 'ضمّن في العقد جدولًا زمنيًا مفصلًا مع غرامات تأخير محددة لكل مرحلة.',
    },
    { type: 'heading', level: 3, text: 'المتابعة الدورية' },
    {
      type: 'paragraph',
      text: 'قم بزيارات منتظمة للموقع وعقد اجتماعات أسبوعية مع المقاول لمتابعة التقدم.',
    },
    { type: 'heading', level: 3, text: 'الدفعات المشروطة' },
    {
      type: 'paragraph',
      text: 'اربط الدفعات المالية بإنجاز مراحل محددة مما يحفز المقاول على الالتزام بالجدول.',
    },
    { type: 'heading', level: 2, text: 'دور منصة بُنياد' },
    {
      type: 'paragraph',
      text: 'توفر بُنياد نظام متابعة ذكي يساعدك في تتبع تقدم المشروع والتواصل مع المقاول بشفافية.',
    },
  ],
};
