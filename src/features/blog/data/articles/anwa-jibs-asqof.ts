import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const anwaJibsAsqof: StaticArticle = {
  slug: 'anwa-jibs-asqof',
  title: 'أفضل أنواع الجبس للأسقف في السعودية',
  summary: 'تعرّف على أفضل أنواع الجبس للأسقف في السعودية مع توضيح المزايا والعيوب',
  category: 'تشطيبات',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/anwa-jibs-asqof.png',
  body: [
    {
      type: 'paragraph',
      text: 'أسقف الجبس تضيف لمسة جمالية للمنزل وتخفي التمديدات. تعرف على أفضل الأنواع المتوفرة في السوق السعودي.',
    },
    { type: 'heading', level: 2, text: 'أنواع الجبس المتاحة' },
    { type: 'heading', level: 3, text: 'الجبس العادي التقليدي' },
    {
      type: 'paragraph',
      text: 'يتم تشكيله يدويًا في الموقع ويتميز بالمرونة في التصميم والقدرة على إنشاء أشكال معقدة.',
    },
    { type: 'heading', level: 3, text: 'ألواح الجبس بورد' },
    {
      type: 'paragraph',
      text: 'ألواح جاهزة الصنع يتم تثبيتها على هيكل معدني. سريعة التركيب وموحدة السمك.',
    },
    { type: 'heading', level: 3, text: 'جبس بورد مقاوم للرطوبة' },
    {
      type: 'paragraph',
      text: 'مخصص للحمامات والمطابخ. يتميز باللون الأخضر ومقاومته العالية للرطوبة.',
    },
    { type: 'heading', level: 3, text: 'جبس بورد مقاوم للحريق' },
    {
      type: 'paragraph',
      text: 'يستخدم في المناطق التي تتطلب حماية إضافية من الحريق ويتميز باللون الوردي.',
    },
    { type: 'heading', level: 2, text: 'مقارنة بين الجبس العادي والجبس بورد' },
    { type: 'heading', level: 3, text: 'من حيث التكلفة' },
    {
      type: 'paragraph',
      text: 'الجبس العادي أقل تكلفة في المواد لكن يحتاج وقت عمل أطول. الجبس بورد أسرع في التركيب.',
    },
    { type: 'heading', level: 3, text: 'من حيث الجودة' },
    {
      type: 'paragraph',
      text: 'الجبس بورد أكثر انتظامًا ومقاومة للتشقق بينما الجبس العادي يتيح تصاميم أكثر تفصيلًا.',
    },
    { type: 'heading', level: 2, text: 'نصائح عند اختيار الجبس' },
    {
      type: 'list',
      items: [
        'استخدم الجبس المقاوم للرطوبة في المناطق الرطبة',
        'تأكد من جودة الهيكل المعدني لتجنب الترهل',
        'اترك فتحات صيانة للوصول للتمديدات',
      ],
    },
  ],
};
