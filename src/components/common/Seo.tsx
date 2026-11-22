import { useTranslation } from 'react-i18next'

/** Per-route <title>/<meta>. React 19 hoists these into <head>. */
export function Seo({ title, description, image }: { title?: string; description?: string; image?: string }) {
  const { t } = useTranslation()
  const site = t('common:siteName')
  const full = title ? `${title} | ${site}` : site
  return (
    <>
      <title>{full}</title>
      {description ? <meta name="description" content={description.slice(0, 300)} /> : null}
      <meta property="og:title" content={full} />
      {description ? <meta property="og:description" content={description.slice(0, 300)} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
    </>
  )
}
