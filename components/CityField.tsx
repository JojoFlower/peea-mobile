import { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { colors } from "@/lib/theme";
import { Icon } from "./Icon";
import { FieldLabel } from "./forms";
import { API, CitySuggestion } from "@/services/api";

/**
 * City field with geocoding autocomplete (geocode-cities edge function).
 * Free text is allowed, but selecting a suggestion fills the normalized name.
 * The selected/typed city string is reported via onChangeText.
 */
export function CityField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set after picking a suggestion so the resulting onChangeText doesn't
  // immediately re-open the dropdown.
  const justPickedRef = useRef(false);

  const fetchCities = (q: string) => {
    setLoading(true);
    API.geocodeCities(q)
      .then((cities) => setSuggestions(cities))
      .finally(() => setLoading(false));
  };

  const handleChange = (text: string) => {
    onChangeText(text);
    if (justPickedRef.current) {
      justPickedRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchCities(text), 300);
  };

  const pick = (s: CitySuggestion) => {
    justPickedRef.current = true;
    onChangeText(s.city ?? s.formatted);
    setSuggestions([]);
    setFocused(false);
  };

  const showDropdown = focused && (loading || suggestions.length > 0);

  return (
    <View className="mb-3.5">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View className="relative justify-center">
        <View className="absolute left-4 z-10">
          <Icon name="map-pin" size={17} color={colors.fgSoft} />
        </View>
        <TextInput
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.fgSoft}
          className="h-14 rounded-[14px] border-[1.5px] border-border bg-card text-[15px] text-fg pl-11 pr-[18px]"
        />
      </View>

      {showDropdown ? (
        <View className="mt-1.5 rounded-[14px] border-[1.5px] border-border bg-card overflow-hidden">
          {loading && suggestions.length === 0 ? (
            <View className="flex-row items-center gap-2 py-3.5 px-4">
              <ActivityIndicator size="small" color={colors.fgSoft} />
              <Text className="text-[13px] text-fg-soft">Recherche...</Text>
            </View>
          ) : (
            suggestions.map((s, idx) => (
              <Pressable
                key={`${s.formatted}-${idx}`}
                onPress={() => pick(s)}
                className={`py-3 px-4 flex-row items-center gap-3 active:bg-primary-soft ${
                  idx > 0 ? "border-t border-border-soft" : ""
                }`}
              >
                <Icon name="map-pin" size={15} color={colors.fgSoft} />
                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="text-sm text-fg">
                    {s.city}
                  </Text>
                  {s.state || s.country ? (
                    <Text numberOfLines={1} className="text-xs text-fg-muted mt-0.5">
                      {[s.state, s.country].filter(Boolean).join(", ")}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
