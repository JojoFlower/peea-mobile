import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const SESSION_TOKEN_KEY = "peea_session_token";

// In-memory mirror of the AsyncStorage token so invoke() can attach it
// synchronously without an AsyncStorage read per call.
let cachedSessionToken: string | null = null;

export function setSessionToken(token: string | null) {
  cachedSessionToken = token;
}

// Invoked when the server rejects the session token (401) on an authenticated
// call. AuthContext registers a handler that drops local auth state so the app
// returns to the logged-out flow instead of surfacing a raw 401.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export async function loadCachedSessionToken(): Promise<string | null> {
  if (cachedSessionToken) return cachedSessionToken;
  const stored = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
  cachedSessionToken = stored;
  return stored;
}

// ── Domain types (mirror the afro-excellence-hub schema) ─────────────────────

export type Inscription = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  heard_about_us: string | null;
  edition: string;
  created_at?: string;
};

export type MentorRole = "mentor" | "mentee";

export type MentorshipProfile = {
  id: string;
  inscription_id: string;
  role: MentorRole;
  status: "active" | "declined";
  edition: string;
  // mentor
  mentor_field: string | null;
  mentor_job: string | null;
  mentor_company: string | null;
  // mentee
  mentee_institution_category: string | null;
  mentee_institution_subcategory: string | null;
  mentee_institution_name: string | null;
  mentee_field_of_study: string | null;
  mentee_level: string | null;
  assigned_mentor_inscription_id: string | null;
  // Free-text "À propos" both roles can fill.
  description: string | null;
};

// A flattened person card (mentorship_profile JOIN inscription) used for the
// "mon binôme" contact views and the profile-detail screen.
export type PersonContact = {
  inscription_id: string;
  profile_id: string;
  role: MentorRole;
  full_name: string;
  first_name: string;
  last_name: string;
  // email + phone are null in the mentee directory (gated until a mentor
  // validates the mentee); populated in the binôme views after validation.
  email: string | null;
  phone: string | null;
  city: string | null;
  field: string | null;
  description?: string | null;
  // mentor-specific
  mentor_job?: string | null;
  mentor_company?: string | null;
  mentor_field?: string | null;
  // mentee-specific
  mentee_level?: string | null;
  mentee_institution_name?: string | null;
  mentee_institution_subcategory?: string | null;
  mentee_field_of_study?: string | null;
};

// Unified "me" payload returned by login / session / mentorship-upsert.
export type MeResponse = {
  user: Inscription;
  mentorship: MentorshipProfile | null;
  mentor: PersonContact | null; // assigned mentor (when user is a mentee)
  mentees: PersonContact[]; // assigned mentees (when user is a mentor)
};

export type CitySuggestion = {
  city: string;
  country: string;
  country_code: string;
  state: string;
  formatted: string;
  lat?: number;
  lon?: number;
};

// ── LMS (formations) ─────────────────────────────────────────────────────────

export type LmsQuestionType = "quiz" | "multi-quiz" | "open";
export type LmsReviewStatus = "pending" | "approved" | "needs_revision";

export type LmsLessonSummary = {
  id: string;
  title: string;
  order_index: number;
  question_count: number;
  is_completed: boolean;
  best_percentage: number | null;
};

export type LmsPathSummary = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: LmsLessonSummary[];
};

export type LmsQuestSummary = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  order_index: number;
  paths: LmsPathSummary[];
};

export type LmsOption = { id: string; text: string; order_index: number };

export type LmsMyAnswer = {
  selected_option_id: string | null;
  selected_option_ids: string[] | null;
  open_answer: string | null;
  is_correct: boolean | null;
  review_status: LmsReviewStatus;
  mentor_comment: string | null;
  reviewed_at: string | null;
};

export type LmsQuestion = {
  id: string;
  text: string;
  type: LmsQuestionType;
  order_index: number;
  options: LmsOption[];
  my_answer: LmsMyAnswer | null;
};

export type LmsLessonDetail = {
  lesson: { id: string; path_id: string; title: string; content: string | null };
  questions: LmsQuestion[];
  is_completed: boolean;
};

export type LmsSubmitAnswer = {
  question_id: string;
  selected_option_id?: string | null;
  selected_option_ids?: string[] | null;
  open_answer?: string | null;
};

export type LmsSubmitResult = {
  score: { correct_count: number; total_questions: number; percentage: number; passed: boolean } | null;
  results: { question_id: string; type: LmsQuestionType; is_correct: boolean | null; correct_option_ids: string[] }[];
  pending_review: number;
  is_completed: boolean;
};

export type LmsMenteeSummary = {
  inscription_id: string;
  full_name: string;
  email: string | null;
  completed_lessons: number;
  pending_reviews: number;
};

export type LmsMenteeAnswer = {
  id: string;
  question_text: string;
  lesson_title: string;
  open_answer: string | null;
  review_status: LmsReviewStatus;
  mentor_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
};

// ── Low-level invoke ─────────────────────────────────────────────────────────

function buildUrl(functionName: string, params?: Record<string, string>): string {
  let url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }
  return url;
}

async function rawInvoke(
  functionName: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (cachedSessionToken) headers["X-Session-Token"] = cachedSessionToken;

  let res: Response;
  try {
    res = await fetch(buildUrl(functionName, params), {
      method: body ? "POST" : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network unreachable / request aborted. Signal with status 0 so callers
    // surface a friendly message instead of an uncaught promise rejection.
    return { status: 0, data: null };
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data };
}

async function invoke<T>(
  functionName: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<T> {
  const { status, data } = await rawInvoke(functionName, body, params);
  if (status === 0) throw new Error(NETWORK_ERROR_MESSAGE);
  if (status === 401) {
    onUnauthorized?.();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }
  if (status < 200 || status >= 300) {
    throw new Error(data?.error || `${functionName} failed (${status})`);
  }
  return data as T;
}

const NETWORK_ERROR_MESSAGE = "Réseau indisponible. Vérifie ta connexion internet et réessaie.";
const SESSION_EXPIRED_MESSAGE = "Session expirée. Reconnecte-toi.";

// ── Result types ─────────────────────────────────────────────────────────────

export type RequestCodeResult =
  | { ok: true }
  | {
      ok: false;
      error: "no_account" | "rate_limited" | "email_failed" | "invalid_email" | "unknown";
      message?: string;
    };

export type VerifyResult =
  | { ok: true; token: string; me: MeResponse }
  | { ok: false; error: "invalid_code"; attemptsLeft: number }
  | { ok: false; error: "code_rotated"; message: string }
  | { ok: false; error: "code_expired" | "rate_limited" | "email_failed" | "unknown"; message?: string };

export type RegisterInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city: string;
  heard_about_us: string;
};

export type RegisterResult =
  | { ok: true; inscription_id: string }
  | { ok: false; error: "already_registered" | "invalid" | "unknown"; message?: string };

export type MentorshipInput =
  | {
      role: "mentor";
      mentor_field: string;
      mentor_job: string;
      mentor_company?: string;
      description?: string;
    }
  | {
      role: "mentee";
      mentee_institution_category: string;
      mentee_institution_subcategory: string;
      mentee_institution_name: string;
      mentee_field_of_study: string;
      mentee_level: string;
      description?: string;
    };

export type ProfileUpdateInput = {
  first_name: string;
  last_name: string;
  city: string;
  phone?: string;
};

// ── Public API ───────────────────────────────────────────────────────────────

export const API = {
  requestCode: async (email: string): Promise<RequestCodeResult> => {
    const { status, data } = await rawInvoke("app-request-code", { email });
    if (status === 0) return { ok: false, error: "unknown", message: NETWORK_ERROR_MESSAGE };
    if (status === 200) return { ok: true };
    if (status === 404) return { ok: false, error: "no_account" };
    if (status === 429) return { ok: false, error: "rate_limited" };
    if (status === 502) return { ok: false, error: "email_failed", message: data?.error };
    if (status === 400) return { ok: false, error: "invalid_email", message: data?.error };
    return { ok: false, error: "unknown", message: data?.error };
  },

  verifyCode: async (email: string, code: string): Promise<VerifyResult> => {
    const { status, data } = await rawInvoke("app-verify-code", { email, code });
    if (status === 0) return { ok: false, error: "unknown", message: NETWORK_ERROR_MESSAGE };
    if (status === 200 && data?.token && data?.me) {
      return { ok: true, token: data.token, me: data.me };
    }
    if (status === 401 && data?.error === "invalid_code") {
      return { ok: false, error: "invalid_code", attemptsLeft: data.attemptsLeft ?? 0 };
    }
    if (status === 401 && data?.error === "code_rotated") {
      return { ok: false, error: "code_rotated", message: data.message ?? "" };
    }
    if (status === 400 && data?.error === "code_expired") {
      return { ok: false, error: "code_expired" };
    }
    if (status === 429) return { ok: false, error: "rate_limited", message: data?.message };
    if (status === 502) return { ok: false, error: "email_failed", message: data?.message };
    return { ok: false, error: "unknown", message: data?.error ?? data?.message };
  },

  register: async (input: RegisterInput): Promise<RegisterResult> => {
    const { status, data } = await rawInvoke("app-register", input);
    if (status === 0) return { ok: false, error: "unknown", message: NETWORK_ERROR_MESSAGE };
    if (status === 200 && data?.inscription_id) return { ok: true, inscription_id: data.inscription_id };
    if (status === 409) return { ok: false, error: "already_registered" };
    if (status === 400) return { ok: false, error: "invalid", message: data?.error };
    return { ok: false, error: "unknown", message: data?.error };
  },

  getSession: () => invoke<MeResponse>("app-session"),

  logout: (token: string) => invoke<{ ok: true }>("app-logout", { token }),

  upsertMentorship: (input: MentorshipInput) =>
    invoke<MeResponse>("app-mentorship-upsert", input),

  // Edit the current user's inscription details (name, phone, city). Email is not
  // editable here (it's the login identifier). Returns the refreshed "me".
  updateProfile: (input: ProfileUpdateInput) =>
    invoke<MeResponse>("app-profile-update", input),

  // City autocomplete backed by the shared geocode-cities edge function
  // (Geoapify). Returns [] on any error so the form stays usable.
  geocodeCities: async (q: string): Promise<CitySuggestion[]> => {
    const query = q.trim();
    if (query.length < 2) return [];
    try {
      const { status, data } = await rawInvoke("geocode-cities", undefined, { q: query, lang: "fr" });
      if (status < 200 || status >= 300) return [];
      return (data?.cities ?? []) as CitySuggestion[];
    } catch {
      return [];
    }
  },

  // ── LMS (formations) ────────────────────────────────────────────────────────
  lmsCatalog: () => invoke<{ quests: LmsQuestSummary[] }>("app-lms-catalog"),

  lmsLesson: (lessonId: string) =>
    invoke<LmsLessonDetail>("app-lms-lesson", undefined, { lesson_id: lessonId }),

  lmsSubmit: (lessonId: string, answers: LmsSubmitAnswer[]) =>
    invoke<LmsSubmitResult>("app-lms-answer-submit", { lesson_id: lessonId, answers }),

  lmsComplete: (lessonId: string) =>
    invoke<{ ok: true; is_completed: boolean }>("app-lms-complete", { lesson_id: lessonId }),

  // Mentor side.
  lmsMentees: () => invoke<{ mentees: LmsMenteeSummary[] }>("app-lms-mentees"),

  lmsMenteeAnswers: (menteeInscriptionId: string) =>
    invoke<{ mentee: { inscription_id: string; full_name: string }; answers: LmsMenteeAnswer[] }>(
      "app-lms-mentee-answers",
      undefined,
      { mentee_inscription_id: menteeInscriptionId },
    ),

  lmsReviewAnswer: (answerId: string, reviewStatus: LmsReviewStatus, mentorComment?: string) =>
    invoke<{ ok: true; answer_id: string; review_status: LmsReviewStatus; mentor_comment: string | null }>(
      "app-lms-answer-review",
      { answer_id: answerId, review_status: reviewStatus, mentor_comment: mentorComment ?? "" },
    ),
};
