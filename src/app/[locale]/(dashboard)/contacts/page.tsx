import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DealerOnly } from "@/components/layout/dealer-only";
import { ContactsView } from "@/features/contacts/components/contacts-view";

export const generateMetadata = async ({
  params,
}: PageProps<"/[locale]/contacts">): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacts" });

  return { title: t("title") };
};

const ContactsPage = async ({ params }: PageProps<"/[locale]/contacts">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DealerOnly>
      <ContactsView />
    </DealerOnly>
  );
};

export default ContactsPage;
