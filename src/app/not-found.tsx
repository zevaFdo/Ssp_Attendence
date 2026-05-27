import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-primary">{t("code")}</p>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("body")}</p>
      <Button asChild>
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  );
}
