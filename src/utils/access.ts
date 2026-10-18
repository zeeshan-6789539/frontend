import { ASSISTANT_ROLES } from "@/config/assistant";
import type { INavItem } from "@/types/navigation";
import type { IUser } from "@/types/user";

// The backend also checks the company flag when it issues a voice session
export const canUseVoiceAssistant = (user: IUser | undefined): boolean =>
  user !== undefined &&
  ASSISTANT_ROLES.includes(user.role) &&
  user.voiceAssistantEnabled === true;

// A restricted item stays hidden until the user is known
export const isNavItemVisible = (item: INavItem, user: IUser | undefined): boolean =>
  !item.roles || (user !== undefined && item.roles.includes(user.role));
