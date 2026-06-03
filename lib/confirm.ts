import { Alert, Platform } from "react-native";

// Cross-platform confirm dialog. RN Web doesn't implement Alert.alert with buttons
// (it's a silent no-op), so fall back to the browser's confirm there.
export function confirmAction(opts: {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  const { title, message, confirmLabel, destructive, onConfirm } = opts;
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Annuler", style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
