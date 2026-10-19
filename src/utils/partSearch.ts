/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds an ultra-optimized Google search query for heavy vehicle & bus gearbox spare parts.
 * Supports OEM references with or without spaces/dots, designations, and manufacturer brands
 * across any website or brand worldwide (ZF, Eaton, Euroricambi, CEI, Mercedes, Volvo, etc.).
 */
export function buildOptimizedPartQuery(nom: string, reference: string, marque?: string): string {
  const parts: string[] = [];
  
  const cleanRef = (reference || '').trim();
  const cleanNom = (nom || '').trim();
  const cleanMarque = (marque && marque !== 'Autre' && marque !== 'all') ? marque.trim() : '';

  // 1. Reference: if it contains spaces or dashes, search both exact and unspaced
  if (cleanRef) {
    const unspaced = cleanRef.replace(/[\s\-_.]/g, '');
    if (unspaced && unspaced !== cleanRef) {
      parts.push(`("${cleanRef}" OR ${unspaced})`);
    } else {
      parts.push(`"${cleanRef}"`);
    }
  }

  // 2. Part designation / Nom de l'article
  if (cleanNom) {
    parts.push(cleanNom);
  }

  // 3. Brand if specified
  if (cleanMarque) {
    parts.push(cleanMarque);
  }

  // 4. Heavy transmission keywords to lock on automotive spare parts & exploded technical catalogs
  parts.push('(camion OR boite de vitesse OR truck OR gearbox OR piece)');

  return parts.join(' ');
}

/**
 * Generates an ultra-optimized Google Images search link for the given part.
 * Opens directly into Google Images showing real photos, diagrams, and exploded views from any brand/site.
 */
export function generatePartImageSearchUrl(nom: string, reference: string, marque?: string): string {
  const cleanRef = (reference || '').trim();
  const cleanNom = (nom || '').trim();
  if (!cleanRef && !cleanNom) {
    return '';
  }

  const query = buildOptimizedPartQuery(cleanNom, cleanRef, marque);
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

/**
 * Generates an optimized Google Web search link for technical sheets, catalogs & cross-references.
 */
export function generatePartWebSearchUrl(nom: string, reference: string, marque?: string): string {
  const cleanRef = (reference || '').trim();
  const cleanNom = (nom || '').trim();
  if (!cleanRef && !cleanNom) {
    return '';
  }

  const query = buildOptimizedPartQuery(cleanNom, cleanRef, marque);
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
