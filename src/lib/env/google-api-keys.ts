/**
 * Résolution des clés Google Cloud : une seule variable `GOOGLE_API_KEY`
 * peut alimenter PageSpeed et Places ; les noms historiques restent supportés.
 */

function trimEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

/** Clé partagée explicite (recommandée si une seule clé pour tout). */
export function getGoogleUnifiedKey(): string | undefined {
  return trimEnv("GOOGLE_API_KEY");
}

export function getGooglePageSpeedKey(): string | undefined {
  return getGoogleUnifiedKey() || trimEnv("GOOGLE_PAGESPEED_API_KEY");
}

export function getGooglePlacesKey(): string | undefined {
  return (
    getGoogleUnifiedKey() ||
    trimEnv("GOOGLE_PLACES_API_KEY") ||
    trimEnv("GOOGLE_PAGESPEED_API_KEY")
  );
}

export function isGooglePageSpeedConfigured(): boolean {
  return Boolean(getGooglePageSpeedKey());
}
