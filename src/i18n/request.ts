import { getRequestConfig } from "next-intl/server";
import { resolveRequestLocale } from "./locale";

export default getRequestConfig(async () => {
  const locale = await resolveRequestLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return {
    locale,
    messages,
  };
});
