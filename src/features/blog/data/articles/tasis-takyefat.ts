import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const tasisTakyefat: StaticArticle = {
  slug: 'tasis-takyefat',
  title: 'خطوات تأسيس التكييفات في المنازل',
  summary: 'دليل عملي لتأسيس نظام التكييف المركزي والاسبلت في المنازل الجديدة',
  category: 'تكييف',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/tasis-takyefat.png',
  body: [
    {
      type: 'paragraph',
      text: 'تأسيس التكييفات بشكل صحيح قبل التشطيب يضمن كفاءة التبريد ويوفر عليك تكاليف إضافية مستقبلًا.',
    },
    { type: 'heading', level: 2, text: 'متى يتم تأسيس التكييف؟' },
    {
      type: 'paragraph',
      text: 'يتم تأسيس التكييفات بعد الانتهاء من أعمال البناء الهيكلي وقبل البدء في أعمال البياض والمحارة.',
    },
    { type: 'heading', level: 2, text: 'خطوات تأسيس التكييف' },
    { type: 'heading', level: 3, text: 'تحديد مواقع الوحدات' },
    {
      type: 'paragraph',
      text: 'تحديد أماكن الوحدات الداخلية والخارجية بناءً على التصميم المعماري ومساحة كل غرفة.',
    },
    { type: 'heading', level: 3, text: 'تمديد مواسير النحاس' },
    {
      type: 'paragraph',
      text: 'تمديد مواسير النحاس بين الوحدات الداخلية والخارجية مع الحرص على العزل المناسب.',
    },
    { type: 'heading', level: 3, text: 'تمديد مواسير الصرف' },
    {
      type: 'paragraph',
      text: 'تركيب مواسير صرف المكثفات مع ميول مناسب لضمان تصريف المياه بشكل صحيح.',
    },
    { type: 'heading', level: 3, text: 'تمديد الأسلاك الكهربائية' },
    {
      type: 'paragraph',
      text: 'توصيل التغذية الكهربائية المناسبة لكل وحدة مع مراعاة سعة القاطع الكهربائي.',
    },
    { type: 'heading', level: 2, text: 'أنواع أنظمة التكييف' },
    { type: 'heading', level: 3, text: 'التكييف المركزي' },
    {
      type: 'paragraph',
      text: 'مناسب للفلل والمباني الكبيرة. يتم التحكم في تبريد جميع الغرف من وحدة مركزية واحدة.',
    },
    { type: 'heading', level: 3, text: 'التكييف الاسبليت' },
    {
      type: 'paragraph',
      text: 'الأكثر شيوعًا في الشقق. كل غرفة لها وحدة مستقلة مما يتيح تحكمًا فرديًا.',
    },
    { type: 'heading', level: 2, text: 'أخطاء يجب تجنبها' },
    {
      type: 'list',
      items: [
        'عدم عزل مواسير النحاس بشكل كافٍ',
        'استخدام مقاسات غير مناسبة للمواسير',
        'عدم ترك فتحات صيانة للوصول للمواسير',
      ],
    },
  ],
};
