/**
 * Estime l'année de conception du design d'un site web
 * en croisant plusieurs signaux dans le HTML source.
 */

export interface DesignAgeEstimate {
  /** Année estimée de conception du design */
  estimatedYear: number;
  /** Ancienneté en années */
  ageYears: number;
  /** Confiance dans l'estimation */
  confidence: "high" | "medium" | "low";
  /** Signaux détectés (pour debug / affichage) */
  signals: string[];
}

/** Cherche un copyright "© 20XX" ou "copyright 20XX" dans le footer ou le body */
function detectCopyrightYear(html: string): number | null {
  // Cherche dans le <footer> en priorité
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  const zone = footerMatch ? footerMatch[0] : html;

  const patterns = [
    /©\s*(\d{4})/g,
    /copyright\s*(\d{4})/gi,
    /&copy;\s*(\d{4})/g,
  ];

  const years: number[] = [];
  for (const rx of patterns) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(zone)) !== null) {
      const y = parseInt(m[1], 10);
      if (y >= 2005 && y <= 2030) {
        years.push(y);
      }
    }
  }

  if (years.length === 0) return null;
  // On prend l'année la plus récente trouvée pour le copyright (souvent la mise à jour annuelle)
  // mais on garde Math.min ailleurs pour la "conception". 
  // Ici, si on voit 2025/2026, c'est que le site est maintenu/récent.
  const maxYear = Math.max(...years);
  if (maxYear >= 2025) return maxYear;
  
  return Math.min(...years);
}

/** Détecte la version de WordPress via la balise generator */
function detectWordpressVersion(html: string): number | null {
  const m = html.match(/<meta\s+name=["']generator["']\s+content=["']WordPress\s+(\d+)\.(\d+)/i);
  if (!m) return null;
  return parseFloat(`${m[1]}.${m[2]}`);
}

/** Détections de tech modernes (images, protocoles) */
function hasModernAssets(html: string): boolean {
  const h = html.toLowerCase();
  // WebP ou Avif
  if (h.includes(".webp") || h.includes(".avif")) return true;
  // HSTS ou indices de sécurité moderne
  if (h.includes("strict-transport-security")) return true;
  return false;
}

/** Check si Divi ou Elementor est présent */
function hasModernThemeBuilder(html: string): boolean {
  const h = html.toLowerCase();
  return h.includes("divi") || h.includes("elementor");
}

/** Détecte la version de jQuery pour estimer l'époque */
function detectJQueryEra(html: string): number | null {
  // jquery-1.x.x ou jquery.min.js?v=1.x
  const m = html.match(/jquery[.\-/]?(\d+)\.(\d+)/i);
  if (!m) return null;
  const major = parseInt(m[1], 10);
  const minor = parseInt(m[2], 10);

  if (major === 1) {
    if (minor <= 7) return 2012;
    if (minor <= 9) return 2013;
    if (minor <= 11) return 2014;
    return 2015;
  }
  if (major === 2) return 2016;
  if (major === 3) {
    if (minor <= 3) return 2018;
    if (minor <= 5) return 2020;
    return 2022;
  }
  return null;
}

/** Détecte la version de Bootstrap */
function detectBootstrapEra(html: string): number | null {
  // bootstrap/3.x, bootstrap@4.x, bootstrap/5.x, bootstrap.min.css?v=...
  const m = html.match(/bootstrap[./@\-](\d+)(?:\.(\d+))?/i);
  if (!m) return null;
  const major = parseInt(m[1], 10);

  if (major === 2) return 2013;
  if (major === 3) return 2015;
  if (major === 4) return 2018;
  if (major === 5) return 2021;
  return null;
}

/** Détecte les patterns CSS pour estimer l'époque du design */
function detectCssEra(html: string): number | null {
  const h = html.toLowerCase();

  // Compteurs de "signaux d'époque"
  let modernScore = 0;
  let legacyScore = 0;

  // CSS Grid = moderne (2018+)
  if (/display\s*:\s*grid/i.test(h) || /grid-template/i.test(h)) modernScore += 3;

  // Flexbox = moyen (2016+)
  if (/display\s*:\s*flex/i.test(h)) modernScore += 1;

  // CSS custom properties = moderne (2019+)
  if (/var\s*\(\s*--/i.test(h)) modernScore += 2;

  // Floats en masse = ancien
  const floatCount = (h.match(/float\s*:\s*(left|right)/gi) || []).length;
  if (floatCount > 3) legacyScore += 2;

  // Tables de mise en page = très ancien
  const tableLayoutCount = (h.match(/<table[^>]*(?:width|cellpadding|cellspacing)/gi) || []).length;
  if (tableLayoutCount > 2) legacyScore += 4;

  // clearfix = ancien (2012-2016)
  if (/clearfix/i.test(h)) legacyScore += 1;

  if (legacyScore >= 4) return 2012;
  if (legacyScore >= 2 && modernScore === 0) return 2015;
  if (modernScore >= 3) return 2021;
  if (modernScore >= 1) return 2019;

  return null;
}

/** Détecte le thème WordPress et son ancienneté */
function detectWordPressThemeYear(html: string): number | null {
  // WordPress expose souvent des liens vers les fichiers du thème
  const themeMatch = html.match(/wp-content\/themes\/([a-z0-9_-]+)/i);
  if (!themeMatch) return null;

  const theme = themeMatch[1].toLowerCase();

  // Thèmes WordPress par défaut avec leur année connue
  const defaultThemes: Record<string, number> = {
    "twentyten": 2010,
    "twentyeleven": 2011,
    "twentytwelve": 2012,
    "twentythirteen": 2013,
    "twentyfourteen": 2014,
    "twentyfifteen": 2015,
    "twentysixteen": 2016,
    "twentyseventeen": 2017,
    "twentynineteen": 2019,
    "twentytwenty": 2020,
    "twentytwentyone": 2021,
    "twentytwentytwo": 2022,
    "twentytwentythree": 2023,
    "twentytwentyfour": 2024,
    "twentytwentyfive": 2025,
  };

  if (defaultThemes[theme]) return defaultThemes[theme];

  // Thèmes populaires connus anciens
  const oldThemes = ["flavor", "flavor", "flavor", "flavor", "flavor"];
  if (oldThemes.includes(theme)) return 2016;

  return null;
}

/**
 * Estime l'année de conception initiale du design du site.
 * Croise copyright, versions de libs, patterns CSS et thème CMS.
 */
export function estimateDesignAge(html: string | null): DesignAgeEstimate | null {
  if (!html || html.length < 200) return null;

  const signals: { year: number; weight: number; label: string }[] = [];

  const copyright = detectCopyrightYear(html);
  // RÈGLE PRIORITAIRE : Si copyright 2025+, c'est un signal très fort de fraîcheur
  if (copyright && copyright >= 2025) {
    signals.push({ year: copyright, weight: 10, label: `Copyright récent © ${copyright}` });
  } else if (copyright) {
    signals.push({ year: copyright, weight: 3, label: `Copyright © ${copyright}` });
  }

  // RÈGLE MODERNE : Thème Builder (Divi/Ele) + Assets modernes (WebP/SSL)
  const isModern = hasModernThemeBuilder(html) && hasModernAssets(html);
  if (isModern) {
    signals.push({ year: 2025, weight: 5, label: "Stack moderne (Builder + WebP/SSL)" });
  }

  const wpVersion = detectWordpressVersion(html);
  if (wpVersion) {
    signals.push({ year: wpVersion >= 6 ? 2024 : 2021, weight: 2, label: `WordPress v${wpVersion}` });
  }

  const jquery = detectJQueryEra(html);
  if (jquery) {
    // Si stack moderne active, on réduit le poids du vieux jQuery (Divi embarque souvent du vieux jQuery pour compat)
    signals.push({ year: jquery, weight: isModern ? 0.5 : 2, label: `jQuery (~${jquery})` });
  }

  const bootstrap = detectBootstrapEra(html);
  if (bootstrap) {
    signals.push({ year: bootstrap, weight: 2, label: `Bootstrap (~${bootstrap})` });
  }

  const cssEra = detectCssEra(html);
  if (cssEra) {
    signals.push({ year: cssEra, weight: 1, label: `Patterns CSS (~${cssEra})` });
  }

  const wpTheme = detectWordPressThemeYear(html);
  if (wpTheme) {
    signals.push({ year: wpTheme, weight: 3, label: `Thème WordPress (~${wpTheme})` });
  }

  if (signals.length === 0) return null;

  // Moyenne pondérée des signaux
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weightedYear = signals.reduce((sum, s) => sum + s.year * s.weight, 0) / totalWeight;
  let estimatedYear = Math.round(weightedYear);

  // GARDE-FOU WP 6.x : Pas de design "obsolète" (>= 5 ans, soit < 2021) si WordPress est moderne
  const currentYear = new Date().getFullYear();
  if (wpVersion && wpVersion >= 6 && estimatedYear < 2021) {
    estimatedYear = 2022; // Remonte à une époque "Vieillissant" mais pas "Obsolète"
  }

  // GARDE-FOU Copyright récent : On ne peut pas être plus vieux de 2 ans que le copyright si celui-ci est 2025+
  if (copyright && copyright >= 2025 && estimatedYear < copyright - 1) {
    estimatedYear = copyright - 1;
  }

  const ageYears = currentYear - estimatedYear;

  const confidence: "high" | "medium" | "low" =
    signals.length >= 3 ? "high" : signals.length >= 2 ? "medium" : "low";

  return {
    estimatedYear,
    ageYears: Math.max(0, ageYears),
    confidence,
    signals: signals.map((s) => s.label),
  };
}

