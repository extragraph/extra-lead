import type {
  AuditScoreSlice,
  ComparisonTier,
  CompetitiveComparisonPayload,
  CompetitorComparisonRow,
  ComparisonTierLevel,
  DesignCheckItem,
} from "@/types/audit";
import { hashString, seededUnit } from "./hash";

const FRENCH_CITIES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Le Havre",
  "Saint-Étienne",
  "Toulon",
  "Grenoble",
  "Dijon",
  "Angers",
  "Clermont-Ferrand",
  "Tours",
  "Amiens",
  "Perpignan",
  "Brest",
  "Limoges",
  "Metz",
];

const SECTOR_RULES: { pattern: RegExp; label: string; short: string }[] = [
  { pattern: /menuis|fenêtre|volet|pvc|alu/i, label: "Menuiserie & fermetures", short: "Menuiserie" },
  { pattern: /plomb|chauff|sanitaire|fuite/i, label: "Plomberie & chauffage", short: "Plomberie" },
  { pattern: /électric|éclairage|tableau électrique/i, label: "Électricité", short: "Électricité" },
  { pattern: /coiff|salon|barbier/i, label: "Coiffure & esthétique", short: "Coiffure" },
  { pattern: /restaurant|traiteur|brasserie|café/i, label: "Restauration", short: "Restauration" },
  { pattern: /avocat|cabinet juridique/i, label: "Conseil juridique", short: "Avocat" },
  { pattern: /dépan|serrur|vitr|auto/i, label: "Dépannage & services", short: "Dépannage" },
  { pattern: /jardin|paysag|espaces verts/i, label: "Paysagisme", short: "Paysagisme" },
  { pattern: /imprimer|graph|signalétique/i, label: "Imprimerie & signalétique", short: "Imprimerie" },
  { pattern: /bâtiment|maçon|couvre|charpent/i, label: "Bâtiment & travaux", short: "Artisan du bâtiment" },
];

const FIRST_NAMES = [
  "Dupont",
  "Martin",
  "Bernard",
  "Thomas",
  "Petit",
  "Robert",
  "Richard",
  "Durand",
  "Leroy",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Mercier",
];

const BRAND_SUFFIXES = ["Pro", "Plus", "Services", "Expert", "Sud", "Ouest", "Habitat", "Artisans"];

function tierFromScore(score: number, labels: { g: string; o: string; r: string }): ComparisonTier {
  if (score >= 75) return { level: "green", label: labels.g };
  if (score >= 50) return { level: "orange", label: labels.o };
  return { level: "red", label: labels.r };
}

function detectCity(html: string | null, seed: number): string {
  if (html) {
    const text = html.replace(/\s+/g, " ").slice(0, 80_000);
    for (const city of FRENCH_CITIES) {
      const re = new RegExp(`\\b${city.replace(/-/g, "\\-")}\\b`, "i");
      if (re.test(text)) return city;
    }
    const cp = html.match(/\b(69|33|31|44|59|67|06|13|34|35)\d{3}\b/);
    if (cp) {
      const map: Record<string, string> = {
        "69": "Lyon",
        "33": "Bordeaux",
        "31": "Toulouse",
        "44": "Nantes",
        "59": "Lille",
        "67": "Strasbourg",
        "06": "Nice",
        "13": "Marseille",
        "34": "Montpellier",
        "35": "Rennes",
      };
      const p = cp[0].slice(0, 2);
      if (map[p]) return map[p];
    }
  }
  return FRENCH_CITIES[seed % FRENCH_CITIES.length];
}

function detectSector(html: string | null, url: string, seed: number): string {
  const blob = `${html || ""} ${url}`.toLowerCase();
  for (const rule of SECTOR_RULES) {
    if (rule.pattern.test(blob)) return rule.label;
  }
  const fallback = ["Artisanat & services locaux", "Commerce de proximité", "Services aux particuliers"];
  return fallback[seed % fallback.length];
}

function fakeUrl(slug: string, seed: number): string {
  const tlds = [".fr", ".com", ".pro"];
  return `https://www.${slug}${tlds[seed % tlds.length]}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function randomCompetitorName(sectorShort: string, city: string, seed: number): string {
  const fn = FIRST_NAMES[(seed * 7) % FIRST_NAMES.length];
  const suf = BRAND_SUFFIXES[(seed * 3) % BRAND_SUFFIXES.length];
  const variants = [
    `${sectorShort} ${fn}`,
    `${fn} ${suf}`,
    `${sectorShort} ${city}`,
    `${fn} & Fils — ${city}`,
  ];
  return variants[seed % variants.length];
}

function levelOrder(l: ComparisonTierLevel): number {
  if (l === "green") return 3;
  if (l === "orange") return 2;
  return 1;
}

function applyPenalty(
  prospect: CompetitorComparisonRow,
  competitors: CompetitorComparisonRow[],
): void {
  const keys: (keyof Pick<CompetitorComparisonRow, "performance" | "design" | "conversion" | "mobile">)[] = [
    "performance",
    "design",
    "conversion",
    "mobile",
  ];

  for (const key of keys) {
    if (prospect[key].level === "red") {
      const target = competitors[0];
      if (levelOrder(target[key].level) < 3) {
        if (key === "performance") {
          target.performance = { level: "green", label: "Très rapide (réf. locale)" };
        } else if (key === "design") {
          target.design = { level: "green", label: "Identité soignée" };
        } else if (key === "conversion") {
          target.conversion = {
            level: "green",
            label: "RDV en ligne + synchro CRM (OPLead)",
          };
        } else {
          target.mobile = { level: "green", label: "100 % mobile-first" };
        }
      }
      return;
    }
  }

  competitors[0].conversion = {
    level: "green",
    label: "Prise de RDV en ligne + OPLead (réf. locale simulée)",
  };
  prospect.conversion = {
    level: "red",
    label: "Objectif benchmark : structurer prise de RDV & CRM (OPLead)",
  };
}

export function buildCompetitiveSimulation(
  url: string,
  html: string | null,
  scores: AuditScoreSlice[],
  designChecks: DesignCheckItem[],
  basicFormPitch: boolean,
): CompetitiveComparisonPayload {
  const seed = hashString(url);
  const city = detectCity(html, seed);
  const sector = detectSector(html, url, seed);

  const perf = scores.find((s) => s.id === "performance")?.score ?? 0;
  const design = scores.find((s) => s.id === "design")?.score ?? 0;
  const responsiveOk = designChecks.find((c) => c.id === "responsive")?.ok ?? false;

  const performance = tierFromScore(perf, {
    g: "Bonnes perfs",
    o: "Moyen",
    r: "À optimiser",
  });

  const designTier = tierFromScore(design, {
    g: "Design cohérent",
    o: "Correct",
    r: "À retravailler",
  });

  let conversion: ComparisonTier;
  if (basicFormPitch) {
    conversion = {
      level: "red",
      label: "Formulaire basique — pas de CRM / OPLead",
    };
  } else {
    conversion = {
      level: "orange",
      label: "Formulaire présent — flux à industrialiser",
    };
  }

  const mobile = responsiveOk
    ? ({ level: "green" as const, label: "Viewport & mobile OK" } satisfies ComparisonTier)
    : ({ level: "red" as const, label: "Mobile perfectible" } satisfies ComparisonTier);

  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "votre-site";
    }
  })();

  const prospect: CompetitorComparisonRow = {
    id: "prospect",
    name: "Votre site (audité)",
    urlLabel: host,
    isProspect: true,
    performance,
    design: designTier,
    conversion,
    mobile,
  };

  const sectorShort =
    SECTOR_RULES.find((r) => r.label === sector)?.short || "Services";

  const competitors: CompetitorComparisonRow[] = [];
  for (let i = 0; i < 3; i++) {
    const s = seed + i * 17;
    const name = randomCompetitorName(sectorShort, city, s);
    const slug = slugify(`${name}-${city}-${i}`);
    const perfScore = 45 + Math.floor(seededUnit(s + 1) * 45);
    const designScore = 40 + Math.floor(seededUnit(s + 2) * 50);
    const mobGreen = seededUnit(s + 3) > 0.25;

    competitors.push({
      id: `sim-${i}`,
      name,
      urlLabel: fakeUrl(slug || `concurrent-${i}`, s).replace(/^https:\/\//, ""),
      isProspect: false,
      performance: tierFromScore(perfScore, {
        g: "Performant",
        o: "Moyen",
        r: "Faible",
      }),
      design: tierFromScore(designScore, {
        g: "Sobre & pro",
        o: "Standard",
        r: "Daté",
      }),
      conversion: ((): ComparisonTier => {
        const u = seededUnit(s + 4);
        if (u > 0.55) {
          return { level: "green", label: "RDV en ligne + relance CRM" };
        }
        if (u > 0.2) {
          return { level: "orange", label: "Formulaire contact" };
        }
        return { level: "red", label: "Peu de conversion" };
      })(),
      mobile: mobGreen
        ? { level: "green", label: "Site responsive" }
        : { level: "orange", label: "Mobile correct" },
    });
  }

  applyPenalty(prospect, competitors);

  return {
    sectorLabel: sector,
    cityLabel: city,
    disclaimer:
      "⚠️ Données simulées pour démonstration — Version Pro pour données réelles",
    rows: [prospect, ...competitors],
  };
}
