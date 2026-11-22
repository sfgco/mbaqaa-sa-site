import type { UploadKind, UploadSignature } from '@shared/schemas/upload'
import { apiPost } from './api'

export interface UploadedFile {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
  format: string
  pages: number
  resourceType: 'image' | 'raw'
}

export class UploadError extends Error {
  constructor(public code: 'too_large' | 'bad_type' | 'failed' | 'not_configured') {
    super(code)
  }
}

/** Signed direct upload to Cloudinary with progress. Validates type/size before sending. */
export async function uploadFile(file: File, kind: UploadKind, onProgress?: (pct: number) => void): Promise<UploadedFile> {
  let sig: UploadSignature
  try {
    sig = await apiPost<UploadSignature>('/uploads/sign', { kind })
  } catch (e) {
    if ((e as { code?: string }).code === 'UPLOADS_NOT_CONFIGURED') throw new UploadError('not_configured')
    throw e
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!sig.allowedFormats.includes(ext)) throw new UploadError('bad_type')
  if (file.size > sig.maxBytes) throw new UploadError('too_large')

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('signature', sig.signature)
  form.append('folder', sig.folder)
  form.append('type', sig.type)
  form.append('allowed_formats', sig.allowedFormats.join(','))

  const res = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', sig.uploadUrl)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new UploadError('failed')))
    xhr.onerror = () => reject(new UploadError('failed'))
    xhr.send(form)
  })
  return {
    url: String(res.secure_url),
    publicId: String(res.public_id),
    width: Number(res.width ?? 0),
    height: Number(res.height ?? 0),
    bytes: Number(res.bytes ?? file.size),
    format: String(res.format ?? ext),
    pages: Number(res.pages ?? 0),
    resourceType: res.resource_type === 'raw' ? 'raw' : 'image',
  }
}
