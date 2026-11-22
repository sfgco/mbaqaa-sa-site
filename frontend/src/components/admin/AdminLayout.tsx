import { FileQuestion, FileText, Images, Globe, HandCoins, Handshake, Inbox, LayoutDashboard, Landmark, LogOut, Menu, Newspaper, Settings, Shirt, Users, UserRoundPlus, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useLogout, useMe } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/requests/clothes', key: 'clothes', icon: Shirt },
  { to: '/admin/requests/volunteer', key: 'volunteer', icon: UserRoundPlus },
  { to: '/admin/requests/partnership', key: 'partnership', icon: Handshake },
  { to: '/admin/contact', key: 'contact', icon: Inbox },
  { to: '/admin/donations', key: 'donations', icon: HandCoins, admin: true },
  { to: '/admin/channels', key: 'channels', icon: Landmark, admin: true },
  { to: '/admin/posts', key: 'posts', icon: Newspaper },
  { to: '/admin/documents', key: 'documents', icon: FileText },
  { to: '/admin/albums', key: 'albums', icon: Images },
  { to: '/admin/faqs', key: 'faqs', icon: FileQuestion },
  { to: '/admin/settings', key: 'settings', icon: Settings, admin: true },
  { to: '/admin/users', key: 'users', icon: Users, admin: true },
] as const

function Nav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation()
  return (
    <nav className="flex flex-col gap-1" onClick={onNavigate}>
      {links
        .filter((l) => !('admin' in l) || isAdmin)
        .map(({ to, key, icon: Icon, ...l }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in l}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60',
              )
            }
          >
            <Icon className="size-4" />
            {t(`admin.${key}`)}
          </NavLink>
        ))}
    </nav>
  )
}

export function AdminLayout() {
  const { t } = useTranslation()
  const { toggle } = useLang()
  const { data: user, isLoading } = useMe()
  const logout = useLogout()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (isLoading) return <Skeleton className="m-8 h-96" />
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  const isAdmin = user.role === 'admin'

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-e bg-sidebar p-4 md:flex">
        <Link to="/admin" className="mb-6 flex items-center gap-2 px-2">
          <img src="/logo.jpg" alt="" className="h-10 w-auto mix-blend-multiply" />
        </Link>
        <Nav isAdmin={isAdmin} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('nav.menu')}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-sidebar">
              <SheetHeader>
                <SheetTitle>{t('admin.title')}</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <Nav isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-primary">{t('admin.title')}</span>
          <div className="ms-auto flex items-center gap-1">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <Button asChild variant="ghost" size="sm">
              <Link to="/" target="_blank">
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">{t('admin.viewSite')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={toggle} aria-label={t('meta.switchLang')}>
              <Globe className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t('admin.logout')}</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  )
}

/** Wraps admin-only pages; editors see the dashboard instead. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { data: user } = useMe()
  if (user?.role !== 'admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}
