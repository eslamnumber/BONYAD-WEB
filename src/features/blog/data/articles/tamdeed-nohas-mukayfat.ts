import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const tamdeedNohasMukayfat: StaticArticle = {
  slug: 'tamdeed-nohas-mukayfat',
  title: 'تمديد النحاس للمكيفات: دليلك الشامل',
  summary: 'اكتشف التفاصيل الكاملة حول تمديد النحاس للمكيفات وأفضل المقاسات',
  category: 'تكييف',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/tamdeed-nohas-mukayfat.png',
  body: [
    {
      type: 'paragraph',
      text: 'مواسير النحاس هي العنصر الأساسي في نقل غاز التبريد بين وحدات التكييف. اختيار المقاس والنوع المناسب أمر حيوي.',
    },
    { type: 'heading', level: 2, text: 'لماذا النحاس؟' },
    {
      type: 'paragraph',
      text: 'يتميز النحاس بمقاومته العالية للتآكل وقدرته على نقل الحرارة بكفاءة وسهولة التشكيل والثني.',
    },
    { type: 'heading', level: 2, text: 'مقاسات مواسير النحاس' },
    { type: 'heading', level: 3, text: 'المقاسات الشائعة' },
    {
      type: 'list',
      items: [
        'ربع بوصة وثلاثة أرباع بوصة: للوحدات الصغيرة',
        'ثلاثة أثمان بوصة وسبعة أثمان بوصة: للوحدات المتوسطة',
        'نصف بوصة وبوصة وربع: للوحدات الكبيرة والمركزية',
      ],
    },
    { type: 'heading', level: 2, text: 'خطوات التمديد الصحيح' },
    { type: 'heading', level: 3, text: 'القياس والقطع' },
    {
      type: 'paragraph',
      text: 'قياس المسافات بدقة بين الوحدات وقطع المواسير بأداة مخصصة لضمان نظافة القطع.',
    },
    { type: 'heading', level: 3, text: 'الثني والتوصيل' },
    {
      type: 'paragraph',
      text: 'استخدام أداة الثني الخاصة لتجنب تلف الماسورة واللحام بالفضة لضمان إحكام الوصلات.',
    },
    { type: 'heading', level: 3, text: 'العزل الحراري' },
    {
      type: 'paragraph',
      text: 'تغليف المواسير بالعزل الحراري المناسب لمنع فقدان الطاقة وتكون التكثف.',
    },
    { type: 'heading', level: 2, text: 'اختبار التمديدات' },
    {
      type: 'paragraph',
      text: 'بعد اكتمال التمديد يتم عمل اختبار الضغط بالنيتروجين للتأكد من عدم وجود تسريبات.',
    },
  ],
};
