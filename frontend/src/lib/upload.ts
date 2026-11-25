/**
 * Client for the shared upload service (VITE_API_UPLOAD), the same one used by the taqoud.com projects:
 *   POST {VITE_API_UPLOAD}?path=<>   multipart field "file"
 *   → { files: [{ url }] } | { url } | { data: { url } }
 */
const UPLOAD_URL =
  (import.meta.env.VITE_API_UPLOAD as string | undefined)?.trim() ?? "";

export const uploadsConfigured = () => UPLOAD_URL !== "";

export class UploadError extends Error {
  code: "NOT_CONFIGURED" | "TOO_LARGE" | "BAD_TYPE" | "FAILED";
  constructor(code: UploadError["code"]) {
    super(code);
    this.code = code;
  }
}

export function uploadFile(
  file: Blob,
  opts: {
    filename?: string;
    onProgress?: (pct: number) => void;
    signal?: AbortSignal;
  } = {},
) {
  if (!UPLOAD_URL) return Promise.reject(new UploadError("NOT_CONFIGURED"));
  const sep = UPLOAD_URL.includes("?") ? "&" : "?";
  const body = new FormData();
  body.append(
    "file",
    file,
    opts.filename ?? (file instanceof File ? file.name : "file"),
  );

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${UPLOAD_URL}${sep}path=mbaqaa`);
    xhr.upload.onprogress = (e) =>
      e.lengthComputable &&
      opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => reject(new UploadError("FAILED"));
    xhr.onabort = () => reject(new UploadError("FAILED"));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300)
        return reject(
          new UploadError(xhr.status === 413 ? "TOO_LARGE" : "FAILED"),
        );
      try {
        const data = JSON.parse(xhr.responseText) as {
          files?: { url?: string }[];
          url?: string;
          data?: { url?: string };
        };
        const url = data.files?.[0]?.url ?? data.url ?? data.data?.url;
        return url ? resolve(url) : reject(new UploadError("FAILED"));
      } catch {
        reject(new UploadError("FAILED"));
      }
    };
    opts.signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(body);
  });
}

export type UploadedFile = { url: string; contentType: string };

export const FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];
export const DOCUMENT_TYPES = FILE_TYPES;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Uploads several files in one request (multipart field `images`, bare service URL),
 * matching the old dashboard's shared upload component. No progress events; use
 * `uploadFile` for single files with progress.
 */
export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  if (!UPLOAD_URL) throw new UploadError("NOT_CONFIGURED");
  const form = new FormData();
  for (const file of files) form.append("images", file);
  let response: Response;
  try {
    response = await fetch(UPLOAD_URL, { method: "POST", body: form });
  } catch {
    throw new UploadError("FAILED");
  }
  if (!response.ok)
    throw new UploadError(response.status === 413 ? "TOO_LARGE" : "FAILED");
  const body = (await response.json()) as { files?: UploadedFile[] };
  return body.files ?? [];
}

export const MB = 1024 * 1024;

export function formatBytes(bytes: number | undefined, lang: string) {
  if (!bytes) return "";
  const nf = new Intl.NumberFormat(lang === "en" ? "en" : "ar-SA-u-nu-latn", {
    maximumFractionDigits: 1,
  });
  if (bytes < MB)
    return `${nf.format(bytes / 1024)} ${lang === "en" ? "KB" : "ك.ب"}`;
  return `${nf.format(bytes / MB)} ${lang === "en" ? "MB" : "م.ب"}`;
}
