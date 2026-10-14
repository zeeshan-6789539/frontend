import { facilityKeys } from "@/features/facilities/api/facility-keys";
import { createFacility } from "@/features/facilities/api/facilities.api";
import { facilitySchema } from "@/features/facilities/schemas/facility-schema";
import { createArea } from "@/features/locations/api/areas.api";
import { createCity } from "@/features/locations/api/cities.api";
import { areaKeys, cityKeys } from "@/features/locations/api/location-keys";
import { areaSchema, citySchema } from "@/features/locations/schemas/location-schemas";
import { propertyTypeKeys } from "@/features/property-types/api/property-type-keys";
import { createPropertyType } from "@/features/property-types/api/property-types.api";
import { propertyTypeSchema } from "@/features/property-types/schemas/property-type-schema";
import { getText } from "@/features/voice-assistant/forms/form-values";
import type { IAreaPayload } from "@/types/area";
import type { ICityPayload } from "@/types/city";
import type { IFacilityPayload } from "@/types/facility";
import type { IPropertyTypePayload } from "@/types/property-type";
import type { IAssistantFormDef } from "@/types/voice-assistant";

export const cityForm: IAssistantFormDef<ICityPayload> = {
  type: "city",
  titleKey: "assistant.forms.city",
  errorsKey: "locations.errors",
  listPath: "/locations",
  schema: citySchema,
  defaults: { name: "" },
  fields: [{ key: "name", labelKey: "locations.fields.cityName", kind: "text", required: true }],
  toPayload: (values) => ({ name: getText(values, "name").trim(), status: true }),
  submit: async (payload) => {
    const city = await createCity(payload);
    return { id: city.id, label: city.name };
  },
  invalidates: [cityKeys.all],
};

export const areaForm: IAssistantFormDef<IAreaPayload> = {
  type: "area",
  titleKey: "assistant.forms.area",
  errorsKey: "locations.errors",
  listPath: "/locations",
  schema: areaSchema,
  defaults: { cityId: "", name: "" },
  fields: [
    {
      key: "cityId",
      labelKey: "locations.fields.city",
      kind: "select",
      required: true,
      source: "cities",
      createWith: "city",
    },
    { key: "name", labelKey: "locations.fields.areaName", kind: "text", required: true },
  ],
  toPayload: (values) => ({
    cityId: getText(values, "cityId"),
    name: getText(values, "name").trim(),
    status: true,
  }),
  submit: async (payload) => {
    const area = await createArea(payload);
    return { id: area.id, label: area.name };
  },
  invalidates: [areaKeys.all, cityKeys.all],
};

export const propertyTypeForm: IAssistantFormDef<IPropertyTypePayload> = {
  type: "propertyType",
  titleKey: "assistant.forms.propertyType",
  errorsKey: "propertyTypes.errors",
  listPath: "/property-types",
  schema: propertyTypeSchema,
  defaults: { name: "" },
  fields: [{ key: "name", labelKey: "propertyTypes.fields.name", kind: "text", required: true }],
  toPayload: (values) => ({ name: getText(values, "name").trim(), status: true }),
  submit: async (payload) => {
    const propertyType = await createPropertyType(payload);
    return { id: propertyType.id, label: propertyType.name };
  },
  invalidates: [propertyTypeKeys.all],
};

export const facilityForm: IAssistantFormDef<IFacilityPayload> = {
  type: "facility",
  titleKey: "assistant.forms.facility",
  errorsKey: "facilities.errors",
  listPath: "/facilities",
  schema: facilitySchema,
  defaults: { name: "" },
  fields: [{ key: "name", labelKey: "facilities.fields.name", kind: "text", required: true }],
  toPayload: (values) => ({ name: getText(values, "name").trim(), status: true }),
  submit: async (payload) => {
    const facility = await createFacility(payload);
    return { id: facility.id, label: facility.name };
  },
  invalidates: [facilityKeys.all],
};
