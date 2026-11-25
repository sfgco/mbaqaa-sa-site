import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { imageSize } from "@/lib/pdf";
import { MB, uploadFile, UploadError } from "@/lib/upload";

export const PDF_MAX_MB = 20;
export const IMAGE_MAX_MB = 10;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function useUploadErrors() {
  const { t } = useTranslation();
  return (e: unknown) => {
    if (e instanceof UploadError && e.code === "NOT_CONFIGURED")
      return t("admin.uploadsOff");
    if (e instanceof UploadError && e.code === "TOO_LARGE")
      return t("admin.tooLarge", { mb: PDF_MAX_MB });
    return t("admin.uploadFailed");
  };
}

export function checkImage(file: File, t: TFunction) {
  if (!IMAGE_TYPES.includes(file.type)) return t("admin.onlyImages");
  if (file.size > IMAGE_MAX_MB * MB)
    return t("admin.tooLarge", { mb: IMAGE_MAX_MB });
  return null;
}

/** Uploads several images one by one and reports the results. */
export function useMultiImageUpload() {
  const { t } = useTranslation();
  const uploadError = useUploadErrors();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    pct: number;
  } | null>(null);

  async function upload(files: File[]) {
    const ok: { url: string; width?: number; height?: number }[] = [];
    const valid = files.filter((f) => {
      const problem = checkImage(f, t);
      if (problem) toast.error(`${f.name}: ${problem}`);
      return !problem;
    });
    for (const [i, file] of valid.entries()) {
      setProgress({ done: i, total: valid.length, pct: 0 });
      try {
        const [url, size] = await Promise.all([
          uploadFile(file, {
            onProgress: (pct) =>
              setProgress({ done: i, total: valid.length, pct }),
          }),
          imageSize(file),
        ]);
        ok.push({ url, ...size });
      } catch (e) {
        toast.error(`${file.name}: ${uploadError(e)}`);
      }
    }
    setProgress(null);
    return ok;
  }

  return { upload, progress };
}
