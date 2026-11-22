import { Download, Search } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Paginated } from '@mbaqaa/shared'
import { Pager } from '@/components/Pager'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useLang } from '@/hooks/useLang'
import { api, apiUrl } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import { AdminPageHeader, DeleteButton, EmptyRow, StatusBadge } from './ui'

export interface InboxRow {
  id: string
  status: string
  adminNotes?: string
  createdAt: string
  name: string
  phone: string
  summary?: ReactNode
  fields: [label: string, value: ReactNode][]
}

interface InboxProps<T> {
  title: string
  listPath: string
  itemPath: (id: string) => string
  statuses: readonly string[]
  csvPath?: string
  normalize: (item: T) => InboxRow
  summaryLabel?: string
  header?: (data: Paginated<T> & Record<string, unknown>) => ReactNode
}

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

export function Inbox<T>({ title, listPath, itemPath, statuses, csvPath, normalize, summaryLabel, header }: InboxProps<T>) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const debouncedQ = useDebounced(q)
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, isLoading } = useAdminQuery<Paginated<T> & Record<string, unknown>>(listPath, {
    page,
    limit: 20,
    q: debouncedQ || undefined,
    status: status === 'all' ? undefined : status,
  })
  const rows = data?.items.map(normalize) ?? []
  const open = rows.find((r) => r.id === openId)

  return (
    <>
      <AdminPageHeader
        title={title}
        actions={
          csvPath && (
            <Button asChild variant="outline" size="sm">
              <a href={apiUrl(csvPath)} download>
                <Download className="size-4" /> {t('admin.exportCsv')}
              </a>
            </Button>
          )
        }
      />
      {data && header?.(data)}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }} placeholder={t('admin.search')} className="ps-9" />
        </div>
        <Select
          value={status}
          onValueChange={(s) => {
            setStatus(s)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`admin.statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('form.name')}</TableHead>
              <TableHead>{t('form.phone')}</TableHead>
              {summaryLabel && <TableHead className="hidden md:table-cell">{summaryLabel}</TableHead>}
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('admin.date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? null : rows.length === 0 ? (
              <EmptyRow colSpan={5} />
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenId(r.id)}>
                  <TableCell className={r.status === 'new' || r.status === 'pending' ? 'font-semibold' : ''}>{r.name}</TableCell>
                  <TableCell dir="ltr" className="text-end">{r.phone}</TableCell>
                  {summaryLabel && <TableCell className="hidden max-w-xs truncate md:table-cell">{r.summary}</TableCell>}
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDateTime(r.createdAt, lang)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {data && <Pager page={page} limit={data.limit} total={data.total} onChange={setPage} />}
      {open && <DetailDialog key={open.id} row={open} itemPath={itemPath(open.id)} statuses={statuses} onClose={() => setOpenId(null)} />}
    </>
  )
}

function DetailDialog({ row, itemPath, statuses, onClose }: { row: InboxRow; itemPath: string; statuses: readonly string[]; onClose: () => void }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [status, setStatus] = useState(row.status)
  const [notes, setNotes] = useState(row.adminNotes ?? '')

  const save = useAdminMutation(() => api(itemPath, { method: 'PATCH', body: { status, adminNotes: notes } }), { onSuccess: onClose })
  const remove = useAdminMutation(() => api(itemPath, { method: 'DELETE' }), { success: t('admin.deleted'), onSuccess: onClose })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{row.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{formatDateTime(row.createdAt, lang)}</p>
        </DialogHeader>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {row.fields
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium break-words whitespace-pre-line">{value}</dd>
              </div>
            ))}
        </dl>
        <div className="grid gap-4 border-t pt-4">
          <div className="grid gap-2">
            <Label>{t('admin.status')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`admin.statuses.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminNotes">{t('admin.adminNotes')}</Label>
            <Textarea id="adminNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <DeleteButton onConfirm={() => remove.mutate(undefined)} />
          <Button onClick={() => save.mutate(undefined)} disabled={save.isPending}>
            {t('admin.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
