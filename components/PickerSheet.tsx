import { useState, useMemo } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";

export type PickerConfig = {
  key: string;
  title: string;
  options: string[];
};

export function PickerSheet({
  config,
  value,
  onPick,
  onClose,
}: {
  config: PickerConfig | null;
  value?: string | null;
  onPick: (val: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const visible = !!config;

  const filtered = useMemo(() => {
    if (!config) return [];
    if (!search) return config.options;
    const q = search.toLowerCase();
    return config.options.filter((o) => o.toLowerCase().includes(q));
  }, [config, search]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={() => setSearch("")}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(26,20,16,0.35)" }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-bg rounded-t-[24px] pb-6"
          style={{ maxHeight: "78%" }}
        >
          <View className="p-5 pb-2.5">
            <View className="w-10 h-1 rounded-sm bg-border self-center mb-3.5" />
            <Text className="text-[17px] font-poppins-bold mb-3 text-fg">{config?.title}</Text>
            <View className="relative justify-center">
              <View className="absolute left-3.5 z-10">
                <Icon name="search" size={16} color={colors.fgSoft} />
              </View>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher..."
                placeholderTextColor={colors.fgSoft}
                className="h-11 pl-10 pr-3.5 rounded-[14px] border-[1.5px] border-border bg-card text-sm text-fg"
              />
            </View>
          </View>
          <ScrollView className="px-3" keyboardShouldPersistTaps="handled">
            {filtered.map((o) => (
              <Pressable
                key={o}
                onPress={() => onPick(o)}
                className={`py-3 px-3 rounded-[10px] flex-row items-center justify-between gap-2 ${
                  value === o ? "bg-primary-soft" : ""
                }`}
              >
                <Text className="text-sm text-fg flex-1">{o}</Text>
                {value === o ? <Icon name="check" size={16} color={colors.primaryDark} /> : null}
              </Pressable>
            ))}
            {filtered.length === 0 ? (
              <Text className="text-center text-fg-soft text-[13px] p-6">Aucun résultat.</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
