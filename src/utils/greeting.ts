import type { TDayPeriod } from "@/types/greeting";

export const getDayPeriod = (date: Date = new Date()): TDayPeriod => {
  const hour = date.getHours();

  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";

  return "evening";
};
