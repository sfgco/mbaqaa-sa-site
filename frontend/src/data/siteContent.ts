import type { Localized } from '@mbaqaa/shared'

/**
 * Organisation content from docs/organization.md. Arabic is authoritative;
 * English is a draft for the charity to approve.
 * The internal financial sustainability plan is intentionally NOT published here.
 */
export const org = {
  name: { ar: 'جمعية مبرة بقاء', en: 'Mbaqaa Charity' } satisfies Localized,
  tagline: {
    ar: 'جمعية خيرية غير ربحية لإعادة استخدام الملابس والحد من الهدر',
    en: 'A non-profit charity that gives clothes a second life and reduces waste',
  } satisfies Localized,
  about: {
    ar: 'مبرة بقاء جمعية أهلية غير ربحية تسعى إلى الحد من هدر الملابس وتعزيز الاستفادة المستدامة منها، من خلال جمع الملابس وفرزها وإعادة تأهيل القابل منها لإعادة الاستخدام، ثم توجيه الملابس الصالحة للأسر الأشد احتياجًا بالتكامل مع الجمعيات والجهات ذات العلاقة. أما الملابس غير الصالحة أو التالفة، فيتم تسليمها إلى الجهات المختصة للاستفادة منها أو معالجتها والتخلص منها وفق الأنظمة والتعليمات المعمول بها.',
    en: 'Mbaqaa is a non-profit civil association working to reduce clothing waste and promote its sustainable use. We collect and sort clothes, refurbish what can be reused, and direct wearable items to the families most in need, in partnership with charities and relevant bodies. Damaged or unusable clothes are handed to licensed parties to be recycled or disposed of according to the regulations.',
  } satisfies Localized,
  vision: {
    ar: 'أن نكون روّاداً في إعادة استخدام الملابس الزائدة عن الحاجة، مساهمين في تحقيق التكافل الاجتماعي والحد من الهدر، وفق أعلى معايير الاستدامة والمسؤولية المجتمعية.',
    en: 'To be pioneers in reusing surplus clothing, contributing to social solidarity and reducing waste, according to the highest standards of sustainability and social responsibility.',
  } satisfies Localized,
  mission: {
    ar: 'تعزيز ثقافة إعادة استخدام الملابس بطرق مبتكرة ومستدامة، من خلال تطوير برامج فاعلة تضمن إيصال الموارد الزائدة إلى مستحقيها، بالتعاون مع المجتمع والمؤسسات المختلفة.',
    en: 'To promote a culture of reusing clothes in innovative and sustainable ways, by developing effective programmes that deliver surplus resources to those who deserve them, in cooperation with the community and institutions.',
  } satisfies Localized,
  goals: [
    { ar: 'تقليل الهدر في الموارد المختلفة، من الملابس وما شابهها.', en: 'Reduce waste of resources, especially clothing and similar items.' },
    { ar: 'توفير حلول مبتكرة لإعادة استخدام الملابس وتوزيعها على المحتاجين.', en: 'Provide innovative solutions to reuse clothes and distribute them to people in need.' },
    { ar: 'نشر الوعي حول أهمية إعادة استخدام الملابس وتعزيز ثقافة المسؤولية المجتمعية.', en: 'Raise awareness of reusing clothes and strengthen a culture of social responsibility.' },
    { ar: 'إنشاء شراكات مع الجهات الحكومية والخاصة لدعم برامج الاستدامة.', en: 'Build partnerships with government and private bodies to support sustainability programmes.' },
    { ar: 'تمكين الأسر المحتاجة من خلال تقديم الدعم العيني والتوعوي.', en: 'Empower families in need through in-kind support and awareness.' },
  ] satisfies Localized[],
  justifications: [
    { ar: 'الزيادة الملحوظة في هدر الموارد، وخاصة الملابس، مما يشكل تحدياً بيئياً واجتماعياً.', en: 'A noticeable rise in wasted resources, especially clothing — an environmental and social challenge.' },
    { ar: 'الحاجة إلى قنوات منظمة لجمع الفائض من الأفراد والشركات وإعادة توجيهه للمحتاجين.', en: 'The need for organised channels to collect surplus from individuals and companies and redirect it to those in need.' },
    { ar: 'تعزيز مفهوم إعادة الاستخدام والاستدامة بما يواكب رؤية المملكة 2030.', en: 'Promoting reuse and sustainability in line with Saudi Vision 2030.' },
    { ar: 'دعم الأسر ذات الدخل المحدود من خلال توفير احتياجاتها الأساسية.', en: 'Supporting low-income families by meeting their basic needs.' },
  ] satisfies Localized[],
  audiences: [
    { ar: 'الأسر المحتاجة والأفراد محدودو الدخل.', en: 'Families in need and low-income individuals.' },
    { ar: 'دور الأيتام والجمعيات الخيرية.', en: 'Orphanages and charities.' },
    { ar: 'المؤسسات التعليمية والمجتمعية لتعزيز التوعية بثقافة إعادة الاستخدام.', en: 'Educational and community institutions, to spread a culture of reuse.' },
    { ar: 'الجهات الحكومية والخاصة الراغبة في المساهمة بالمسؤولية المجتمعية.', en: 'Government and private bodies that want to contribute to social responsibility.' },
  ] satisfies Localized[],
  programs: [
    {
      key: 'reuse',
      title: { ar: 'برنامج إعادة استخدام الملابس', en: 'Clothing Reuse Programme' },
      body: { ar: 'استقبال الملابس المستخدمة، تنظيفها، وإعادة توزيعها على المحتاجين.', en: 'Receiving used clothes, cleaning them, and redistributing them to people in need.' },
    },
    {
      key: 'awareness',
      title: { ar: 'الحملات التوعوية', en: 'Awareness Campaigns' },
      body: { ar: 'تنظيم ورش عمل ومحاضرات لتعزيز ثقافة حفظ النعمة وإعادة استخدام الملابس.', en: 'Workshops and talks that encourage valuing what we have and reusing clothes.' },
    },
    {
      key: 'smart',
      title: { ar: 'مبادرة التبرع الذكي', en: 'Smart Giving Initiative' },
      body: { ar: 'إنشاء منصات رقمية تتيح للأفراد والشركات التبرع بسهولة.', en: 'Digital platforms that make it easy for individuals and companies to give.' },
    },
  ],
  /** How a clothes donation travels — derived from the "about" text. */
  journey: [
    { ar: 'جمع الملابس', en: 'Collect' },
    { ar: 'الفرز', en: 'Sort' },
    { ar: 'التنظيف وإعادة التأهيل', en: 'Clean & refurbish' },
    { ar: 'التوزيع على الأسر الأشد احتياجًا', en: 'Deliver to families in need' },
  ] satisfies Localized[],
}
