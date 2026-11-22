import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'
import { useLang } from '@/hooks/useLang'

/** <Link> that keeps the current language prefix (/en). External URLs render as <a>. */
export function LocaleLink({ to, ...props }: Omit<LinkProps, 'to'> & { to: string }) {
  const { to: loc } = useLang()
  if (/^https?:\/\//.test(to)) return <a href={to} target="_blank" rel="noopener noreferrer" {...props} />
  return <Link to={loc(to)} {...props} />
}

export function LocaleNavLink({ to, ...props }: Omit<NavLinkProps, 'to'> & { to: string }) {
  const { to: loc } = useLang()
  return <NavLink to={loc(to)} {...props} />
}
