import { zodResolver } from '@hookform/resolvers/zod'
import { postCategories, postSchema, type Paginated, type Post } from '@mbaqaa/shared'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import type { z } from 'zod'
import { LocalizedField } from '@/components/admin/LocalizedField'
import { AdminPageHeader, DeleteButton, EmptyRow, StatusBadge } from '@/components/admin/ui'
import { SelectField, TextField } from '@/components/forms/fields'
import { Pager } from '@/components/Pager'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminMutation, useAdminQuery } from '@/hooks/useAdmin'
import { useLang } from '@/hooks/useLang'
import { api, ApiError } from '@/lib/api'
import { formatDate, pick } from '@/lib/format'

export function PostsList() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminQuery<Paginated<Post>>('/posts/admin', { page, limit: 20 })

  return (
    <>
      <AdminPageHeader
        title={t('admin.posts')}
        actions={
          <Button asChild size="sm">
            <Link to="/admin/posts/new">
              <Plus className="size-4" /> {t('admin.newPost')}
            </Link>
          </Button>
        }
      />
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.titleField')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.category')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('admin.publishedAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? null : !data?.items.length ? (
              <EmptyRow colSpan={4} />
            ) : (
              data.items.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="max-w-sm truncate">
                    <Link to={`/admin/posts/${p._id}`} className="font-medium hover:text-primary hover:underline">
                      {pick(p.title, lang)}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{t(`news.categories.${p.category}`)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(p.publishedAt, lang)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {data && <Pager page={page} limit={data.limit} total={data.total} onChange={setPage} />}
    </>
  )
}

type PostForm = z.input<typeof postSchema>

const toDateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export function PostEditor() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { data, isLoading } = useAdminQuery<Post>(`/posts/admin/${id}`, undefined, !isNew)
  if (!isNew && (isLoading || !data)) return <Skeleton className="h-96" />
  return <PostFormView key={id} post={isNew ? undefined : data} />
}

function PostFormView({ post }: { post?: Post }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<PostForm, unknown, z.output<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: post
      ? {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage ?? '',
          category: post.category,
          status: post.status,
          publishedAt: toDateInput(post.publishedAt) as unknown as Date,
        }
      : { category: 'news', status: 'draft' },
  })

  const save = useAdminMutation(
    (body: z.output<typeof postSchema>) =>
      post ? api<Post>(`/posts/admin/${post._id}`, { method: 'PATCH', body }) : api<Post>('/posts/admin', { method: 'POST', body }),
    { onSuccess: (p) => !post && navigate(`/admin/posts/${p._id}`, { replace: true }) },
  )
  const remove = useAdminMutation(() => api(`/posts/admin/${post!._id}`, { method: 'DELETE' }), {
    success: t('admin.deleted'),
    onSuccess: () => navigate('/admin/posts'),
  })

  const onSubmit = handleSubmit((v) => {
    const body = { ...v, coverImage: v.coverImage || undefined }
    save.mutate(body, {
      onError: (e) => {
        if (e instanceof ApiError && e.fields) for (const [f, c] of Object.entries(e.fields)) setError(f as keyof PostForm, { message: c[0] })
      },
    })
  })

  return (
    <>
      <AdminPageHeader
        title={post ? t('admin.edit') : t('admin.newPost')}
        actions={
          <>
            {post?.status === 'published' && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/news/${post.slug}`} target="_blank">
                  {t('admin.viewSite')}
                </Link>
              </Button>
            )}
            {post && <DeleteButton onConfirm={() => remove.mutate(undefined)} />}
          </>
        }
      />
      <Card>
        <CardContent>
          <form onSubmit={onSubmit} noValidate className="grid gap-6">
            <LocalizedField register={register} errors={errors} name="title" label={t('admin.titleField')} />
            <LocalizedField register={register} errors={errors} name="excerpt" label={t('admin.excerpt')} multiline rows={2} />
            <LocalizedField register={register} errors={errors} name="content" label={t('admin.content')} multiline rows={12} />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField register={register} name="slug" label={t('admin.slug')} error={errors.slug} dir="ltr" placeholder="my-news-post" />
              <TextField register={register} name="coverImage" label={t('admin.coverImage')} error={errors.coverImage} dir="ltr" optional placeholder="https://" />
              <SelectField
                control={control}
                name="category"
                label={t('admin.category')}
                error={errors.category}
                options={postCategories.map((c) => ({ value: c, label: t(`news.categories.${c}`) }))}
              />
              <SelectField
                control={control}
                name="status"
                label={t('admin.status')}
                error={errors.status}
                options={(['draft', 'published'] as const).map((s) => ({ value: s, label: t(`admin.statuses.${s}`) }))}
              />
              <TextField register={register} name="publishedAt" label={t('admin.publishedAt')} error={errors.publishedAt as never} type="date" optional />
            </div>
            <div>
              <Button type="submit" disabled={save.isPending}>
                {t('admin.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
