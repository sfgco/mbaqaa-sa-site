import { zodResolver } from '@hookform/resolvers/zod'
import { userCreateSchema, userRoles, type Paginated, type User } from '@mbaqaa/shared'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { z } from 'zod'
import { AdminOnly } from '@/components/admin/AdminLayout'
import { AdminPageHeader, DeleteButton, EmptyRow } from '@/components/admin/ui'
import { SelectField, TextField } from '@/components/forms/fields'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useMe } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

export default function Users() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data: me } = useMe()
  const { data } = useAdminQuery<Paginated<User>>('/users', { limit: 50 })
  const [creating, setCreating] = useState(false)
  const update = useAdminMutation(({ id, ...body }: { id: string; role?: string; active?: boolean }) => api(`/users/${id}`, { method: 'PATCH', body }))
  const remove = useAdminMutation((id: string) => api(`/users/${id}`, { method: 'DELETE' }), { success: t('admin.deleted') })

  return (
    <AdminOnly>
      <AdminPageHeader
        title={t('admin.users')}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> {t('admin.newUser')}
          </Button>
        }
      />
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('form.name')}</TableHead>
              <TableHead>{t('form.email')}</TableHead>
              <TableHead>{t('admin.role')}</TableHead>
              <TableHead>{t('admin.active')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.lastLogin')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data?.items.length ? (
              <EmptyRow colSpan={6} />
            ) : (
              data.items.map((u) => {
                const self = u._id === me?._id
                return (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell dir="ltr" className="text-end">{u.email}</TableCell>
                    <TableCell>
                      <Select value={u.role} disabled={self} onValueChange={(role) => update.mutate({ id: u._id, role })}>
                        <SelectTrigger size="sm" className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {t(`admin.roles.${r}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch checked={u.active} disabled={self} onCheckedChange={(active) => update.mutate({ id: u._id, active })} aria-label={t('admin.active')} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDateTime(u.lastLoginAt, lang)}</TableCell>
                    <TableCell>{!self && <DeleteButton size="icon" onConfirm={() => remove.mutate(u._id)} />}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {creating && <CreateUserDialog onClose={() => setCreating(false)} />}
    </AdminOnly>
  )
}

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { register, control, handleSubmit, formState: { errors } } = useForm<z.input<typeof userCreateSchema>, unknown, z.output<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { role: 'editor' },
  })
  const create = useAdminMutation((body: z.output<typeof userCreateSchema>) => api('/users', { method: 'POST', body }), { onSuccess: onClose })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.newUser')}</DialogTitle>
        </DialogHeader>
        <form id="user-form" onSubmit={handleSubmit((v) => create.mutate(v))} noValidate className="grid gap-4">
          <TextField register={register} name="name" label={t('form.name')} error={errors.name} />
          <TextField register={register} name="email" label={t('form.email')} error={errors.email} type="email" dir="ltr" />
          <TextField register={register} name="password" label={t('admin.password')} error={errors.password} type="password" dir="ltr" autoComplete="new-password" />
          <SelectField control={control} name="role" label={t('admin.role')} error={errors.role} options={userRoles.map((r) => ({ value: r, label: t(`admin.roles.${r}`) }))} />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button type="submit" form="user-form" disabled={create.isPending}>
            {t('admin.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
