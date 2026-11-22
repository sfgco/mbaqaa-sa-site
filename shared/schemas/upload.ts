import { z } from 'zod'

export const uploadKinds = ['image', 'pdf', 'receipt'] as const
export const uploadSignSchema = z.object({ kind: z.enum(uploadKinds) })
export type UploadKind = (typeof uploadKinds)[number]

/** What the server returns; the client posts the file + these fields to `uploadUrl`. */
export interface UploadSignature {
  uploadUrl: string
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  type: 'upload' | 'authenticated'
  resourceType: 'image' | 'auto'
  maxBytes: number
  allowedFormats: string[]
}
