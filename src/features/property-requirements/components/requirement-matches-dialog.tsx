"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Home } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StepSlider } from "@/components/ui/step-slider";
import { DEFAULT_PAGE_SIZE } from "@/config/pagination";
import { DEFAULT_MATCH_LEVEL, MATCH_LEVELS } from "@/config/property";
import { PropertySummaryList } from "@/features/properties/components/property-summary-list";
import { useMatchRequirement } from "@/features/property-requirements/hooks/use-match-requirement";
import { useRequirementMatches } from "@/features/property-requirements/hooks/use-requirement-matches";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import type { IProperty, TMatchLevel } from "@/types/property";
import type { IRequirementMatchesDialogProps } from "@/features/property-requirements/types/property-requirement-components";

export const RequirementMatchesDialog = ({
  requirement,
  onClose,
}: IRequirementMatchesDialogProps) => {
  const t = useTranslations("requirements");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  // The parent keys this dialog by requirement, so each one starts on page 1
  const [page, setPage] = useState(1);
  const [matchLevel, setMatchLevel] = useState<TMatchLevel>(DEFAULT_MATCH_LEVEL);
  const [chosenProperty, setChosenProperty] = useState<IProperty | null>(null);

  const { data, isPending, isError, error } = useRequirementMatches(requirement?.id, {
    page,
    limit: DEFAULT_PAGE_SIZE,
    matchLevel,
  });

  // Loosest on the left, strictest on the right
  const matchLevelOptions = [...MATCH_LEVELS].reverse().map((level) => ({
    value: String(level),
    label: `${level}%`,
  }));

  // A different level changes the result set, so start again from page 1
  const handleMatchLevelChange = (value: string) => {
    const level = MATCH_LEVELS.find((option) => String(option) === value);
    if (level === undefined) return;
    setMatchLevel(level);
    setPage(1);
  };

  const { mutate: matchRequirement, isPending: isMatching } = useMatchRequirement();

  const canChoose = Boolean(requirement?.status && !requirement.matchedPropertyId);
  const closingStatus = requirement ? t(`closingStatuses.${requirement.purpose}`) : "";

  const handleConfirmChoice = () => {
    if (!requirement || !chosenProperty) return;

    matchRequirement(
      { id: requirement.id, propertyId: chosenProperty.id },
      {
        onSuccess: (updated) => {
          showToast(
            t("propertyChosen", {
              property: chosenProperty.title,
              status: closingStatus,
              name: updated.contactName,
            }),
          );
          onClose();
        },
        onError: (mutationError) =>
          showToast(getApiErrorMessage(mutationError, tCommon("error")), "danger"),
      },
    );
  };

  const renderChooseAction = (property: IProperty) => (
    <Button size="sm" variant="soft" onClick={() => setChosenProperty(property)}>
      <CheckCircle2 className="h-4 w-4" aria-hidden />
      {t("choose")}
    </Button>
  );

  return (
    <Modal
      isOpen={requirement !== null}
      title={t("matchesTitle", { name: requirement?.contactName ?? "" })}
      headerContent={
        chosenProperty ? null : (
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">{t("matchLevel")}</span>
              <span className="truncate text-muted-foreground">
                {t(`matchLevels.${matchLevel}`)}
              </span>
            </div>
            <StepSlider
              value={String(matchLevel)}
              onChange={handleMatchLevelChange}
              options={matchLevelOptions}
              aria-label={t("matchLevel")}
            />
          </div>
        )
      }
      size="lg"
      onClose={onClose}
      footer={
        chosenProperty ? (
          <>
            <Button
              variant="outline"
              onClick={() => setChosenProperty(null)}
              disabled={isMatching}
            >
              {t("backToMatches")}
            </Button>
            <Button onClick={handleConfirmChoice} isLoading={isMatching}>
              {t("confirmChoice", { status: closingStatus })}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            {tCommon("close")}
          </Button>
        )
      }
    >
      {chosenProperty ? (
        <p className="text-sm text-muted-foreground">
          {t("chooseConfirm", {
            property: chosenProperty.title,
            status: closingStatus,
            name: requirement?.contactName ?? "",
          })}
        </p>
      ) : (
        <div className="space-y-4">
          {requirement?.matchedPropertyTitle ? (
            <Alert variant="success">
              {t("alreadyChosen", { property: requirement.matchedPropertyTitle })}
            </Alert>
          ) : null}

          {requirement && !requirement.status ? (
            <Alert variant="info">{t("chooseNeedsActive")}</Alert>
          ) : null}

          {isPending ? <Skeleton className="h-48" /> : null}

          {isError ? <Alert>{getApiErrorMessage(error, tCommon("error"))}</Alert> : null}

          {data && data.items.length === 0 ? (
            <EmptyState
              title={t("noMatchesTitle")}
              description={t("noMatchesSubtitle")}
              icon={<Home className="h-6 w-6" aria-hidden />}
            />
          ) : null}

          {data && data.items.length > 0 ? (
            <div className="space-y-4">
              <PropertySummaryList
                properties={data.items}
                renderAction={canChoose ? renderChooseAction : undefined}
              />
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
};
