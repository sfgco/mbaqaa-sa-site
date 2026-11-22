import { ArrowLeft, ArrowRight, Building2, HandCoins, HandHeart, Recycle, Shirt, Sparkles, Truck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Section, Swirl } from '@/components/layout/PageHeader'
import { PostCard } from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { org } from '@/data/siteContent'
import { usePosts } from '@/hooks/queries'
import { useLang } from '@/hooks/useLang'
import { pick } from '@/lib/format'

const journeyIcons = [Truck, Recycle, Sparkles, HandHeart]
const programIcons = { reuse: Shirt, awareness: Users, smart: Sparkles } as const

export default function Home() {
  const { t } = useTranslation()
  const { lang, isRtl } = useLang()
  const Arrow = isRtl ? ArrowLeft : ArrowRight
  const posts = usePosts({ limit: 3 })

  const involve = [
    { to: '/donate/clothes', icon: Shirt, title: t('nav.donateClothes'), body: t('home.involved.clothes') },
    { to: '/donate', icon: HandCoins, title: t('nav.donateMoney'), body: t('home.involved.money') },
    { to: '/volunteer', icon: Users, title: t('nav.volunteer'), body: t('home.involved.volunteer') },
    { to: '/partners', icon: Building2, title: t('nav.partners'), body: t('home.involved.partners') },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-background">
        <Swirl className="pointer-events-none absolute -end-32 top-1/2 size-[520px] -translate-y-1/2 opacity-20 md:opacity-40" />
        <div className="container relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="mb-4 inline-flex rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-primary">{pick(org.name, lang)}</p>
          <h1 className="max-w-2xl text-4xl leading-tight font-bold text-primary md:text-6xl">{t('home.heroTitle')}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">{pick(org.tagline, lang)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/donate/clothes">
                {t('home.heroCta')} <Arrow className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/donate">{t('home.heroCta2')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Journey */}
      <Section title={t('home.journeyTitle')}>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {org.journey.map((step, i) => {
            const Icon = journeyIcons[i]
            return (
              <li key={i} className="relative flex items-center gap-4 rounded-xl border bg-card p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="size-6" />
                </span>
                <div>
                  <span className="text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <p className="font-semibold">{pick(step, lang)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </Section>

      {/* About strip */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-2xl font-bold">{t('about.vision')}</h2>
            <p className="leading-relaxed text-primary-foreground/90">{pick(org.vision, lang)}</p>
          </div>
          <div>
            <h2 className="mb-3 text-2xl font-bold">{t('about.mission')}</h2>
            <p className="leading-relaxed text-primary-foreground/90">{pick(org.mission, lang)}</p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <Section title={t('home.programsTitle')}>
        <div className="grid gap-6 md:grid-cols-3">
          {org.programs.map((p) => {
            const Icon = programIcons[p.key as keyof typeof programIcons]
            return (
              <Card key={p.key} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <Icon className="mb-2 size-9 text-accent" />
                  <CardTitle className="text-lg">{pick(p.title, lang)}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{pick(p.body, lang)}</CardContent>
              </Card>
            )
          })}
        </div>
      </Section>

      {/* Get involved */}
      <section className="bg-secondary/60">
        <Section title={t('home.involvedTitle')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {involve.map(({ to, icon: Icon, title, body }) => (
              <Link key={to} to={to} className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
                <Icon className="mb-4 size-8 text-primary" />
                <p className="mb-2 flex items-center gap-1 font-semibold group-hover:text-primary">
                  {title} <Arrow className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      {/* Goals */}
      <Section title={t('home.goalsTitle')}>
        <ul className="grid gap-4 md:grid-cols-2">
          {org.goals.map((g, i) => (
            <li key={i} className="flex gap-3 rounded-lg border-s-4 border-accent bg-card p-4">
              <span className="font-bold text-accent">{i + 1}</span>
              <span>{pick(g, lang)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">{t('home.vision2030')}</p>
      </Section>

      {/* News */}
      {posts.data && posts.data.items.length > 0 && (
        <Section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary md:text-3xl">{t('home.newsTitle')}</h2>
            <Button asChild variant="link">
              <Link to="/news">{t('home.allNews')}</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.data.items.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
