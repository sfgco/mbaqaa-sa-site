export { DEFAULT_NAV } from '@shared/defaults'

export const REQUEST_TYPES = ['contact', 'clothes', 'volunteer', 'partnership'] as const
export type AdminRequestType = (typeof REQUEST_TYPES)[number]
