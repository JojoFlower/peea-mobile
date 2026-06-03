import React from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

// Curated icon set used across PEEA screens, mapping the prototype's lucide
// icons to their nearest @expo/vector-icons equivalents.
export type IconName =
  | "mail"
  | "search"
  | "bell"
  | "chevron-right"
  | "chevron-down"
  | "chevron-left"
  | "plus"
  | "check"
  | "user"
  | "graduation"
  | "briefcase"
  | "map-pin"
  | "phone"
  | "settings"
  | "log-out"
  | "share"
  | "badge"
  | "heart"
  | "message"
  | "bookmark"
  | "pin"
  | "clock"
  | "globe"
  | "newspaper"
  | "send"
  | "edit"
  | "x";

const FEATHER: Partial<Record<IconName, keyof typeof Feather.glyphMap>> = {
  mail: "mail",
  search: "search",
  bell: "bell",
  "chevron-right": "chevron-right",
  "chevron-down": "chevron-down",
  "chevron-left": "chevron-left",
  plus: "plus",
  check: "check",
  user: "user",
  briefcase: "briefcase",
  "map-pin": "map-pin",
  phone: "phone",
  settings: "settings",
  "log-out": "log-out",
  share: "share-2",
  heart: "heart",
  message: "message-circle",
  bookmark: "bookmark",
  clock: "clock",
  globe: "globe",
  send: "send",
  edit: "edit-2",
  x: "x",
};

const IONICONS: Partial<Record<IconName, keyof typeof Ionicons.glyphMap>> = {
  graduation: "school-outline",
  badge: "checkmark-circle",
  pin: "pin",
  newspaper: "newspaper-outline",
};

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
};

export function Icon({ name, size = 20, color = colors.fg, filled }: Props) {
  if (name === "heart" && filled) {
    return <Ionicons name="heart" size={size} color={color} />;
  }
  if (name === "bookmark" && filled) {
    return <Ionicons name="bookmark" size={size} color={color} />;
  }
  const ion = IONICONS[name];
  if (ion) return <Ionicons name={ion} size={size} color={color} />;
  const feather = FEATHER[name] ?? "circle";
  return <Feather name={feather} size={size} color={color} />;
}
