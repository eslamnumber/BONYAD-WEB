import { ARTICLE_AUTHOR, ARTICLE_YEAR, type StaticArticle } from '../article-types';

export const marahelTashteebShaqqa: StaticArticle = {
  slug: 'marahel-tashteeb-shaqqa',
  title: 'مراحل تشطيب الشقه بالترتيب في السعودية',
  summary: 'دليل عملي يوضح مراحل تشطيب الشقه بالترتيب في السعودية خطوة بخطوة',
  category: 'تشطيبات',
  author: ARTICLE_AUTHOR,
  date: ARTICLE_YEAR,
  image: '/images/blog/static/marahel-tashteeb-shaqqa.png',
  body: [
    {
      type: 'paragraph',
      text: 'تشطيب الشقة يحتاج إلى ترتيب دقيق لضمان جودة النتيجة وتجنب الأخطاء المكلفة. إليك الدليل الشامل لمراحل التشطيب بالترتيب الصحيح.',
    },
    { type: 'heading', level: 2, text: 'أولًا: أعمال السباكة والكهرباء' },
    {
      type: 'paragraph',
      text: 'تبدأ مراحل التشطيب بتأسيس شبكات السباكة والكهرباء داخل الجدران والأرضيات قبل أي أعمال أخرى.',
    },
    { type: 'heading', level: 3, text: 'تأسيس السباكة' },
    {
      type: 'paragraph',
      text: 'تمديد مواسير المياه الباردة والساخنة ومواسير الصرف وفقًا للمخططات المعتمدة مع اختبار الضغط.',
    },
    { type: 'heading', level: 3, text: 'التمديدات الكهربائية' },
    {
      type: 'paragraph',
      text: 'تمديد الأسلاك والمواسير الكهربائية وتحديد مواقع المفاتيح والمقابس حسب التصميم.',
    },
    { type: 'heading', level: 2, text: 'ثانيًا: أعمال البياض والمحارة' },
    {
      type: 'paragraph',
      text: 'بعد اكتمال التمديدات يتم عمل البياض الداخلي والخارجي للجدران مع التأكد من استواء الأسطح.',
    },
    { type: 'heading', level: 2, text: 'ثالثًا: تركيب الأرضيات' },
    { type: 'heading', level: 3, text: 'أنواع الأرضيات المناسبة' },
    {
      type: 'paragraph',
      text: 'اختيار نوع الأرضية يعتمد على الاستخدام والميزانية سواء كانت سيراميك أو بورسلين أو رخام أو باركيه.',
    },
    { type: 'heading', level: 2, text: 'رابعًا: أعمال الدهانات' },
    {
      type: 'paragraph',
      text: 'تشمل أعمال الدهان تطبيق المعجون وتنعيم الجدران ثم الدهان بالألوان المختارة.',
    },
    { type: 'heading', level: 2, text: 'خامسًا: تركيب الأبواب والنوافذ' },
    {
      type: 'paragraph',
      text: 'تركيب الأبواب الداخلية والخارجية والنوافذ مع ضمان العزل المناسب.',
    },
    { type: 'heading', level: 2, text: 'سادسًا: أعمال التكييف' },
    {
      type: 'paragraph',
      text: 'تركيب وحدات التكييف وتوصيل مواسير النحاس وعمل اختبار التشغيل النهائي.',
    },
  ],
};
