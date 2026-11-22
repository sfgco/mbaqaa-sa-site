import type { ReactNode } from 'react'

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary to-background">
      <Swirl className="pointer-events-none absolute -top-24 -end-24 size-80 opacity-15" />
      <div className="container relative mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

/** Decorative arcs inspired by the logo mark. */
export function Swirl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path d="M100 10a90 90 0 1 1-89 104" fill="none" stroke="var(--brand-mint)" strokeWidth="18" strokeLinecap="round" />
      <path d="M100 40a60 60 0 1 0 60 60" fill="none" stroke="var(--brand-blue)" strokeWidth="18" strokeLinecap="round" />
    </svg>
  )
}

export function Section({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`container mx-auto max-w-6xl px-4 py-12 md:py-16 ${className}`}>
      {title && <h2 className="mb-8 text-2xl font-bold text-primary md:text-3xl">{title}</h2>}
      {children}
    </section>
  )
}
