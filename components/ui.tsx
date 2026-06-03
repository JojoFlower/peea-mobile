import { ReactNode } from "react";
import { View, Text, Pressable, ActivityIndicator, ViewStyle } from "react-native";
import { colors } from "@/lib/theme";
import { fieldColor } from "@/lib/formOptions";
import { Icon } from "./Icon";

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  initials,
  bg,
  size = 44,
  radius,
  textColor = colors.fg,
}: {
  initials: string;
  bg: string;
  size?: number;
  radius?: number;
  textColor?: string;
}) {
  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: bg }}
    >
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: size * 0.36, color: textColor }}>{initials}</Text>
    </View>
  );
}

// ── Tag (pill) ───────────────────────────────────────────────────────────────
export function Tag({
  children,
  bg = colors.primarySoft,
  color = colors.accent,
  className,
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  className?: string;
}) {
  return (
    <View
      className={`self-start flex-row items-center gap-1.5 py-1.5 px-3 rounded-full ${className ?? ""}`}
      style={{ backgroundColor: bg }}
    >
      <Text className="text-xs font-poppins-medium" style={{ color }}>
        {children}
      </Text>
    </View>
  );
}

// ── FieldTag (domain chip with colour dot) ──────────────────────────────────
export function FieldTag({ field, small }: { field: string; small?: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-lg bg-bg border border-border-soft ${
        small ? "py-0.5 px-2" : "py-1 px-2.5"
      }`}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fieldColor(field) }} />
      <Text className={`${small ? "text-[10px]" : "text-[11px]"} font-poppins-medium text-fg-muted`}>{field}</Text>
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  style,
  onPress,
}: {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const classes = `bg-card border border-border-soft rounded-[18px] p-4 ${className ?? ""}`;
  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`active:opacity-90 ${classes}`} style={style}>
        {children}
      </Pressable>
    );
  }
  return (
    <View className={classes} style={style}>
      {children}
    </View>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
type BtnProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  className?: string;
};

export function PrimaryButton({ title, onPress, disabled, loading, iconLeft, className }: BtnProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`h-[52px] rounded-[14px] flex-row items-center justify-center gap-2 w-full active:scale-[0.98] ${
        isDisabled ? "bg-border" : "bg-primary"
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <>
          {iconLeft}
          <Text className={`font-poppins-semibold text-[15px] ${isDisabled ? "text-fg-soft" : "text-fg"}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function OutlineButton({ title, onPress, disabled, iconLeft, className }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-[52px] rounded-[14px] flex-row items-center justify-center gap-2 w-full border-[1.5px] border-border bg-transparent active:opacity-70 ${
        disabled ? "opacity-50" : ""
      } ${className ?? ""}`}
    >
      {iconLeft}
      <Text className="font-poppins-semibold text-[15px] text-fg">{title}</Text>
    </Pressable>
  );
}

// ── Section eyebrow heading ──────────────────────────────────────────────────
export function SectionEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Text className={`text-xs text-fg-soft uppercase font-poppins-semibold mb-2.5 tracking-wider ${className ?? ""}`}>
      {children}
    </Text>
  );
}

export function Divider() {
  return <View className="h-px w-full bg-border-soft" />;
}

export { Icon };
