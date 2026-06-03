export type Niveau =
  | "BAC+1"
  | "BAC+2"
  | "BAC+3"
  | "BAC+4"
  | "BAC+5"
  | "Post-BAC+5"
  | "Autre";

export const LEVEL_OPTIONS: Niveau[] = [
  "BAC+1",
  "BAC+2",
  "BAC+3",
  "BAC+4",
  "BAC+5",
  "Post-BAC+5",
  "Autre",
];

export const INSTITUTION_OPTIONS: Array<{ category: string; sub: string[] }> = [
  {
    category: "Grandes Écoles",
    sub: [
      "École de commerce / management (CGE)",
      "École d'ingénieurs (CTI)",
      "École normale supérieure (ENS)",
      "Institut d'études politiques (IEP / Sciences Po)",
      "École d'architecture (ENSA)",
      "École d'art et de design (Beaux-Arts, ENSAD, etc.)",
      "École vétérinaire (ENV)",
      "École militaire (Saint-Cyr, Polytechnique, Navale, etc.)",
      "École de journalisme reconnue (CFJ, ESJ, CUEJ, etc.)",
      "Autre grande école",
    ],
  },
  {
    category: "Universités (Facultés)",
    sub: [
      "Sciences et technologies (maths, informatique, physique, etc.)",
      "Lettres, langues et sciences humaines",
      "Psychologie",
      "Droit et science politique",
      "Économie et gestion",
      "Information et communication",
      "Arts et arts du spectacle",
      "STAPS",
      "Sciences de l'éducation",
      "Théologie",
      "IAE (Institut d'administration des entreprises)",
      "IPAG (Institut de préparation à l'administration générale)",
      "Autre filière universitaire",
    ],
  },
  {
    category: "Études de Santé",
    sub: [
      "Médecine",
      "Pharmacie",
      "Odontologie (dentaire)",
      "Maïeutique (sage-femme)",
      "Kinésithérapie",
      "Soins infirmiers (IFSI)",
      "Orthophonie",
      "Orthoptie",
      "Ergothérapie",
      "Psychomotricité",
      "Audioprothèse",
      "Manipulateur en électroradiologie",
      "Pédicurie-podologie",
      "Autre formation paramédicale",
    ],
  },
  {
    category: "Classes Préparatoires aux Grandes Écoles (CPGE)",
    sub: [
      "Scientifique — MPSI / MP",
      "Scientifique — PCSI / PC",
      "Scientifique — PTSI / PT",
      "Scientifique — BCPST",
      "Scientifique — TSI",
      "Scientifique — MP2I / MPI",
      "Économique et commerciale — ECG",
      "Littéraire — A/L (Ulm)",
      "Littéraire — B/L (Lyon / LSH)",
      "Littéraire — Chartes",
      "Littéraire — Saint-Cyr Lettres",
      "Autre CPGE",
    ],
  },
  {
    category: "BTS / BUT / Formations technologiques courtes",
    sub: [
      "BTS — Tertiaire (commerce, compta, gestion, etc.)",
      "BTS — Industriel (électrotechnique, mécanique, etc.)",
      "BTS — Agricole",
      "BTS — Hôtellerie-restauration / Tourisme",
      "BTS — Arts appliqués / DN MADE / DSAA",
      "Autre BTS",
      "BUT — Tertiaire (GEA, TC, Info-Com, etc.)",
      "BUT — Informatique / Statistique (STID)",
      "BUT — Industriel (GMP, GEII, MP, etc.)",
      "BUT — Biologie / Chimie",
      "BUT — Carrières sociales / juridiques",
      "Autre BUT",
    ],
  },
  {
    category: "Écoles privées d'enseignement supérieur",
    sub: [
      "Commerce / management (hors CGE)",
      "Informatique / numérique (42, etc.)",
      "Communication / marketing / publicité",
      "Mode / luxe",
      "Cinéma / audiovisuel / animation 3D / jeux vidéo",
      "Musique / spectacle vivant",
      "Design / graphisme",
      "Tourisme / hôtellerie",
      "Autre école privée",
    ],
  },
  {
    category: "Formations du secteur social",
    sub: [
      "Éducateur spécialisé (DEES)",
      "Assistant de service social (DEASS)",
      "Éducateur de jeunes enfants (DEEJE)",
      "Conseiller en économie sociale et familiale (DECESF)",
      "Moniteur-éducateur",
      "Autre formation sociale (IRTS, etc.)",
    ],
  },
  {
    category: "Écoles de la fonction publique",
    sub: [
      "INSP (ex-ENA)",
      "ENM (École nationale de la magistrature)",
      "INET / IRA / ENSP",
      "Autre école de la fonction publique",
    ],
  },
  {
    category: "CNAM / Formation continue",
    sub: [
      "CNAM (Conservatoire national des arts et métiers)",
      "CFA (Centre de formation d'apprentis)",
      "GRETA / autre organisme de formation continue",
    ],
  },
  {
    category: "Autres établissements ou formations",
    sub: ["À préciser"],
  },
];

export const FIELD_OF_STUDY_OPTIONS = [
  "Non applicable",
  // Arts et Sciences Humaines
  "Littérature",
  "Philosophie",
  "Histoire",
  "Langues étrangères",
  "Anthropologie",
  "Archéologie",
  "Arts (arts visuels, arts du spectacle)",
  "Linguistique",
  "Théologie",
  // Sciences Sociales
  "Administration publique",
  "Psychologie",
  "Sociologie",
  "Science politique",
  "Économie",
  "Démographie",
  "Communication",
  "Gestion des ressources humaines",
  "Études urbaines",
  // Sciences Naturelles
  "Astronomie",
  "Biologie",
  "Géologie",
  "Géographie",
  "Science de l'environnement",
  "Météorologie",
  // Sciences Formelles
  "Mathématiques",
  "Physique",
  "Chimie",
  "Statistiques",
  // Ingénierie et Technologie
  "Génie aérospatial",
  "Génie civil",
  "Génie mécanique",
  "Génie électrique",
  "Génie des matériaux",
  "Informatique et génie logiciel",
  "Réseaux & Télécom",
  "Intelligence Artificielle",
  "Ingénierie biomédicale",
  "Logistique et Transport",
  "Architecture",
  "Génie Chimique",
  "Génie de Procédés",
  "Génie Énergétique",
  "Génie Minéral",
  "Génie Minier",
  "Génie Contrôle et Instrumentation",
  "Génie Électromécanique",
  // Sciences de la Santé
  "Médecine",
  "Pharmacie",
  "Odontologie (dentaire)",
  "Maïeutique (sage-femme)",
  "Kinésithérapie",
  "Soins infirmiers",
  "Orthophonie",
  "Orthoptie",
  "Ergothérapie",
  "Psychomotricité",
  "Audioprothèse",
  "Manipulateur en électroradiologie",
  "Pédicurie-podologie",
  "Santé publique",
  "Sciences biomédicales",
  "Analyses médicales",
  // Éducation
  "Enseignement",
  "Éducation spéciale",
  "Psychopédagogie",
  "Administration scolaire",
  // Affaires et Commerce
  "Comptabilité",
  "Finance",
  "Marketing",
  "Gestion",
  "Commerce international",
  "Entrepreneuriat",
  // Beaux-Arts et Design
  "Design graphique",
  "Arts plastiques",
  "Mode",
  "Cinéma et photographie",
  // Agriculture et Environnement
  "Agronomie",
  "Écologie",
  "Foresterie",
  "Génie agricole",
  "Horticulture",
  "Sciences de l'eau",
  "Sciences alimentaires",
  // Droit
  "Droit civil",
  "Droit pénal",
  "Droit international",
  "Droit des affaires",
  "Droits de l'homme",
  // Sciences Militaires et Sécurité
  "Études de sécurité",
  "Géopolitique",
  "Stratégie militaire",
  "Défense et sécurité nationale",
].sort((a, b) => {
  if (a === "Non applicable") return -1;
  if (b === "Non applicable") return 1;
  return a.localeCompare(b, "fr");
});

// Liste de métiers (mode strict) pour les mentors. Organisée par grand secteur,
// triée alphabétiquement avec une recherche libre côté UI.
export const MENTOR_JOB_OPTIONS: string[] = [
  // Tech & Données
  "Développeur·euse logiciel",
  "Développeur·euse front-end",
  "Développeur·euse back-end",
  "Développeur·euse full-stack",
  "Développeur·euse mobile",
  "Ingénieur·e DevOps / SRE",
  "Ingénieur·e cloud",
  "Ingénieur·e cybersécurité",
  "Ingénieur·e en intelligence artificielle / ML",
  "Data scientist",
  "Data analyst",
  "Data engineer",
  "Architecte logiciel",
  "Architecte cloud",
  "Product manager",
  "Product owner",
  "Designer UX / UI",
  "QA / Ingénieur·e test",
  "Administrateur·rice système / réseau",
  "Tech lead / Engineering manager",
  "CTO",

  // Ingénierie
  "Ingénieur·e généraliste",
  "Ingénieur·e mécanique",
  "Ingénieur·e électrique / électronique",
  "Ingénieur·e civil / BTP",
  "Ingénieur·e aéronautique / aérospatial",
  "Ingénieur·e énergie",
  "Ingénieur·e environnement",
  "Ingénieur·e matériaux",
  "Ingénieur·e chimiste",
  "Ingénieur·e biomédical",
  "Ingénieur·e industriel / production",
  "Ingénieur·e qualité",
  "Ingénieur·e R&D",

  // Finance, Banque, Assurance
  "Analyste financier",
  "Auditeur·rice",
  "Contrôleur·euse de gestion",
  "Comptable",
  "Expert-comptable",
  "Trader",
  "Gestionnaire de patrimoine / Conseiller financier",
  "Banquier·ère",
  "Actuaire",
  "Risk manager",
  "Analyste M&A / Corporate finance",
  "Analyste private equity / venture capital",

  // Conseil & Stratégie
  "Consultant·e en stratégie",
  "Consultant·e en management",
  "Consultant·e en transformation digitale",
  "Consultant·e en organisation",
  "Consultant·e RH",

  // Droit
  "Avocat·e",
  "Juriste d'entreprise",
  "Notaire",
  "Magistrat·e",
  "Huissier·ère de justice",
  "Commissaire de police / Officier·ère",

  // Santé
  "Médecin généraliste",
  "Médecin spécialiste",
  "Chirurgien·ne",
  "Pharmacien·ne",
  "Dentiste",
  "Sage-femme",
  "Infirmier·ère",
  "Kinésithérapeute",
  "Psychologue",
  "Psychiatre",
  "Vétérinaire",
  "Chercheur·euse en biomédical / pharma",

  // Sciences & Recherche
  "Chercheur·euse / Enseignant-chercheur",
  "Statisticien·ne",
  "Biologiste",
  "Chimiste",
  "Physicien·ne",

  // Marketing, Communication, Vente
  "Responsable marketing",
  "Chef·fe de produit marketing",
  "Growth manager",
  "Brand manager",
  "Community manager / Social media manager",
  "Responsable communication",
  "Attaché·e de presse",
  "Commercial·e B2B",
  "Account manager / Key account manager",
  "Business developer",
  "Directeur·rice commercial·e",

  // RH & Recrutement
  "Responsable RH",
  "Chargé·e de recrutement",
  "Talent acquisition / Headhunter",
  "Responsable formation",
  "DRH",

  // Entrepreneuriat & Direction
  "Entrepreneur·e / Fondateur·rice",
  "CEO / Directeur·rice général·e",
  "COO / Directeur·rice des opérations",
  "CFO / Directeur·rice financier·ère",
  "CMO / Directeur·rice marketing",
  "Investisseur·euse (Business angel, VC)",

  // Industrie & Logistique
  "Chef·fe de projet industriel",
  "Responsable production",
  "Responsable supply chain / logistique",
  "Acheteur·euse",
  "Responsable qualité",

  // Éducation & Enseignement
  "Enseignant·e (primaire / secondaire)",
  "Professeur·e d'université",
  "Formateur·rice / Coach professionnel",

  // Fonction publique & International
  "Diplomate",
  "Fonctionnaire / Cadre de la fonction publique",
  "Chargé·e de mission ONG / Humanitaire",
  "Officier·ère / Militaire",

  // Arts, Culture, Média
  "Journaliste",
  "Rédacteur·rice / Auteur·rice",
  "Réalisateur·rice / Producteur·rice",
  "Photographe / Vidéaste",
  "Graphiste / Illustrateur·rice",
  "Architecte",
  "Designer (mode, produit, intérieur)",
  "Musicien·ne / Artiste",

  // Architecture & Immobilier
  "Promoteur·rice immobilier",
  "Agent·e immobilier",
  "Urbaniste",

  // Hôtellerie, Restauration, Tourisme
  "Chef·fe de cuisine / Restaurateur·rice",
  "Hôtelier·ère",
  "Professionnel·le du tourisme",

  // Autre
  "Autre",
].sort((a, b) => {
  if (a === "Autre") return 1;
  if (b === "Autre") return -1;
  return a.localeCompare(b, "fr");
});

// ── Added for PEEA mobile ────────────────────────────────────────────────────

// inscriptions.heard_about_us (mirrors src/components/InscriptionForm.tsx)
export const HEARD_ABOUT_US_OPTIONS: string[] = [
  "Réseaux sociaux",
  "Bouche-à-oreille",
  "Association étudiante",
  "Université / École",
  "Recherche internet",
  "Presse / Média",
  "Autre",
];

// Current edition label (display only). Mirrors the backend's currentEdition()
// = the current calendar year, so the UI stays in sync with the edition a user
// is rolled into on login. The backend remains the source of truth for the
// edition actually written to inscriptions / mentorship_profiles.
export const EDITION = String(new Date().getUTCFullYear());

// Maximum number of mentees a single mentor can take on per edition. Enforced
// client-side as a guard; the backend remains the source of truth.
export const MAX_MENTEES = 3;

// Accent colour per study/mentor field — presentation only, derived from field.
const FIELD_COLORS: Record<string, string> = {
  "Informatique et génie logiciel": "#3B82F6",
  "Intelligence Artificielle": "#6366F1",
  "Médecine": "#EF4444",
  "Pharmacie": "#F43F5E",
  "Finance": "#10B981",
  "Marketing": "#EC4899",
  "Entrepreneuriat": "#F59E0B",
  "Gestion": "#14B8A6",
  "Droit des affaires": "#8B5CF6",
  "Droit international": "#A855F7",
  "Génie aérospatial": "#06B6D4",
  "Génie civil": "#0EA5E9",
  "Science politique": "#84CC16",
  "Économie": "#22C55E",
  "Biologie": "#16A34A",
  "Architecture": "#D97706",
  "Communication": "#DB2777",
};

export function fieldColor(field?: string | null): string {
  if (!field) return "#A8772E";
  return FIELD_COLORS[field] ?? "#A8772E";
}
