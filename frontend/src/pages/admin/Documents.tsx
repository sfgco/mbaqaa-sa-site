import { zodResolver } from '@hookform/resolvers/zod'
import { documentCategorySchema, documentSchema, type DocumentCategory, type DocumentFile, type DocumentItem, type Paginated } from '@mbaqaa/shared'
import { ArrowDown, ArrowUp, Download, Eye, FileText, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { z } from 'zod'
import { LocalizedField } from '@/components/admin/LocalizedField'
import { AdminPageHeader, DeleteButton, EmptyRow, StatusBadge } from '@/components/admin/ui'
import { PdfUploadField } from '@/components/admin/uploads'
import { SelectField, TextField } from '@/components/forms/fields'
import { useErrorText } from '@/components/forms/useErrorText'
import { Pager } from '@/components/Pager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useLang } from '@/hooks/useLang'
import { api, ApiError } from '@/lib/api'
import { pick } from '@/lib/format'
import { moved } from '@/lib/reorder'

const useCategories = () => useAdminQuery<{ items: DocumentCategory[] }>('/documents/admin/categories')

export default function Documents() {
  const { t } = useTranslation()
  const { isRtl } = useLang()
  return (
    <>
      <AdminPageHeader title={t('admin.documents')} />
      <Tabs defaultValue="documents" dir={isRtl ? 'rtl' : 'ltr'}>
        <TabsList className="mb-4">
          <TabsTrigger value="documents">{t('admin.documents')}</TabsTrigger>
          <TabsTrigger value="categories">{t('admin.documentCategories')}</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </>
  )
}

// ---------- Documents ----------
function DocumentsTab() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState<DocumentItem | 'new' | null>(null)
  const categories = useCategories()
  const { data, isLoading } = useAdminQuery<Paginated<DocumentItem>>('/documents/admin', { page, limit: 20, category: category === 'all' ? undefined : category })
  const remove = useAdminMutation((id: string) => api(`/documents/admin/${id}`, { method: 'DELETE' }), { success: t('admin.deleted') })
  const reorderDocs = useAdminMutation((ids: string[]) => api('/documents/admin/reorder', { method: 'POST', body: { ids } }))
  const items = data?.items ?? []
  const canReorder = category !== 'all' && (data?.total ?? 0) <= 20

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('governance.all')}</SelectItem>
            {categories.data?.items.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {pick(c.title, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setEditing('new')} disabled={!categories.data?.items.length}>
          <Plus className="size-4" /> {t('admin.newDocument')}
        </Button>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {canReorder && <TableHead className="w-16" />}
              <TableHead>{t('admin.titleField')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.category')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('admin.year')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('admin.downloads')}</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? null : !items.length ? (
              <EmptyRow colSpan={7} />
            ) : (
              items.map((d, i) => (
                <TableRow key={d._id}>
                  {canReorder && (
                    <TableCell>
                      <div className="flex">
                        <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveUp')} disabled={i === 0} onClick={() => reorderDocs.mutate(moved(items, i, -1)!)}>
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveDown')} disabled={i === items.length - 1} onClick={() => reorderDocs.mutate(moved(items, i, 1)!)}>
                          <ArrowDown className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                        {d.file.thumbnailUrl ? <img src={d.file.thumbnailUrl} alt="" className="size-full object-cover object-top" /> : <FileText className="size-4 text-muted-foreground" />}
                      </div>
                      <button type="button" className="truncate text-start font-medium hover:text-primary hover:underline" onClick={() => setEditing(d)}>
                        {pick(d.title, lang)}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{d.category ? pick(d.category.title, lang) : '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{d.year ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Download className="size-3.5" /> {d.downloads}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {d.status === 'published' && (
                        <Button asChild variant="ghost" size="icon" aria-label={t('admin.viewSite')}>
                          <Link to={`/governance/${d.slug}`} target="_blank">
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      )}
                      <DeleteButton size="icon" onConfirm={() => remove.mutate(d._id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {data && <Pager page={page} limit={data.limit} total={data.total} onChange={setPage} />}
      {editing && categories.data && (
        <DocumentDialog
          doc={editing === 'new' ? undefined : editing}
          categories={categories.data.items}
          defaultCategory={category === 'all' ? undefined : category}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

type DocForm = z.input<typeof documentSchema>
const toDateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : '')

function DocumentDialog({ doc, categories, defaultCategory, onClose }: { doc?: DocumentItem; categories: DocumentCategory[]; defaultCategory?: string; onClose: () => void }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  const errorText = useErrorText()
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<DocForm, unknown, z.output<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: doc
      ? {
          category: doc.category?._id,
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          year: doc.year,
          file: doc.file,
          status: doc.status,
          publishedAt: toDateInput(doc.publishedAt) as unknown as Date,
        }
      : { category: defaultCategory, status: 'published', description: { ar: '', en: '' }, year: new Date().getFullYear() },
  })
  const save = useAdminMutation(
    (body: z.output<typeof documentSchema>) => (doc ? api(`/documents/admin/${doc._id}`, { method: 'PATCH', body }) : api('/documents/admin', { method: 'POST', body })),
    { onSuccess: onClose },
  )
  const submit = handleSubmit((v) =>
    save.mutate(v, {
      onError: (e) => {
        if (e instanceof ApiError && e.fields) for (const [f, c] of Object.entries(e.fields)) setError(f as keyof DocForm, { message: c[0] })
      },
    }),
  )
  const fileError = errors.file?.url?.message ?? errors.file?.message

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{doc ? t('admin.edit') : t('admin.newDocument')}</DialogTitle>
        </DialogHeader>
        <form id="document-form" onSubmit={submit} noValidate className="grid gap-5">
          <Controller
            control={control}
            name="file"
            render={({ field }) => <PdfUploadField value={field.value as Partial<DocumentFile>} onChange={field.onChange} error={errorText(fileError)} />}
          />
          <LocalizedField register={register} errors={errors} name="title" label={t('admin.titleField')} />
          <LocalizedField register={register} errors={errors} name="description" label={t('admin.description')} multiline rows={3} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              control={control}
              name="category"
              label={t('admin.category')}
              error={errors.category}
              placeholder={t('form.select')}
              options={categories.map((c) => ({ value: c._id, label: pick(c.title, lang) }))}
            />
            <TextField register={register} name="slug" label={t('admin.slug')} error={errors.slug} dir="ltr" placeholder="bylaws-2025" />
            <TextField register={register} name="year" label={t('admin.year')} error={errors.year} type="number" min={1990} max={2100} dir="ltr" optional />
            <SelectField
              control={control}
              name="status"
              label={t('admin.status')}
              error={errors.status}
              options={(['draft', 'published'] as const).map((s) => ({ value: s, label: t(`admin.statuses.${s}`) }))}
            />
            <TextField register={register} name="publishedAt" label={t('admin.publishedAt')} error={errors.publishedAt as never} type="date" optional />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" form="document-form" disabled={save.isPending}>
            {t('admin.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Categories ----------
function CategoriesTab() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data } = useCategories()
  const [editing, setEditing] = useState<DocumentCategory | 'new' | null>(null)
  const reorderCats = useAdminMutation((ids: string[]) => api('/documents/admin/categories/reorder', { method: 'POST', body: { ids } }))
  const remove = useAdminMutation((id: string) => api(`/documents/admin/categories/${id}`, { method: 'DELETE' }), {
    success: t('admin.deleted'),
    errorText: (e) => (e instanceof ApiError && e.code === 'CATEGORY_NOT_EMPTY' ? t('admin.categoryNotEmpty') : undefined),
  })
  const items = data?.items ?? []

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="size-4" /> {t('admin.newCategory')}
        </Button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="py-12 text-center text-muted-foreground">{t('admin.empty')}</p>}
        {items.map((c, i) => (
          <Card key={c._id} className="py-4">
            <CardContent className="flex items-center gap-3">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveUp')} disabled={i === 0} onClick={() => reorderCats.mutate(moved(items, i, -1)!)}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveDown')} disabled={i === items.length - 1} onClick={() => reorderCats.mutate(moved(items, i, 1)!)}>
                  <ArrowDown className="size-4" />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{pick(c.title, lang)}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  /{c.slug}
                </p>
              </div>
              <Badge variant="secondary">{c.documentCount}</Badge>
              {!c.active && <Badge variant="outline">{t('admin.statuses.draft')}</Badge>}
              <Button variant="ghost" size="icon" aria-label={t('admin.edit')} onClick={() => setEditing(c)}>
                <Pencil className="size-4" />
              </Button>
              <DeleteButton size="icon" onConfirm={() => remove.mutate(c._id)} />
            </CardContent>
          </Card>
        ))}
      </div>
      {editing && <CategoryDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function CategoryDialog({ category, onClose }: { category?: DocumentCategory; onClose: () => void }) {
  const { t } = useTranslation()
  const { register, control, handleSubmit, formState: { errors } } = useForm<z.input<typeof documentCategorySchema>, unknown, z.output<typeof documentCategorySchema>>({
    resolver: zodResolver(documentCategorySchema),
    defaultValues: category
      ? { slug: category.slug, title: category.title, description: category.description, active: category.active }
      : { active: true, description: { ar: '', en: '' } },
  })
  const save = useAdminMutation(
    (body: z.output<typeof documentCategorySchema>) =>
      category ? api(`/documents/admin/categories/${category._id}`, { method: 'PATCH', body }) : api('/documents/admin/categories', { method: 'POST', body }),
    { onSuccess: onClose },
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{category ? t('admin.edit') : t('admin.newCategory')}</DialogTitle>
        </DialogHeader>
        <form id="category-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-5">
          <LocalizedField register={register} errors={errors} name="title" label={t('admin.titleField')} />
          <LocalizedField register={register} errors={errors} name="description" label={t('admin.description')} multiline rows={3} />
          <TextField register={register} name="slug" label={t('admin.slug')} error={errors.slug} dir="ltr" placeholder="policies" />
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch id="cat-active" checked={!!field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="cat-active">{t('admin.active')}</Label>
              </div>
            )}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" form="category-form" disabled={save.isPending}>
            {t('admin.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
