import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { House } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PoweredBy } from "@/components/layout/powered-by";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { LoginForm } from "@/features/auth/components/login-form";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return { title: t("title") };
};

const LoginPage = async ({ params }: PageProps<"/[locale]/login">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex w-full max-w-sm items-center justify-between">
        <span className="flex items-center gap-2.5 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-brand">
            <House className="h-5 w-5" aria-hidden />
          </span>
          {siteConfig.name}
        </span>

        <span className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </span>
      </div>

      <Card className="w-full max-w-sm p-6 shadow-lg sm:p-7">
        <div className="mb-6 space-y-1.5">
          <h1 className="text-brand-gradient w-fit text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle", { appName: siteConfig.name })}</p>
        </div>

        <LoginForm />
      </Card>

      <PoweredBy />
    </div>
  );
};

export default LoginPage;
