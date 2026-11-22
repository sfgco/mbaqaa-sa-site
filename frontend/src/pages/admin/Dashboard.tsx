import type { Stats } from '@mbaqaa/shared'
import { FileText, HandCoins, Handshake, Images, Inbox, Newspaper, Shirt, UserRoundPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AdminPageHeader } from '@/components/admin/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminQuery } from '@/hooks/useAdmin'
import { useMe } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { formatSar } from '@/lib/format'

function Tile({ to, icon: Icon, label, value, sub }: { to: string; icon: typeof Inbox; label: string; value: string | number; sub?: string }) {
  return (
    <Link to={to}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-brand-blue">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data: me } = useMe()
  const { data: s } = useAdminQuery<Stats>('/stats')

  if (!s) return <Skeleton className="h-64" />
  const newLabel = (n: number) => (n ? `${n} ${t('admin.new')}` : undefined)

  return (
    <>
      <AdminPageHeader title={t('admin.dashboard')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Tile to="/admin/requests/clothes" icon={Shirt} label={t('admin.clothes')} value={s.requests.clothes.total} sub={newLabel(s.requests.clothes.new)} />
        <Tile to="/admin/requests/volunteer" icon={UserRoundPlus} label={t('admin.volunteer')} value={s.requests.volunteer.total} sub={newLabel(s.requests.volunteer.new)} />
        <Tile to="/admin/requests/partnership" icon={Handshake} label={t('admin.partnership')} value={s.requests.partnership.total} sub={newLabel(s.requests.partnership.new)} />
        <Tile to="/admin/contact" icon={Inbox} label={t('admin.contact')} value={s.contact.total} sub={newLabel(s.contact.new)} />
        {me?.role === 'admin' && (
          <Tile
            to="/admin/donations"
            icon={HandCoins}
            label={t('admin.confirmedTotal')}
            value={formatSar(s.donations.confirmedTotal, lang)}
            sub={s.donations.pending ? `${s.donations.pending} ${t('admin.pending')}` : undefined}
          />
        )}
        <Tile to="/admin/documents" icon={FileText} label={t('admin.documents')} value={s.documents.published} sub={s.documents.downloads ? `${s.documents.downloads} ${t('admin.downloads')}` : undefined} />
        <Tile to="/admin/albums" icon={Images} label={t('admin.albums')} value={s.albums.published} sub={s.albums.images ? t('media.photos', { count: s.albums.images }) : undefined} />
        <Tile to="/admin/posts" icon={Newspaper} label={t('admin.posts')} value={s.posts.published} sub={s.posts.draft ? `${s.posts.draft} ${t('admin.statuses.draft')}` : undefined} />
      </div>
    </>
  )
}
