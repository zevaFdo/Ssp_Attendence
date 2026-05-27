import { getTranslations } from "next-intl/server";
import { RequestForm } from "@/components/requests/RequestForm";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("requests.metaNew") };
}

export default async function NewRequestPage() {
  const t = await getTranslations("requests");
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("newPageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("newPageSubtitle")}</p>
      </div>
      <RequestForm />
    </div>
  );
}
