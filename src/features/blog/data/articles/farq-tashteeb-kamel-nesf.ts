import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const farqTashteebKamelNesf: StaticArticle = {
  slug: 'farq-tashteeb-kamel-nesf',
  title: 'الفرق بين التشطيب الكامل والنصف تشطيب',
  summary: 'شرح واضح حول الفرق بين التشطيب الكامل والنصف تشطيب',
  category: 'تشطيبات',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/farq-tashteeb-kamel-nesf.png',
  body: [
    {
      type: 'paragraph',
      text: 'عند شراء شقة أو وحدة سكنية ستواجه خيارين رئيسيين: التشطيب الكامل أو النصف تشطيب. كل خيار له مميزاته وعيوبه.',
    },
    { type: 'heading', level: 2, text: 'ما هو النصف تشطيب؟' },
    {
      type: 'paragraph',
      text: 'النصف تشطيب يعني أن الوحدة تأتي مع الهيكل الإنشائي والبياض الأساسي فقط بدون دهانات أو أرضيات أو تركيبات نهائية.',
    },
    { type: 'heading', level: 3, text: 'ما يشمله النصف تشطيب' },
    {
      type: 'list',
      items: [
        'الهيكل الإنشائي كامل',
        'البياض الداخلي والخارجي',
        'تأسيس السباكة والكهرباء',
        'النوافذ الخارجية',
      ],
    },
    { type: 'heading', level: 2, text: 'ما هو التشطيب الكامل؟' },
    {
      type: 'paragraph',
      text: 'التشطيب الكامل يعني استلام الوحدة جاهزة للسكن بكل التفاصيل من أرضيات ودهانات وتركيبات صحية وكهربائية.',
    },
    { type: 'heading', level: 2, text: 'مقارنة التكاليف' },
    { type: 'heading', level: 3, text: 'تكلفة النصف تشطيب' },
    {
      type: 'paragraph',
      text: 'سعر الشراء أقل لكن ستتحمل تكاليف التشطيب لاحقًا مما يمنحك حرية اختيار الخامات والتصميم.',
    },
    { type: 'heading', level: 3, text: 'تكلفة التشطيب الكامل' },
    {
      type: 'paragraph',
      text: 'سعر أعلى عند الشراء لكن توفير في الوقت والجهد مع ضمان جودة التنفيذ من المطور.',
    },
    { type: 'heading', level: 2, text: 'أيهما الأفضل لك؟' },
    {
      type: 'paragraph',
      text: 'إذا كنت تريد التحكم الكامل في التصميم والخامات اختر النصف تشطيب. أما إذا كنت تفضل السرعة والراحة فالتشطيب الكامل هو الخيار الأنسب.',
    },
  ],
};
