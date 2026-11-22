import { Mail, MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { org } from '@/data/siteContent'
import { useSettings } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'
import { involveLinks, mainLinks } from './SiteHeader'

const socialLabels = { x: 'X', instagram: 'Instagram', snapchat: 'Snapchat', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube' } as const

export function SiteFooter() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data: s } = useSettings()
  const socials = s ? (Object.entries(s.social) as [keyof typeof socialLabels, string][]).filter(([, url]) => url) : []

  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-lg font-bold">{pick(org.name, lang)}</p>
          <p className="mt-2 text-sm text-primary-foreground/80">{pick(org.tagline, lang)}</p>
          {s?.licenseNumber && (
            <p className="mt-4 text-sm text-primary-foreground/80">
              {t('footer.license')} <span dir="ltr">{s.licenseNumber}</span>
            </p>
          )}
        </div>
        <FooterLinks title={t('footer.quickLinks')} links={mainLinks} />
        <FooterLinks title={t('footer.getInvolved')} links={involveLinks} />
        <div>
          <p className="mb-3 font-semibold">{t('footer.contact')}</p>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {s?.phone && (
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <a href={`tel:${s.phone}`} dir="ltr">{s.phone}</a>
              </li>
            )}
            {s?.email && (
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
            )}
            {s && pick(s.address, lang) && (
              <li className="flex items-center gap-2">
                <MapPin className="size-4" />
                {pick(s.address, lang)}
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {socials.map(([k, url]) => (
                <li key={k}>
                  <a href={url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    {socialLabels[k]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-4 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} {pick(org.name, lang)} — {t('footer.rights')}
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: readonly { to: string; key: string }[] }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className="mb-3 font-semibold">{title}</p>
      <ul className="space-y-2 text-sm text-primary-foreground/85">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:underline">
              {t(`nav.${l.key}`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
