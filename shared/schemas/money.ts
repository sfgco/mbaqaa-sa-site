/** Money helpers. All amounts are stored as integer halalas (1 SAR = 100). */

/** Parse a user-entered SAR amount ("150", "150.5", "1,250.75", Arabic digits) into halalas without floats. */
export function sarToHalalas(input: string | number): number | null {
  const s = String(input)
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[,٬\s]/g, '')
    .replace('٫', '.')
  const m = s.match(/^(\d{1,9})(?:\.(\d{1,2}))?$/)
  if (!m) return null
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'))
}

export function formatMoney(halalas: number, locale = 'ar-SA', currency = 'SAR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(halalas / 100)
}
