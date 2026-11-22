import { Globe, Menu } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/utils'
import { involveLinks, mainLinks } from './links'
import { Logo } from './Logo'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-foreground/80')

export function SiteHeader() {
  const { t } = useTranslation()
  const { toggle } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-18 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ms-4 hidden items-center gap-1 lg:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary">
              {t('nav.getInvolved')}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {involveLinks.map((l) => (
                <DropdownMenuItem key={l.to} asChild>
                  <Link to={l.to}>{t(`nav.${l.key}`)}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} aria-label={t('meta.switchLang')}>
            <Globe className="size-4" />
            <span className="hidden sm:inline">{t('meta.switchLang')}</span>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/donate">{t('nav.donate')}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label={t('nav.menu')}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t('nav.menu')}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6" onClick={() => setOpen(false)}>
                {mainLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                    {t(`nav.${l.key}`)}
                  </NavLink>
                ))}
                <p className="mt-4 px-3 text-xs font-semibold text-muted-foreground">{t('nav.getInvolved')}</p>
                {involveLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} end className={linkClass}>
                    {t(`nav.${l.key}`)}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
