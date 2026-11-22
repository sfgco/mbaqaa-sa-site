import {
  contactStatuses,
  donationNotifyStatuses,
  requestStatuses,
  requestType as requestTypeSchema,
  type ContactRequest,
  type DonationNotification,
  type DonationNotificationList,
  type RequestItem,
} from '@mbaqaa/shared'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router'
import { AdminOnly } from '@/components/admin/AdminLayout'
import { Inbox, type InboxRow } from '@/components/admin/Inbox'
import { Card, CardContent } from '@/components/ui/card'
import { useLang } from '@/hooks/useLang'
import { formatDate, formatSar, pick } from '@/lib/format'

/** Translation group for enum-valued request fields. */
const enumGroups: Record<string, string> = {
  quantity: 'form.quantities',
  itemTypes: 'form.items',
  gender: 'form.genders',
  areas: 'form.areaOptions',
  availability: 'form.availabilityOptions',
  partnerType: 'form.partnerTypes',
}

function formatValue(t: TFunction, key: string, value: unknown) {
  const group = enumGroups[key]
  if (Array.isArray(value)) return value.map((v) => (group ? t(`${group}.${v}`) : String(v))).join('، ')
  if (group && typeof value === 'string') return t(`${group}.${value}`)
  return value == null ? '' : String(value)
}

const summaryKey = { clothes: 'city', volunteer: 'areas', partnership: 'organization' } as const

export function RequestsPage() {
  const { t } = useTranslation()
  const parsed = requestTypeSchema.safeParse(useParams().type)
  if (!parsed.success) return <Navigate to="/admin" replace />
  const type = parsed.data

  const normalize = (r: RequestItem): InboxRow => {
    const d = r.data as Record<string, unknown>
    return {
      id: r._id,
      status: r.status,
      adminNotes: r.adminNotes,
      createdAt: r.createdAt,
      name: String(d.contactName ?? d.name ?? ''),
      phone: String(d.phone ?? ''),
      summary: formatValue(t, summaryKey[type], d[summaryKey[type]]),
      fields: Object.entries(d).map(([k, v]) => [t(`form.${k}`), formatValue(t, k, v)]),
    }
  }

  return (
    <Inbox<RequestItem>
      key={type}
      title={t(`admin.${type}`)}
      listPath={`/requests/admin/${type}`}
      itemPath={(id) => `/requests/admin/${type}/${id}`}
      csvPath={`/requests/admin/${type}/export.csv`}
      statuses={requestStatuses}
      summaryLabel={t(`form.${summaryKey[type]}`)}
      normalize={normalize}
    />
  )
}

export function ContactPage() {
  const { t } = useTranslation()
  return (
    <Inbox<ContactRequest>
      title={t('admin.contact')}
      listPath="/contact/admin"
      itemPath={(id) => `/contact/admin/${id}`}
      statuses={contactStatuses}
      summaryLabel={t('form.subject')}
      normalize={(c) => ({
        id: c._id,
        status: c.status,
        adminNotes: c.adminNotes,
        createdAt: c.createdAt,
        name: c.name,
        phone: c.phone,
        summary: c.subject,
        fields: [
          [t('form.phone'), <span dir="ltr">{c.phone}</span>],
          [t('form.email'), c.email],
          [t('form.subject'), c.subject],
          [t('form.message'), c.message],
        ],
      })}
    />
  )
}

export function DonationsPage() {
  const { t } = useTranslation()
  const { lang } = useLang()
  return (
    <AdminOnly>
      <Inbox<DonationNotification>
        title={t('admin.donations')}
        listPath="/donations/admin/notifications"
        itemPath={(id) => `/donations/admin/notifications/${id}`}
        csvPath="/donations/admin/notifications/export.csv"
        statuses={donationNotifyStatuses}
        summaryLabel={t('form.amount')}
        header={(data) => (
          <Card className="mb-6 max-w-xs">
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('admin.confirmedTotal')}</p>
              <p className="text-2xl font-bold text-primary">{formatSar((data as unknown as DonationNotificationList).confirmedTotal, lang)}</p>
            </CardContent>
          </Card>
        )}
        normalize={(n) => ({
          id: n._id,
          status: n.status,
          adminNotes: n.adminNotes,
          createdAt: n.createdAt,
          name: n.name,
          phone: n.phone,
          summary: formatSar(n.amount, lang),
          fields: [
            [t('form.amount'), formatSar(n.amount, lang)],
            [t('form.transferDate'), formatDate(n.transferDate, lang)],
            [t('form.channel'), n.channel ? pick(n.channel.title, lang) : ''],
            [t('form.reference'), n.reference],
            [t('form.phone'), <span dir="ltr">{n.phone}</span>],
            [t('form.email'), n.email],
            [t('admin.recurring'), n.recurring ? t('admin.yes') : t('admin.no')],
            [t('form.notes'), n.notes],
          ],
        })}
      />
    </AdminOnly>
  )
}
