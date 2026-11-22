/** Typed access to env vars. Never log these values. */
function str(name: string, fallback = ''): string {
  return process.env[name] ?? fallback
}

export const env = {
  get MONGODB_URI() {
    return str('MONGODB_URI')
  },
  get MONGODB_DB() {
    return str('MONGODB_DB', 'site')
  },
  get JWT_SECRET() {
    const v = str('JWT_SECRET')
    if (!v && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required')
    return v || 'dev-only-insecure-secret'
  },
  get JWT_EXPIRES_IN() {
    return str('JWT_EXPIRES_IN', '7d')
  },
  get APP_URL() {
    return str('APP_URL', 'http://localhost:3000')
  },
  get CLOUDINARY_CLOUD_NAME() {
    return str('CLOUDINARY_CLOUD_NAME')
  },
  get CLOUDINARY_API_KEY() {
    return str('CLOUDINARY_API_KEY')
  },
  get CLOUDINARY_API_SECRET() {
    return str('CLOUDINARY_API_SECRET')
  },
  get CURRENCY() {
    return str('CURRENCY', 'SAR')
  },
  get MAX_PDF_SIZE_MB() {
    return Number(str('MAX_PDF_SIZE_MB', '20'))
  },
  get MAX_RECEIPT_SIZE_MB() {
    return Number(str('MAX_RECEIPT_SIZE_MB', '5'))
  },
  get RESEND_API_KEY() {
    return str('RESEND_API_KEY')
  },
  get MAIL_FROM() {
    return str('MAIL_FROM', 'noreply@mbaqaa.org')
  },
  get ADMIN_NOTIFY_EMAIL() {
    return str('ADMIN_NOTIFY_EMAIL')
  },
  get isProd() {
    return process.env.NODE_ENV === 'production'
  },
}
