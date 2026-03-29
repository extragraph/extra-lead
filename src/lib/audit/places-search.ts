/** Client minimal Places API (New) — recherche texte. */

const PLACES_SEARCH_TEXT = "https://places.googleapis.com/v1/places:searchText";

export interface PlaceSearchHit {
  id: string;
  name: string;
  website: string;
  address?: string;
}

type PlacesSearchResponse = {
  places?: Array<{
    id?: string;
    name?: string;
    displayName?: { text?: string } | string;
    formattedAddress?: string;
    websiteUri?: string;
  }>;
};

function readDisplayName(p: {
  displayName?: { text?: string } | string;
}): string {
  const d = p.displayName;
  if (!d) return "Établissement";
  if (typeof d === "string") return d;
  return d.text?.trim() || "Établissement";
}

export type PlacesSearchResult = PlaceSearchHit[] | { error: string };

/**
 * Recherche texte (Essentials — champs limités pour limiter le coût SKU).
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export async function searchTextPlaces(
  apiKey: string,
  textQuery: string,
  maxResults = 20,
): Promise<PlacesSearchResult> {
  const res = await fetch(PLACES_SEARCH_TEXT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri",
    },
    body: JSON.stringify({
      textQuery: textQuery.trim(),
      languageCode: "fr",
      maxResultCount: Math.min(Math.max(1, maxResults), 20),
    }),
    cache: "no-store",
  });

  const rawText = await res.text();
  if (!res.ok) {
    return { error: `Places HTTP ${res.status}: ${rawText.slice(0, 400)}` };
  }

  let json: PlacesSearchResponse;
  try {
    json = JSON.parse(rawText) as PlacesSearchResponse;
  } catch {
    return { error: "Réponse Places invalide (JSON)." };
  }

  const out: PlaceSearchHit[] = [];
  for (const p of json.places ?? []) {
    const website = p.websiteUri?.trim();
    if (!website) continue;
    out.push({
      id: p.id || p.name || `place-${out.length}`,
      name: readDisplayName(p),
      website,
      address: p.formattedAddress,
    });
  }

  return out;
}
