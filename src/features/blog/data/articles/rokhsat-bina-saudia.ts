import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const rokhsatBinaSaudia: StaticArticle = {
  slug: 'rokhsat-bina-saudia',
  title: 'شروط استخراج رخصة بناء في السعودية',
  summary: 'تعرف على شروط وإجراءات استخراج رخصة بناء في المملكة العربية السعودية',
  category: 'قانوني',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/rokhsat-bina-saudia.png',
  body: [
    {
      type: 'paragraph',
      text: 'رخصة البناء هي الخطوة الأولى والأساسية قبل البدء في أي مشروع بناء. تعرف على الشروط والإجراءات المطلوبة.',
    },
    { type: 'heading', level: 2, text: 'المستندات المطلوبة' },
    {
      type: 'list',
      items: [
        'صك ملكية الأرض',
        'الهوية الوطنية أو الإقامة',
        'المخططات المعمارية والإنشائية المعتمدة',
        'تقرير فحص التربة',
        'عقد إشراف هندسي',
      ],
    },
    { type: 'heading', level: 2, text: 'خطوات استخراج الرخصة' },
    { type: 'heading', level: 3, text: 'التقديم عبر منصة بلدي' },
    {
      type: 'paragraph',
      text: 'يتم تقديم طلب الرخصة إلكترونيًا عبر منصة بلدي التابعة لوزارة الشؤون البلدية والقروية.',
    },
    { type: 'heading', level: 3, text: 'مراجعة المخططات' },
    {
      type: 'paragraph',
      text: 'يتم مراجعة المخططات من الجهة المختصة للتأكد من مطابقتها لأنظمة البناء.',
    },
    { type: 'heading', level: 3, text: 'دفع الرسوم' },
    { type: 'paragraph', text: 'بعد الموافقة يتم دفع رسوم الرخصة حسب مساحة البناء ونوعه.' },
    { type: 'heading', level: 2, text: 'مدة صلاحية رخصة البناء' },
    {
      type: 'paragraph',
      text: 'رخصة البناء صالحة لمدة ثلاث سنوات من تاريخ الإصدار ويمكن تجديدها عند الحاجة.',
    },
    { type: 'heading', level: 2, text: 'نصائح مهمة' },
    {
      type: 'paragraph',
      text: 'تأكد من اختيار مكتب هندسي معتمد واحرص على مطابقة التنفيذ للمخططات المعتمدة لتجنب المخالفات.',
    },
  ],
};
