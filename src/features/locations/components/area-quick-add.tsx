"use client";

import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { areaSchema } from "@/features/locations/schemas/location-schemas";
import { useSaveArea } from "@/features/locations/hooks/use-save-area";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/utils/api";
import type { IAreaQuickAddProps } from "@/features/locations/types/location-components";

// Type a name, press Enter, repeat — the fastest way to give a city many areas
export const AreaQuickAdd = ({ city }: IAreaQuickAddProps) => {
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { mutate, isPending } = useSaveArea();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = areaSchema.safeParse({ cityId: city.id, name: name.trim(), status: true });

    if (!parsed.success) {
      setFieldError(t(`errors.${parsed.error.issues[0]?.message ?? "areaNameLength"}`));
      return;
    }

    mutate(
      { payload: parsed.data },
      {
        onSuccess: (saved) => {
          showToast(t("areas.created", { name: saved.name, city: saved.cityName }));
          setName("");
          inputRef.current?.focus();
        },
        onError: (mutationError) =>
          setFieldError(getApiErrorMessage(mutationError, tCommon("error"))),
      },
    );
  };

  if (!city.status) {
    return (
      <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-soft-foreground">
        {t("areas.cityInactive", { city: city.name })}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-1.5">
      <label htmlFor="quick-area-name" className="text-sm font-medium">
        {t("areas.quickAddLabel", { city: city.name })}
      </label>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Input
            ref={inputRef}
            id="quick-area-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setFieldError(null);
            }}
            placeholder={t("areas.quickAddPlaceholder")}
            hasError={fieldError !== null}
            disabled={isPending}
            aria-describedby="quick-area-hint"
          />
        </div>
        <Button type="submit" className="h-11 shrink-0" isLoading={isPending}>
          {isPending ? null : <Plus className="h-4 w-4" aria-hidden />}
          {t("areas.add")}
        </Button>
      </div>
      <p
        id="quick-area-hint"
        className={fieldError ? "text-xs text-danger" : "text-xs text-muted-foreground"}
      >
        {fieldError ?? t("areas.quickAddHint")}
      </p>
    </form>
  );
};
