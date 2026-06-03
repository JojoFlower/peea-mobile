import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Modal, ScrollView } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";
import { FieldLabel } from "./forms";
import { DIAL_OPTIONS, DEFAULT_CCA2, optionByCca2, flagOf, parseE164, DialOption } from "@/lib/dialCodes";

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

// Group the national number in pairs, like afro-excellence ("06 40 00 00 00").
function formatNational(digits: string): string {
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 2) groups.push(digits.slice(i, i + 2));
  return groups.join(" ");
}

function toE164(dial: string, national: string): string {
  let n = onlyDigits(national);
  if (n.startsWith("0")) n = n.slice(1); // drop national trunk prefix
  return n ? `${dial}${n}` : "";
}

/**
 * Phone input with a country dial-code selector + national number field.
 * Emits the combined E.164 string (e.g. "+33640000000") via onChangeText.
 */
export function PhoneField({
  label,
  value,
  onChangeText,
}: {
  label?: string;
  value: string;
  onChangeText: (e164: string) => void;
}) {
  const initial = parseE164(value);
  const [cca2, setCca2] = useState(initial?.cca2 ?? DEFAULT_CCA2);
  const [national, setNational] = useState(initial ? onlyDigits(initial.national) : "");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(() => optionByCca2(cca2), [cca2]);

  const filtered = useMemo(() => {
    if (!search.trim()) return DIAL_OPTIONS;
    const q = search.trim().toLowerCase();
    return DIAL_OPTIONS.filter(
      (o) => o.name.toLowerCase().includes(q) || o.dial.includes(q),
    );
  }, [search]);

  const update = (dial: string, nextNational: string) => {
    setNational(nextNational);
    onChangeText(toE164(dial, nextNational));
  };

  const pick = (o: DialOption) => {
    setCca2(o.cca2);
    setNational((n) => {
      onChangeText(toE164(o.dial, n));
      return n;
    });
    setOpen(false);
    setSearch("");
  };

  return (
    <View className="mb-3.5">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setOpen(true)}
          className="h-14 rounded-[14px] border-[1.5px] border-border bg-card px-3.5 flex-row items-center gap-1.5"
        >
          <Text className="text-[17px]">{flagOf(selected.cca2)}</Text>
          <Text className="text-[15px] text-fg font-poppins-medium">{selected.dial}</Text>
          <Icon name="chevron-down" size={16} color={colors.fgSoft} />
        </Pressable>
        <TextInput
          value={formatNational(national)}
          onChangeText={(t) => update(selected.dial, onlyDigits(t).slice(0, 15))}
          placeholder="6 40 00 00 00"
          placeholderTextColor={colors.fgSoft}
          keyboardType="phone-pad"
          className="flex-1 h-14 rounded-[14px] border-[1.5px] border-border bg-card px-[18px] text-[15px] text-fg"
        />
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(26,20,16,0.35)" }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-bg rounded-t-[24px] pb-6"
            style={{ maxHeight: "78%" }}
          >
            <View className="p-5 pb-2.5">
              <View className="w-10 h-1 rounded-sm bg-border self-center mb-3.5" />
              <Text className="text-[17px] font-poppins-bold mb-3 text-fg">Indicatif pays</Text>
              <View className="relative justify-center">
                <View className="absolute left-3.5 z-10">
                  <Icon name="search" size={16} color={colors.fgSoft} />
                </View>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Rechercher un pays ou un indicatif..."
                  placeholderTextColor={colors.fgSoft}
                  autoCapitalize="none"
                  className="h-11 pl-10 pr-3.5 rounded-[14px] border-[1.5px] border-border bg-card text-sm text-fg"
                />
              </View>
            </View>
            <ScrollView className="px-3" keyboardShouldPersistTaps="handled">
              {filtered.map((o) => (
                <Pressable
                  key={o.cca2}
                  onPress={() => pick(o)}
                  className={`py-3 px-3 rounded-[10px] flex-row items-center gap-3 ${
                    o.cca2 === cca2 ? "bg-primary-soft" : ""
                  }`}
                >
                  <Text className="text-[19px]">{flagOf(o.cca2)}</Text>
                  <Text className="text-sm text-fg flex-1">{o.name}</Text>
                  <Text className="text-sm text-fg-muted">{o.dial}</Text>
                  {o.cca2 === cca2 ? <Icon name="check" size={16} color={colors.primaryDark} /> : null}
                </Pressable>
              ))}
              {filtered.length === 0 ? (
                <Text className="text-center text-fg-soft text-[13px] p-6">Aucun résultat.</Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
