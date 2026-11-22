import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import ar from '@/i18n/ar'
import en from '@/i18n/en'
import Contact from '@/pages/public/Contact'
import { ChannelCard } from '@/pages/public/Donate'
import { renderWithProviders } from './render'

function keys(o: object, prefix = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('i18n', () => {
  it('Arabic and English have the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(ar).sort())
  })
  it('sets dir on language change', async () => {
    await i18n.changeLanguage('en')
    expect(document.documentElement.dir).toBe('ltr')
    await i18n.changeLanguage('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })
})

describe('contact form', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows translated validation errors and does not submit', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
    renderWithProviders(<Contact />)
    await userEvent.type(screen.getByLabelText(ar.form.phone), '123')
    await userEvent.click(screen.getByRole('button', { name: ar.form.submit }))
    expect(await screen.findByText(ar.errors.invalid_phone)).toBeInTheDocument()
    expect(screen.getAllByText(ar.errors.required).length).toBeGreaterThan(0)
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/contact'))).toBe(false)
  })

  it('submits and shows the success message', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url.includes('/contact')
        ? new Response(JSON.stringify({ ok: true, id: 'x' }), { status: 201 })
        : new Response(JSON.stringify({ phone: '', whatsapp: '', email: '', address: { ar: '', en: '' }, workingHours: { ar: '', en: '' }, licenseNumber: '', mapUrl: '', social: {} }), { status: 200 }),
    )
    renderWithProviders(<Contact />)
    await userEvent.type(screen.getByLabelText(ar.form.name), 'سارة')
    await userEvent.type(screen.getByLabelText(ar.form.phone), '0512345678')
    await userEvent.type(screen.getByLabelText(ar.form.subject), 'استفسار')
    await userEvent.type(screen.getByLabelText(ar.form.message), 'مرحبا')
    await userEvent.click(screen.getByRole('button', { name: ar.form.submit }))
    await waitFor(() => expect(screen.getByText(ar.contact.success)).toBeInTheDocument())
    const [, init] = fetchMock.mock.calls.find(([url]) => String(url).includes('/contact'))!
    expect(JSON.parse(init.body)).toMatchObject({ name: 'سارة', phone: '0512345678' })
  })
})

describe('donation channel', () => {
  it('groups the IBAN for readability', () => {
    renderWithProviders(
      <ChannelCard
        channel={{ _id: '1', type: 'bank', title: { ar: 'تحويل', en: 'Transfer' }, iban: 'SA0000000000000000000000', active: true, order: 0 }}
      />,
    )
    expect(screen.getByText('SA00 0000 0000 0000 0000 0000')).toBeInTheDocument()
  })
})
