import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Clock } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: `${t("auth.signIn")} · ${t("common.appName")}` };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher variant="compact" />
      </div>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">{t("welcomeBack")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("signInPrompt")}
        </p>
      </div>
      <LoginForm next={next} />
    </div>
  );
}
