import type { NavItem } from './schemas/navigation'

/** Fallback/default main menu (also seeded into the DB, editable in the dashboard). */
export const DEFAULT_NAV: NavItem[] = [
  { label: { ar: 'الرئيسية', en: 'Home' }, href: '/', children: [], isButton: false },
  {
    label: { ar: 'عن الجمعية', en: 'About' },
    href: '',
    isButton: false,
    children: [
      { label: { ar: 'من نحن', en: 'Who we are' }, href: '/pages/about' },
      { label: { ar: 'رؤيتنا الاستراتيجية', en: 'Our Strategic Vision' }, href: '/about/strategy' },
      { label: { ar: 'حوكمتنا', en: 'Our Governance' }, href: '/about/governance' },
      { label: { ar: 'الوثائق والتقارير', en: 'Documents & Reports' }, href: '/documents' },
    ],
  },
  { label: { ar: 'برامجنا', en: 'Our Programs' }, href: '/pages/programs', children: [], isButton: false },
  {
    label: { ar: 'المركز الإعلامي', en: 'Media Center' },
    href: '/media',
    isButton: false,
    children: [
      { label: { ar: 'الأخبار والمقالات', en: 'News & Articles' }, href: '/media/news' },
      { label: { ar: 'معرض الصور', en: 'Photo Gallery' }, href: '/media/gallery' },
      { label: { ar: 'الفيديوهات', en: 'Videos' }, href: '/media/videos' },
    ],
  },
  {
    label: { ar: 'شارك معنا', en: 'Get Involved' },
    href: '',
    isButton: false,
    children: [
      { label: { ar: 'تبرع بالملابس', en: 'Donate Clothes' }, href: '/donate/clothes' },
      { label: { ar: 'تطوع', en: 'Volunteer' }, href: '/volunteer' },
      { label: { ar: 'شراكات', en: 'Partnerships' }, href: '/partners' },
    ],
  },
  { label: { ar: 'الأسئلة الشائعة', en: 'FAQ' }, href: '/faq', children: [], isButton: false },
  { label: { ar: 'تواصل معنا', en: 'Contact Us' }, href: '/contact', children: [], isButton: false },
  { label: { ar: 'تبرع الآن', en: 'Donate Now' }, href: '/donate', children: [], isButton: true },
]
