import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const kodAlbinaAlsaudi: StaticArticle = {
  slug: 'kod-albina-alsaudi',
  title: 'كود البناء السعودي: دليلك الشامل',
  summary: 'كل ما تريد معرفته عن كود البناء السعودي وأهم اشتراطاته الفنية',
  category: 'قانوني',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/kod-albina-alsaudi.png',
  body: [
    {
      type: 'paragraph',
      text: 'كود البناء السعودي هو المرجع الأساسي لجميع أعمال البناء والتشييد في المملكة العربية السعودية ويهدف لضمان السلامة والجودة.',
    },
    { type: 'heading', level: 2, text: 'ما هو كود البناء السعودي؟' },
    {
      type: 'paragraph',
      text: 'هو مجموعة من الاشتراطات والمعايير الفنية التي تنظم عمليات التصميم والتنفيذ والصيانة للمباني بهدف حماية الصحة والسلامة العامة.',
    },
    { type: 'heading', level: 2, text: 'أهم اشتراطات كود البناء' },
    { type: 'heading', level: 3, text: 'الاشتراطات الإنشائية' },
    {
      type: 'paragraph',
      text: 'تشمل متطلبات التصميم الإنشائي ومقاومة الزلازل وجودة المواد المستخدمة في البناء.',
    },
    { type: 'heading', level: 3, text: 'اشتراطات السلامة من الحريق' },
    {
      type: 'paragraph',
      text: 'تحدد متطلبات أنظمة الإنذار والإطفاء ومخارج الطوارئ ومواد البناء المقاومة للحريق.',
    },
    { type: 'heading', level: 3, text: 'اشتراطات العزل الحراري' },
    {
      type: 'paragraph',
      text: 'إلزامية تطبيق العزل الحراري للمباني لتقليل استهلاك الطاقة وتحسين كفاءة التكييف.',
    },
    { type: 'heading', level: 2, text: 'من يجب أن يلتزم بكود البناء؟' },
    {
      type: 'paragraph',
      text: 'جميع المباني الجديدة والتعديلات على المباني القائمة يجب أن تلتزم بكود البناء السعودي.',
    },
    { type: 'heading', level: 2, text: 'عقوبات مخالفة كود البناء' },
    {
      type: 'paragraph',
      text: 'تشمل العقوبات غرامات مالية وإيقاف أعمال البناء وقد تصل إلى إزالة المخالفة على نفقة المالك.',
    },
  ],
};
