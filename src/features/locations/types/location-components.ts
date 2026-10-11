import type { useCityBrowser } from "@/features/locations/hooks/use-city-browser";
import type { IArea } from "@/types/area";
import type { ICity } from "@/types/city";

export type TCityBrowser = ReturnType<typeof useCityBrowser>;

export interface ICitiesPanelProps {
  browser: TCityBrowser;
  selectedCityId: string | null;
  onSelect: (city: ICity) => void;
  onCreate: () => void;
  onEdit: (city: ICity) => void;
  onToggleStatus: (city: ICity) => void;
}

export interface IAreasPanelProps {
  city: ICity | null;
  onCreateCity: () => void;
}

export interface IAreaQuickAddProps {
  city: ICity;
}

export interface IAreaListProps {
  areas: readonly IArea[];
  onEdit: (area: IArea) => void;
  onToggleStatus: (area: IArea) => void;
}

export interface ICityFormDialogProps {
  isOpen: boolean;
  city: ICity | null;
  onClose: () => void;
}

export interface IAreaFormDialogProps {
  area: IArea | null;
  onClose: () => void;
}
