import type { DocumentCategoryInput, DonationChannelInput, FaqInput, PostInput, SettingsInput } from "@mbaqaa/shared";

/**
 * Starter content. Arabic comes from docs/organization.md; English is a draft for the charity to approve.
 * Bank details are FAKE placeholders — replace them from the dashboard before launch.
 */
export const seedSettings: SettingsInput = {
  phone: "{{رقم الهاتف}}",
  whatsapp: "{{رقم واتساب}}",
  email: "",
  address: { ar: "{{العنوان}}", en: "{{Address}}" },
  licenseNumber: "1000787500",
  workingHours: { ar: "الأحد – الخميس، 8 صباحًا – 4 مساءً", en: "Sun – Thu, 8 AM – 4 PM" },
};

export const seedChannels: DonationChannelInput[] = [
  {
    type: "qr",
    title: { ar: "التبرع عبر رمز QR", en: "Donate via QR code" },
    description: { ar: "امسح الرمز بتطبيق البنك للتبرع مباشرة.", en: "Scan with your banking app to donate directly." },
    qrImageUrl: "/qr/QR_donation.jpeg",
  },
  {
    type: "bank",
    title: { ar: "التحويل البنكي", en: "Bank transfer" },
    bankName: "{{اسم البنك}}",
    accountName: "جمعية مبرة بقاء",
    iban: "SA0000000000000000000000",
  },
];

export const seedFaqs: FaqInput[] = [
  {
    question: { ar: "ما هي جمعية مبرة بقاء؟", en: "What is Mbaqaa?" },
    answer: {
      ar: "جمعية خيرية غير ربحية تهدف إلى إعادة استخدام الملابس المهملة من خلال إعادة تأهيلها والاستفادة منها، وتوزيع الفائض على الأسر الأشد احتياجاً بالتنسيق مع الجمعيات المعتنية بالمستفيدين.",
      en: "A non-profit charity that gives unwanted clothes a second life: we refurbish them and pass the surplus to families in greatest need, in coordination with charities that serve them.",
    },
    category: "about",
  },
  {
    question: { ar: "كيف أتبرع بالملابس؟", en: "How do I donate clothes?" },
    answer: {
      ar: "عبّئ نموذج «تبرع بالملابس» في الموقع، وسيتواصل معك فريقنا لترتيب موعد الاستلام.",
      en: "Fill in the “Donate clothes” form on this site and our team will contact you to arrange a pickup.",
    },
    category: "clothes",
  },
  {
    question: { ar: "ماذا تفعلون بالملابس غير الصالحة للاستخدام؟", en: "What happens to clothes that can't be reused?" },
    answer: {
      ar: "تُسلَّم الملابس غير الصالحة أو التالفة إلى الجهات المختصة للاستفادة منها أو معالجتها والتخلص منها وفق الأنظمة والتعليمات المعمول بها.",
      en: "Damaged or unusable clothes are handed to licensed parties to be recycled or disposed of according to the regulations.",
    },
    category: "clothes",
  },
  {
    question: { ar: "من المستفيدون من التبرعات؟", en: "Who benefits from donations?" },
    answer: {
      ar: "الأسر المحتاجة والأفراد محدودو الدخل، ودور الأيتام والجمعيات الخيرية، بالتنسيق مع الجمعيات المعتنية بالمستفيدين.",
      en: "Families in need and low-income individuals, orphanages and charities — in coordination with the charities that serve them.",
    },
    category: "about",
  },
  {
    question: { ar: "كيف أتطوع مع الجمعية؟", en: "How can I volunteer?" },
    answer: {
      ar: "سجّل عبر نموذج «تطوع معنا» واختر المجالات التي تناسبك، وسنتواصل معك عند توفر فرصة مناسبة.",
      en: "Register through the “Volunteer” form and choose the areas that suit you; we'll contact you when a matching opportunity opens.",
    },
    category: "volunteer",
  },
  {
    question: { ar: "هل يمكن للشركات والجهات التعاون معكم؟", en: "Can companies and organisations partner with you?" },
    answer: {
      ar: "نعم، نرحّب بالشراكات مع الجهات الحكومية والخاصة والتعليمية لدعم برامج الاستدامة والمسؤولية المجتمعية. أرسل طلبك عبر صفحة «الشراكات».",
      en: "Yes. We welcome partnerships with government, private and educational bodies that support sustainability and social responsibility. Send a request from the Partnerships page.",
    },
    category: "partners",
  },
];

export const seedPosts: PostInput[] = [
  {
    slug: "welcome",
    title: { ar: "إطلاق الموقع الإلكتروني لجمعية مبرة بقاء", en: "Mbaqaa launches its website" },
    excerpt: {
      ar: "منصة رقمية تتيح لكم التبرع بالملابس والتطوع والشراكة معنا بسهولة.",
      en: "A digital platform that makes it easy to donate clothes, volunteer and partner with us.",
    },
    content: {
      ar: "ضمن «مبادرة التبرع الذكي»، أطلقت جمعية مبرة بقاء موقعها الإلكتروني ليكون قناة منظمة لجمع الفائض من الملابس من الأفراد والشركات وإعادة توجيهه للمحتاجين.\n\nيمكنكم عبر الموقع طلب استلام تبرعاتكم من الملابس، والتسجيل متطوعين، وتقديم طلبات الشراكة، والتبرع المالي.",
      en: "As part of our Smart Giving initiative, Mbaqaa has launched its website as an organised channel to collect surplus clothing from individuals and companies and redirect it to those in need.\n\nYou can request a pickup for your clothes, register as a volunteer, apply for a partnership and donate online.",
    },
    category: "news",
    status: "published",
  },
];

/** Governance sections (from docs/organization.md). No documents are seeded — upload the real PDFs. */
export const seedDocumentCategories: DocumentCategoryInput[] = [
  { slug: "bylaws", title: { ar: "اللائحة الأساسية", en: "Bylaws" } },
  { slug: "policies", title: { ar: "السياسات واللوائح", en: "Policies & regulations" } },
  { slug: "board-decisions", title: { ar: "قرارات مجلس الإدارة", en: "Board decisions" } },
  { slug: "licenses", title: { ar: "التراخيص", en: "Licenses" } },
  { slug: "reports", title: { ar: "التقارير", en: "Reports" } },
];
