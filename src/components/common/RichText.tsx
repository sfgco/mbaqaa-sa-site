import { cn } from '@/lib/utils'

/** Renders CMS HTML. Content is sanitized server-side on every write (sanitize-html allow-list). */
export function RichText({ html, className }: { html: string; className?: string }) {
  return <div className={cn('prose-content', className)} dangerouslySetInnerHTML={{ __html: html }} />
}
