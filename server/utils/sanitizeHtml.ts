import sanitize from 'sanitize-html'

/** Allow-list sanitizer for rich text (TipTap output). Run on every write. */
export function sanitizeHtml(html: string): string {
  return sanitize(html ?? '', {
    allowedTags: [
      'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'ul', 'ol', 'li',
      'a', 'img', 'hr', 'code', 'pre', 'span', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      '*': ['dir'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    transformTags: {
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }),
      img: sanitize.simpleTransform('img', { loading: 'lazy' }),
    },
  })
}

/** Sanitize both languages of a localized HTML field. */
export function sanitizeLocalized(v: { ar?: string; en?: string } | undefined) {
  if (!v) return v
  return { ar: sanitizeHtml(v.ar ?? ''), en: sanitizeHtml(v.en ?? '') }
}
