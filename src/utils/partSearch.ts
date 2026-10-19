/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds an ultra-optimized search query for truck & bus gearbox spare parts.
 * Combines reference OEM, part designation, brand, and targeted transmission keywords.
 */
export function buildOptimizedPartQuery(nom: string, reference: string, marque?: string): string {
  const parts: string[] = [];
  
  const cleanRef = (reference || '').trim();
  const cleanNom = (nom || '').trim();
  const cleanMarque = (marque && marque !== 'Autre' && marque !== 'all') ? marque.trim() : '';

  if (cleanRef) {
    parts.push(cleanRef);
  }
  if (cleanNom) {
    parts.push(cleanNom);
  }
  if (cleanMarque) {
    parts.push(cleanMarque);
  }

  // Keywords to target catalogs, technical drawings, exploded views, and real product photos
  parts.push('boite de vitesse camion piece');

  return parts.join(' ');
}

/**
 * Generates an optimized Google Images search link for the given part.
 * Opens directly into Google Images showing real photos, diagrams, and exploded views.
 */
export function generatePartImageSearchUrl(nom: string, reference: string, marque?: string): string {
  const query = buildOptimizedPartQuery(nom, reference, marque);
  if (!query.replace('boite de vitesse camion piece', '').trim()) {
    return '';
  }
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

/**
 * Generates an optimized Google Web search link for suppliers, references, and technical sheets.
 */
export function generatePartWebSearchUrl(nom: string, reference: string, marque?: string): string {
  const query = buildOptimizedPartQuery(nom, reference, marque);
  if (!query.replace('boite de vitesse camion piece', '').trim()) {
    return '';
  }
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
