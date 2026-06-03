import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API,
  MeResponse,
  RequestCodeResult,
  VerifyResult,
  RegisterInput,
  RegisterResult,
  MentorshipInput,
  ProfileUpdateInput,
  SESSION_TOKEN_KEY,
  setSessionToken,
  setUnauthorizedHandler,
  loadCachedSessionToken,
} from "@/services/api";

type AuthContextType = {
  me: MeResponse | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  requestCode: (email: string) => Promise<RequestCodeResult>;
  verifyCode: (email: string, code: string) => Promise<VerifyResult>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  upsertMentorship: (input: MentorshipInput) => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<void>;
  respondToRequest: (menteeInscriptionId: string, action: "accept" | "decline") => Promise<void>;
  leaveMentor: () => Promise<void>;
  removeMentee: (menteeInscriptionId: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function persistToken(token: string) {
  await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
  setSessionToken(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await loadCachedSessionToken();
        if (!token) return;
        setSessionToken(token);
        const session = await API.getSession();
        setMe(session);
      } catch {
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
        setSessionToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // Drop local auth state if the server rejects our token mid-session (401),
  // so the app falls back to the logged-out flow instead of leaking a raw error.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setMe(null);
      setError(null);
      setSessionToken(null);
      AsyncStorage.removeItem(SESSION_TOKEN_KEY).catch(() => {});
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const requestCode = useCallback(async (email: string): Promise<RequestCodeResult> => {
    setLoading(true);
    setError(null);
    const result = await API.requestCode(email);
    setLoading(false);
    if (!result.ok) {
      const msg =
        result.error === "no_account"
          ? "Aucun compte trouvé pour cet email. Inscris-toi d'abord."
          : result.error === "rate_limited"
            ? "Trop de demandes. Réessaie dans une heure."
            : result.error === "email_failed"
              ? "L'envoi de l'email a échoué. Réessaie."
              : result.error === "invalid_email"
                ? "Adresse email invalide."
                : result.message || "Une erreur est survenue.";
      setError(msg);
    }
    return result;
  }, []);

  const verifyCode = useCallback(async (email: string, code: string): Promise<VerifyResult> => {
    setLoading(true);
    setError(null);
    const result = await API.verifyCode(email, code);
    if (result.ok) {
      try {
        await persistToken(result.token);
        setMe(result.me);
      } catch (e: any) {
        setError(e?.message ?? "Connexion échouée");
      }
    }
    setLoading(false);
    return result;
  }, []);

  // Sign up = create the inscription only. No session is opened here; the user
  // logs in afterwards on their own via the normal passwordless login flow.
  const register = useCallback(async (input: RegisterInput): Promise<RegisterResult> => {
    setLoading(true);
    setError(null);
    const result = await API.register(input);
    setLoading(false);
    if (!result.ok) {
      const msg =
        result.error === "already_registered"
          ? "Cet email (ou ce téléphone) est déjà inscrit. Connecte-toi plutôt."
          : result.message || "Inscription échouée.";
      setError(msg);
    }
    return result;
  }, []);

  const upsertMentorship = useCallback(async (input: MentorshipInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await API.upsertMentorship(input);
      setMe(updated);
    } catch (e: any) {
      setError(e?.message ?? "Échec de l'inscription au mentorat");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await API.updateProfile(input);
      setMe(updated);
    } catch (e: any) {
      const msg =
        e?.message === "phone_taken"
          ? "Ce numéro de téléphone est déjà utilisé par un autre compte."
          : (e?.message ?? "Échec de la mise à jour du profil.");
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // A mentor accepts or declines a mentorship request. On accept the binôme is
  // formed and "me" is refreshed (both parties' contact details unlock).
  const respondToRequest = useCallback(
    async (menteeInscriptionId: string, action: "accept" | "decline") => {
      setLoading(true);
      setError(null);
      try {
        const updated = await API.respondToRequest(menteeInscriptionId, action);
        setMe(updated);
      } catch (e: any) {
        setError(e?.message ?? "Échec de la réponse à la demande");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // A mentee leaves their assigned mentor (stays a mentee, returns to the deck).
  const leaveMentor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMe(await API.leaveMentor());
    } catch (e: any) {
      setError(e?.message ?? "Impossible de quitter ce mentor.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // A mentor removes one specific mentee from their binôme.
  const removeMentee = useCallback(async (menteeInscriptionId: string) => {
    setLoading(true);
    setError(null);
    try {
      setMe(await API.removeMentee(menteeInscriptionId));
    } catch (e: any) {
      setError(e?.message ?? "Impossible de retirer ce·tte mentoré·e.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const session = await API.getSession();
      setMe(session);
    } catch {
      /* keep existing state */
    }
  }, []);

  const logout = useCallback(async () => {
    setMe(null);
    setError(null);
    const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
    setSessionToken(null);
    if (token) {
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      try {
        await API.logout(token);
      } catch {
        /* best-effort */
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        me,
        initializing,
        loading,
        error,
        isAuthenticated: !!me,
        requestCode,
        verifyCode,
        register,
        upsertMentorship,
        updateProfile,
        respondToRequest,
        leaveMentor,
        removeMentee,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
