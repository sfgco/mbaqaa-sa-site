/**
 * Client for the shared upload service (VITE_API_UPLOAD):
 *   POST {VITE_API_UPLOAD}?project=mbaqaa   header x-api-key: {VITE_API_UPLOAD_KEY}
 *   → { project, uploaded: [{ originalName, key, url, size, contentType }], failed: [] }
 *
 * Note: VITE_* values are baked into the public JS bundle, so this key is visible to anyone.
 */
const UPLOAD_URL =
  (import.meta.env.VITE_API_UPLOAD as string | undefined)?.trim() ?? "";
const UPLOAD_KEY =
  (import.meta.env.VITE_API_UPLOAD_KEY as string | undefined)?.trim() ?? "";
const UPLOAD_PROJECT = "mbaqaa";

const uploadEndpoint = () =>
  `${UPLOAD_URL}${UPLOAD_URL.includes("?") ? "&" : "?"}project=${UPLOAD_PROJECT}`;

type UploadResponse = {
  project?: string;
  uploaded?: {
    originalName?: string;
    key?: string;
    url?: string;
    size?: number;
    contentType?: string;
  }[];
  failed?: unknown[];
};

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
  const body = new FormData();
  body.append(
    "file",
    file,
    opts.filename ?? (file instanceof File ? file.name : "file"),
  );

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadEndpoint());
    if (UPLOAD_KEY) xhr.setRequestHeader("x-api-key", UPLOAD_KEY);
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
        const data = JSON.parse(xhr.responseText) as UploadResponse;
        const url = data.uploaded?.[0]?.url;
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
 * Uploads several files in one request (multipart field `images`). No progress
 * events; use `uploadFile` for single files with progress.
 */
export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  if (!UPLOAD_URL) throw new UploadError("NOT_CONFIGURED");
  const form = new FormData();
  for (const file of files) form.append("images", file);
  let response: Response;
  try {
    response = await fetch(uploadEndpoint(), {
      method: "POST",
      body: form,
      headers: UPLOAD_KEY ? { "x-api-key": UPLOAD_KEY } : undefined,
    });
  } catch {
    throw new UploadError("FAILED");
  }
  if (!response.ok)
    throw new UploadError(response.status === 413 ? "TOO_LARGE" : "FAILED");
  const body = (await response.json()) as UploadResponse;
  return (body.uploaded ?? []).flatMap((f) =>
    f.url ? [{ url: f.url, contentType: f.contentType ?? "" }] : [],
  );
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
