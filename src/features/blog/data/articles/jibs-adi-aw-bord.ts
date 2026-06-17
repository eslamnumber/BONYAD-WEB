import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const jibsAdiAwBord: StaticArticle = {
  slug: 'jibs-adi-aw-bord',
  title: 'الأفضل جبس عادي أو جبس بورد: مقارنة شاملة',
  summary: 'دليل مقارن يجيب عن سؤال الأفضل جبس عادي أو جبس بورد',
  category: 'تشطيبات',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/jibs-adi-aw-bord.png',
  body: [
    {
      type: 'paragraph',
      text: 'سؤال يطرحه كل من يبني أو يشطب منزله. نقدم لك مقارنة تفصيلية لمساعدتك في الاختيار الصحيح.',
    },
    { type: 'heading', level: 2, text: 'الجبس العادي التقليدي' },
    { type: 'heading', level: 3, text: 'المميزات' },
    {
      type: 'list',
      items: ['تكلفة مواد أقل', 'مرونة عالية في التصاميم والزخارف', 'لا يحتاج هيكل معدني'],
    },
    { type: 'heading', level: 3, text: 'العيوب' },
    {
      type: 'list',
      items: ['يحتاج حرفي ماهر', 'وقت تنفيذ أطول', 'أكثر عرضة للتشقق'],
    },
    { type: 'heading', level: 2, text: 'الجبس بورد' },
    { type: 'heading', level: 3, text: 'المميزات' },
    {
      type: 'list',
      items: ['سرعة التركيب', 'سطح موحد ومتساوي', 'أنواع متخصصة مقاومة للرطوبة والحريق'],
    },
    { type: 'heading', level: 3, text: 'العيوب' },
    {
      type: 'list',
      items: [
        'تكلفة أعلى مع الهيكل المعدني',
        'محدودية في التصاميم المعقدة',
        'يقلل من ارتفاع السقف',
      ],
    },
    { type: 'heading', level: 2, text: 'التوصية النهائية' },
    {
      type: 'paragraph',
      text: 'للمساحات الكبيرة والتصاميم البسيطة اختر الجبس بورد. للتصاميم الكلاسيكية والزخرفية اختر الجبس العادي.',
    },
  ],
};
