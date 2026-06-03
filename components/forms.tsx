import { ReactNode } from "react";
import { View, Text, TextInput, Pressable, KeyboardTypeOptions } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <Text className="text-[13px] font-poppins-medium text-fg-muted mb-1.5">{children}</Text>;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
  autoCapitalize = "sentences",
  editable = true,
  autoFocus,
  multiline,
  maxLength,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  icon?: ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View className="mb-3.5">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View className="relative justify-center">
        {icon ? <View className={`absolute left-4 z-10 ${multiline ? "top-4" : ""}`}>{icon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.fgSoft}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          autoFocus={autoFocus}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? "top" : "center"}
          className={`rounded-[14px] border-[1.5px] border-border text-[15px] text-fg ${
            multiline ? "min-h-[112px] py-3.5" : "h-14"
          } ${editable ? "bg-card" : "bg-bg-soft"} ${icon ? "pl-11 pr-[18px]" : "px-[18px]"}`}
        />
      </View>
    </View>
  );
}

export function SelectField({
  label,
  value,
  placeholder,
  onPress,
  disabled,
}: {
  label?: string;
  value?: string | null;
  placeholder?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View className="mb-3.5">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Pressable
        onPress={disabled ? undefined : onPress}
        className={`h-[52px] px-4 rounded-[14px] border-[1.5px] border-border flex-row items-center justify-between gap-2 ${
          disabled ? "bg-bg-soft" : "bg-card"
        }`}
      >
        <Text numberOfLines={1} className={`flex-1 text-sm ${value ? "text-fg" : "text-fg-soft"}`}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.fgSoft} />
      </Pressable>
    </View>
  );
}
