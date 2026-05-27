import "server-only";
import type { ZodError } from "zod";
import { getTranslations } from "next-intl/server";

/**
 * Translate the first Zod issue message into the active locale.
 * The schema's error messages should be translation keys (e.g. "validation.emailInvalid").
 * Falls back to a generic invalid-input message if the key is missing or empty.
 */
export async function translateZodIssue<T>(
  error: ZodError<T>,
): Promise<string> {
  const t = await getTranslations("validation");
  const raw = error.issues[0]?.message ?? "";
  // Only attempt translation when the message looks like a key under the
  // `validation` namespace; otherwise pass it through untouched.
  if (raw.startsWith("validation.")) {
    const key = raw.slice("validation.".length);
    try {
      return t(key);
    } catch {
      return t("invalidInput");
    }
  }
  if (raw) return raw;
  return t("invalidInput");
}
