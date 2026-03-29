/**
 * Heuristique : formulaire de contact « basique » (peu de champs, pas d’intégration CRM évidente).
 * Utilisé pour l’argument commercial OPLead.
 */
export function detectBasicContactForm(html: string): boolean {
  const lower = html.toLowerCase();
  if (!lower.includes("<form")) return false;

  const formMatch = html.match(/<form[\s\S]*?<\/form>/i);
  if (!formMatch) return false;
  const formHtml = formMatch[0];

  const inputTags = formHtml.match(/<input[^>]*>/gi) || [];
  let visibleInputs = 0;
  for (const tag of inputTags) {
    if (/type\s*=\s*["']hidden["']/i.test(tag)) continue;
    visibleInputs += 1;
  }
  const textareaCount = (formHtml.match(/<textarea\b/gi) || []).length;
  const fields = visibleInputs + textareaCount;

  const hasCrmHint = /webhook|zapier|make\.com|hubspot|salesforce|pipedrive|notion\.so|airtable|brevo|sendinblue|crm|n8n|integromat/i.test(
    formHtml,
  );
  const actionMailto = /action\s*=\s*["']mailto:/i.test(formHtml);
  const actionEmptyOrHash =
    /action\s*=\s*["']#["']/i.test(formHtml) || !/\baction\s*=/i.test(formHtml);

  if (hasCrmHint) return false;
  if (fields <= 0) return false;
  if (fields <= 4 && (actionMailto || actionEmptyOrHash)) return true;
  if (fields <= 3) return true;
  return false;
}
