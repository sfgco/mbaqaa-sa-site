/** Mongoose sub-schema definition for `{ ar, en }` localized text. */
export const localizedField = (required = false) => ({
  ar: { type: String, default: '', ...(required ? { required: true } : {}) },
  en: { type: String, default: '' },
})
