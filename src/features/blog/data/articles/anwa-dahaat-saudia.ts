import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const anwaDahaatSaudia: StaticArticle = {
  slug: 'anwa-dahaat-saudia',
  title: 'أنواع الدهانات في السعودية',
  summary: 'دليل شامل عن أنواع الدهانات المتوفرة في السوق السعودي وأفضل الخيارات لمنزلك',
  category: 'تشطيبات',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/anwa-dahaat-saudia.png',
  body: [
    {
      type: 'paragraph',
      text: 'اختيار نوع الدهان المناسب في السعودية يتطلب مراعاة المناخ الحار والجاف لضمان متانة ولون طويل الأمد.',
    },
    { type: 'heading', level: 2, text: 'أنواع الدهانات الداخلية' },
    { type: 'heading', level: 3, text: 'الدهان البلاستيكي' },
    {
      type: 'paragraph',
      text: 'الأكثر شيوعًا في الاستخدام الداخلي. سهل التنظيف ومتوفر بألوان متعددة ومناسب لمعظم الغرف.',
    },
    { type: 'heading', level: 3, text: 'دهان الأكريليك' },
    {
      type: 'paragraph',
      text: 'يتميز بمقاومة عالية للرطوبة مما يجعله مثاليًا للحمامات والمطابخ.',
    },
    { type: 'heading', level: 3, text: 'دهان الزيت' },
    { type: 'paragraph', text: 'يوفر لمعانًا عاليًا وحماية قوية للأسطح الخشبية والمعدنية.' },
    { type: 'heading', level: 2, text: 'أنواع الدهانات الخارجية' },
    { type: 'heading', level: 3, text: 'الدهان الخارجي المقاوم للحرارة' },
    {
      type: 'paragraph',
      text: 'مصمم خصيصًا لتحمل درجات الحرارة العالية والأشعة فوق البنفسجية في المناخ السعودي.',
    },
    { type: 'heading', level: 3, text: 'دهان الأسطح العازل' },
    {
      type: 'paragraph',
      text: 'يساعد في عكس أشعة الشمس وتقليل حرارة المبنى مما يوفر في استهلاك الكهرباء.',
    },
    { type: 'heading', level: 2, text: 'نصائح لاختيار الدهان المناسب' },
    {
      type: 'list',
      items: [
        'اختر دهانات مقاومة للأشعة فوق البنفسجية للاستخدام الخارجي',
        'استخدم دهانات مقاومة للرطوبة في الحمامات والمطابخ',
        'تأكد من جودة المعجون قبل الدهان لضمان نتيجة مثالية',
      ],
    },
  ],
};
