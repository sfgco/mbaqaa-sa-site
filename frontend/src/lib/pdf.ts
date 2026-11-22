/** Reads a PDF in the browser: page count + page 1 rendered as a JPEG thumbnail. Loaded only in the dashboard. */
export async function inspectPdf(file: File, width = 600): Promise<{ pages: number; thumbnail: Blob | null }> {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  try {
    const doc = await task.promise
    const page = await doc.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: width / base.width })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({ canvas, viewport, background: '#ffffff' }).promise
    const thumbnail = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.82))
    return { pages: doc.numPages, thumbnail }
  } finally {
    await task.destroy()
  }
}

/** Reads image dimensions (best effort). */
export function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve({})
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}
