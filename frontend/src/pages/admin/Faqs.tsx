import { zodResolver } from '@hookform/resolvers/zod'
import { faqSchema, type Faq, type Paginated } from '@mbaqaa/shared'
import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'
import { LocalizedField } from '@/components/admin/LocalizedField'
import { AdminPageHeader, DeleteButton, StatusBadge } from '@/components/admin/ui'
import { SelectField, TextField } from '@/components/forms/fields'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useLang } from '@/hooks/useLang'
import { api } from '@/lib/api'
import { pick } from '@/lib/format'
import { moved } from '@/lib/reorder'

export default function Faqs() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data } = useAdminQuery<Paginated<Faq>>('/faqs/admin')
  const [editing, setEditing] = useState<Faq | 'new' | null>(null)
  const reorder = useAdminMutation((ids: string[]) => api('/faqs/admin/reorder', { method: 'POST', body: { ids } }))
  const remove = useAdminMutation((id: string) => api(`/faqs/admin/${id}`, { method: 'DELETE' }), { success: t('admin.deleted') })
  const items = data?.items ?? []

  return (
    <>
      <AdminPageHeader
        title={t('admin.faqs')}
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="size-4" /> {t('admin.newFaq')}
          </Button>
        }
      />
      <div className="space-y-3">
        {items.length === 0 && <p className="py-12 text-center text-muted-foreground">{t('admin.empty')}</p>}
        {items.map((f, i) => (
          <Card key={f._id} className="py-4">
            <CardContent className="flex items-start gap-3">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveUp')} disabled={i === 0} onClick={() => reorder.mutate(moved(items, i, -1)!)}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" aria-label={t('admin.moveDown')} disabled={i === items.length - 1} onClick={() => reorder.mutate(moved(items, i, 1)!)}>
                  <ArrowDown className="size-4" />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{pick(f.question, lang)}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{pick(f.answer, lang)}</p>
              </div>
              <StatusBadge status={f.status} />
              <Button variant="ghost" size="icon" aria-label={t('admin.edit')} onClick={() => setEditing(f)}>
                <Pencil className="size-4" />
              </Button>
              <DeleteButton size="icon" onConfirm={() => remove.mutate(f._id)} />
            </CardContent>
          </Card>
        ))}
      </div>
      {editing && <FaqDialog faq={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function FaqDialog({ faq, onClose }: { faq?: Faq; onClose: () => void }) {
  const { t } = useTranslation()
  const { register, control, handleSubmit, formState: { errors } } = useForm<z.input<typeof faqSchema>, unknown, z.output<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: faq ? { question: faq.question, answer: faq.answer, category: faq.category, status: faq.status } : { status: 'published', category: 'general' },
  })
  const save = useAdminMutation(
    (body: z.output<typeof faqSchema>) => (faq ? api(`/faqs/admin/${faq._id}`, { method: 'PATCH', body }) : api('/faqs/admin', { method: 'POST', body })),
    { onSuccess: onClose },
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{faq ? t('admin.edit') : t('admin.newFaq')}</DialogTitle>
        </DialogHeader>
        <form id="faq-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-5">
          <LocalizedField register={register} errors={errors} name="question" label={t('admin.question')} />
          <LocalizedField register={register} errors={errors} name="answer" label={t('admin.answer')} multiline />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField register={register} name="category" label={t('admin.category')} error={errors.category} dir="ltr" />
            <SelectField
              control={control}
              name="status"
              label={t('admin.status')}
              error={errors.status}
              options={(['draft', 'published'] as const).map((s) => ({ value: s, label: t(`admin.statuses.${s}`) }))}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" form="faq-form" disabled={save.isPending}>
            {t('admin.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
