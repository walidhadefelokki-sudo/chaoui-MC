/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategorieComposantBV } from '../types';

export interface GearboxCatalogItem {
  id: string;
  nom: string;
  categorie: CategorieComposantBV;
  referencePiece: string;
  marque?: string;
  boiteCompatible: string;
  prixMoyen: number;
  prixAchat?: number;
  prixVente?: number;
  unite: string;
  type: 'matiere_premiere' | 'produit_fini';
  description?: string;
}

export interface CategoryBVDefinition {
  id: CategorieComposantBV;
  label: string;
  shortLabel: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const CATEGORIES_BV: CategoryBVDefinition[] = [
  {
    id: 'pignon',
    label: 'Pignons & Trains d\'engrenages',
    shortLabel: 'Pignons',
    iconName: 'Cog',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300',
    badgeText: '⚙️ Pignon',
    description: 'Pignons de vitesses (1ère à 6ème), pignon de marche arrière, pignons fous et fixes, trains d\'attaque et réducteurs.'
  },
  {
    id: 'bague_frein',
    label: 'Bagues de frein & Cônes de friction',
    shortLabel: 'Bagues de frein',
    iconName: 'Disc',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-300',
    badgeText: '🛑 Bague de frein',
    description: 'Bagues de frein de synchroniseur en bronze, molybdène ou carbone, bagues d\'arrêt et cônes intermédiaires de friction.'
  },
  {
    id: 'synchroniseur',
    label: 'Synchroniseurs & Baladeurs',
    shortLabel: 'Synchroniseurs',
    iconName: 'RefreshCw',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    badgeBg: 'bg-indigo-100/90 text-indigo-900 border-indigo-300',
    badgeText: '🔄 Synchroniseur',
    description: 'Baladeurs de vitesse (1ère/2ème, 3ème/4ème, Splitter), moyeux / corps de synchro, clavettes, ressorts et kits complets.'
  },
  {
    id: 'arbre',
    label: 'Arbres de boîte & Contre-arbres',
    shortLabel: 'Arbres',
    iconName: 'Layers',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
    badgeText: '🪵 Arbre BV',
    description: 'Arbre primaire (entrée), arbre secondaire (principal cannelé), contre-arbre / arbre intermédiaire, axes de marche arrière.'
  },
  {
    id: 'roulement',
    label: 'Roulements & Cages à aiguilles',
    shortLabel: 'Roulements',
    iconName: 'CircleDot',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100/90 text-blue-900 border-blue-300',
    badgeText: '⭕ Roulement',
    description: 'Roulements à rouleaux coniques, roulements à billes, roulements à rouleaux cylindriques, cages à aiguilles de pignon fou.'
  },
  {
    id: 'fourchette',
    label: 'Fourchettes & Tringlerie de passage',
    shortLabel: 'Fourchettes',
    iconName: 'Wrench',
    colorClass: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    badgeBg: 'bg-cyan-100/90 text-cyan-900 border-cyan-300',
    badgeText: '🔧 Fourchette',
    description: 'Fourchettes de passage des vitesses, doigts de sélection, coulisseaux, tiges de commande et patins de fourchette.'
  },
  {
    id: 'joint_etancheite',
    label: 'Joints d\'étanchéité & Bagues spi',
    shortLabel: 'Joints & Spi',
    iconName: 'Shield',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200',
    badgeBg: 'bg-teal-100/90 text-teal-900 border-teal-300',
    badgeText: '🛡️ Joint spi',
    description: 'Bagues d\'étanchéité spi arbre primaire, joint spi bride de sortie, pochettes complètes de joints toriques et carter.'
  },
  {
    id: 'boite_complete',
    label: 'Boîtes de vitesses complètes',
    shortLabel: 'Boîtes complètes',
    iconName: 'Box',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    badgeBg: 'bg-purple-100/90 text-purple-900 border-purple-300',
    badgeText: '📦 Boîte complète',
    description: 'Ensembles boîtes de vitesses complètes reconditionnées ou révisées avec garantie atelier.'
  },
  {
    id: 'autre_organe',
    label: 'Embrayages, Ralentisseurs & Commandes',
    shortLabel: 'Autres organes',
    iconName: 'Cpu',
    colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: '⚙️ Organe BV',
    description: 'Kits d\'embrayage bi-disque/mono-disque, ralentisseurs hydrauliques Voith/ZF, servo-débrayages pneumatiques, valves split.'
  }
];

export const CATALOG_PRESET_ITEMS: GearboxCatalogItem[] = [
  // 1. PIGNONS
  {
    id: 'cat-pig-1',
    nom: 'Pignon 1ère Vitesse Arbre Secondaire (ZF 16S)',
    categorie: 'pignon',
    referencePiece: 'ZF 1315 304 022 / EUR 95531022',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S221 / 16S2220',
    prixMoyen: 88000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Pignon fou de 1ère vitesse taillé hélicoïdal pour arbre secondaire avec portée de cage à aiguilles rectifiée.'
  },
  {
    id: 'cat-pig-2',
    nom: 'Pignon 2ème Vitesse Arbre Secondaire (ZF 16S)',
    categorie: 'pignon',
    referencePiece: 'ZF 1315 304 024 / EUR 95531024',
    boiteCompatible: 'ZF 16S1820 / 16S2220 TD/TO',
    prixMoyen: 82000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Pignon denté de 2ème rapport avec surface de frottement conique pour bague de frein.'
  },
  {
    id: 'cat-pig-3',
    nom: 'Pignon 3ème Vitesse Arbre Secondaire (Mercedes G240/G281)',
    categorie: 'pignon',
    referencePiece: 'A 945 262 61 23 / CEI 154.218',
    boiteCompatible: 'Mercedes-Benz Actros G211 / G240 / G281 PowerShift',
    prixMoyen: 95000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Pignon hélicoïdal traité thermiquement haute résistance pour boîte PowerShift.'
  },
  {
    id: 'cat-pig-4',
    nom: 'Pignon 4ème Vitesse Arbre Secondaire (Volvo I-Shift)',
    categorie: 'pignon',
    referencePiece: 'VOL 20739942 / EUR 95570142',
    boiteCompatible: 'Volvo I-Shift AT2412 / AT2612 / VT2514',
    prixMoyen: 105000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Pignon arbre secondaire pour boîte automatisée Volvo FH/FM.'
  },
  {
    id: 'cat-pig-5',
    nom: 'Pignon de Marche Arrière (AR) & Pignon Fou Inverseur',
    categorie: 'pignon',
    referencePiece: 'ZF 1315 304 040 / CEI 130.340',
    boiteCompatible: 'ZF 16S151 à 16S2520 / Renault Trucks & MAN',
    prixMoyen: 76000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Pignon inverseur de marche arrière taillé droit/hélicoïdal avec bague bronze de guidage.'
  },
  {
    id: 'cat-pig-6',
    nom: 'Pignon d\'Attaque / Prise Constante Arbre Primaire',
    categorie: 'pignon',
    referencePiece: 'ZF 1315 202 015 / EUR 95530115',
    boiteCompatible: 'ZF Ecosplit 16S181 / 16S221',
    prixMoyen: 115000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Pignon d\'entrée menant engrené en permanence sur le train fixe intermédiaire.'
  },
  {
    id: 'cat-pig-7',
    nom: 'Couronne Planétaire Réducteur de Gamme (Groupe Relais / Range)',
    categorie: 'pignon',
    referencePiece: 'ZF 1315 332 008 / CEI 139.108',
    boiteCompatible: 'ZF 16S1820 / 16S2220 / Ecosplit',
    prixMoyen: 145000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Couronne à denture intérieure pour réducteur planétaire épicycloïdal de relais arrière.'
  },
  {
    id: 'cat-pig-8',
    nom: 'Train de Pignons Contre-Arbre (Arbre Intermédiaire Fixe)',
    categorie: 'pignon',
    referencePiece: 'ZF 1315 203 018 / CEI 135.018',
    boiteCompatible: 'ZF 16S Ecosplit / Renault Premium / Kerax',
    prixMoyen: 165000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bloc compact ou train denté d\'engrenages fixes d\'arbre intermédiaire.'
  },

  // 2. BAGUES DE FREIN & CÔNES DE FRICTION
  {
    id: 'cat-bg-1',
    nom: 'Bague de Frein de Synchroniseur Molybdène 1ère/2ème (ZF 16S)',
    categorie: 'bague_frein',
    referencePiece: 'ZF 1315 304 125 / EUR 95534125',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S2220 Ecosplit',
    prixMoyen: 28500,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bague de frein de synchro conique avec revêtement projeté en molybdène anti-usure pour 1ère et 2ème vitesses.'
  },
  {
    id: 'cat-bg-2',
    nom: 'Bague de Frein de Synchroniseur Bronze Rainuré 3ème/4ème (ZF 16S)',
    categorie: 'bague_frein',
    referencePiece: 'ZF 1315 304 089 / EUR 95534089',
    boiteCompatible: 'ZF 16S / Renault DXi / MAN TGA-TGX',
    prixMoyen: 24000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bague de frein en bronze spécial avec rainurage d\'évacuation d\'huile pour accroche optimale.'
  },
  {
    id: 'cat-bg-3',
    nom: 'Bague de Frein de Synchroniseur Carbone Haute Performance (Actros)',
    categorie: 'bague_frein',
    referencePiece: 'A 000 262 82 34 / CEI 154.534',
    boiteCompatible: 'Mercedes-Benz G211 / G240 / G281 PowerShift 2/3',
    prixMoyen: 34000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bague de friction avec couche frittée carbone pour boîtes robotisées soumises à fortes cadences.'
  },
  {
    id: 'cat-bg-4',
    nom: 'Bague de Frein Réducteur de Gamme / Relais Arrière (Range Group)',
    categorie: 'bague_frein',
    referencePiece: 'ZF 1295 332 026 / EUR 95534026',
    boiteCompatible: 'ZF 16S / 8S / Ecosplit',
    prixMoyen: 31000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bague de frein spécifique pour synchroniseur de passage petite vitesse / grande vitesse.'
  },
  {
    id: 'cat-bg-5',
    nom: 'Cône Intermédiaire de Synchronisation Double Cône (ZF / Scania)',
    categorie: 'bague_frein',
    referencePiece: 'ZF 1315 304 118 / SCA 1779214',
    boiteCompatible: 'ZF Ecosplit / Scania GRS895 / GRS905',
    prixMoyen: 38000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Cône de frottement intérieur/extérieur pour système de synchronisation double cône.'
  },
  {
    id: 'cat-bg-6',
    nom: 'Jeu de Rondelles de Calage & Bagues de Butée Axiale',
    categorie: 'bague_frein',
    referencePiece: 'ZF 0730 102 540 / EUR Kit 95500',
    boiteCompatible: 'Toutes boîtes ZF 16S / Mercedes / Volvo',
    prixMoyen: 16500,
    unite: 'Jeux',
    type: 'matiere_premiere',
    description: 'Assortiment de rondelles de calage d\'épaisseur calibrée (0.1mm à 0.5mm) pour réglage du jeu d\'arbres.'
  },

  // 3. SYNCHRONISEURS & BALADEURS
  {
    id: 'cat-syn-1',
    nom: 'Baladeur de Synchronisation 1ère / 2ème Vitesse (ZF 16S)',
    categorie: 'synchroniseur',
    referencePiece: 'ZF 1315 304 055 / EUR 95532055',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S2220 / MAN / DAF',
    prixMoyen: 62000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Manchon baladeur à denture interne traitée pour crabotage 1ère et 2ème vitesses.'
  },
  {
    id: 'cat-syn-2',
    nom: 'Baladeur de Synchronisation 3ème / 4ème Vitesse (ZF 16S)',
    categorie: 'synchroniseur',
    referencePiece: 'ZF 1315 304 058 / EUR 95532058',
    boiteCompatible: 'ZF 16S Ecosplit / Renault Trucks Kerax-Magnum',
    prixMoyen: 58000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Baladeur de sélection des rapports intermédiaires avec gorge de fourchette rectifiée.'
  },
  {
    id: 'cat-syn-3',
    nom: 'Corps / Moyeu de Synchroniseur avec Clavettes & Ressorts (ZF 16S)',
    categorie: 'synchroniseur',
    referencePiece: 'ZF 1315 304 062 / CEI 133.062',
    boiteCompatible: 'ZF 16S151 à 16S2520',
    prixMoyen: 46000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Moyeu fixe cannelé d\'arbre secondaire équipé de 3 clavettes de synchro et ressorts annulaires.'
  },
  {
    id: 'cat-syn-4',
    nom: 'Kit de Rénovation Synchroniseur Complet (Baladeur + 2 Bagues + Moyeu)',
    categorie: 'synchroniseur',
    referencePiece: 'EUR Kit 9554001 / CEI Kit 198.110',
    boiteCompatible: 'ZF 16S1820 / 16S2220 Ecosplit 3',
    prixMoyen: 128000,
    unite: 'Kits',
    type: 'matiere_premiere',
    description: 'Kit complet de révision incluant manchon baladeur, bagues de frein molybdène, moyeu et poussoirs.'
  },
  {
    id: 'cat-syn-5',
    nom: 'Baladeur de Groupe Relais Splitter (Demi-vitesses AV)',
    categorie: 'synchroniseur',
    referencePiece: 'ZF 1315 204 012 / EUR 95532012',
    boiteCompatible: 'ZF 16S181 / 16S2220 / Ecosplit',
    prixMoyen: 54000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Baladeur avant de dédoubleur de vitesses (Splitter GV / PV).'
  },
  {
    id: 'cat-syn-6',
    nom: 'Jeu de Clavettes de Synchro, Poussoirs & Ressorts (12 Pièces)',
    categorie: 'synchroniseur',
    referencePiece: 'ZF 0732 040 011 / EUR Kit 95530',
    boiteCompatible: 'Universel ZF 16S / 9S / 8S',
    prixMoyen: 9500,
    unite: 'Jeux',
    type: 'matiere_premiere',
    description: 'Ensemble de poussoirs, billes de verrouillage et ressorts de pré-synchronisation.'
  },

  // 4. ARBRES DE BOÎTE & AXES
  {
    id: 'cat-arb-1',
    nom: 'Arbre Primaire d\'Entrée de Boîte Cannelé (ZF 16S L=350mm)',
    categorie: 'arbre',
    referencePiece: 'ZF 1315 202 028 / EUR 95530028',
    boiteCompatible: 'ZF 16S1820 / 16S2220 (Renault Trucks DXi / Premium / MAN TGA)',
    prixMoyen: 148000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Arbre primaire d\'attaque avec cannelures de disque d\'embrayage trempées haute fréquence.'
  },
  {
    id: 'cat-arb-2',
    nom: 'Arbre Secondaire Principal Cannelé (ZF 16S Ecosplit)',
    categorie: 'arbre',
    referencePiece: 'ZF 1315 304 010 / CEI 132.010',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S221 / 16S2220',
    prixMoyen: 220000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Arbre principal de boîte avec pistes de roulements et canaux de lubrification sous pression.'
  },
  {
    id: 'cat-arb-3',
    nom: 'Contre-Arbre Inférieur / Arbre Intermédiaire (Mercedes G240-16)',
    categorie: 'arbre',
    referencePiece: 'A 945 260 41 05 / CEI 153.105',
    boiteCompatible: 'Mercedes-Benz Actros MP2/MP3/MP4 boîte G240 / G211',
    prixMoyen: 185000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Contre-arbre massif forgé haute précision supportant le train intermédiaire de pignons.'
  },
  {
    id: 'cat-arb-4',
    nom: 'Arbre Secondaire Long avec Bride de Sortie (Volvo I-Shift)',
    categorie: 'arbre',
    referencePiece: 'VOL 20739910 / EUR 95570010',
    boiteCompatible: 'Volvo I-Shift AT2412D / AT2612D / FH13 / FM',
    prixMoyen: 260000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Arbre de sortie principal pour transmission robotisée Volvo FH.'
  },
  {
    id: 'cat-arb-5',
    nom: 'Axe de Pignon de Marche Arrière avec Canaux de Lubrification',
    categorie: 'arbre',
    referencePiece: 'ZF 1315 305 005 / CEI 136.005',
    boiteCompatible: 'ZF 16S / Renault / MAN / DAF',
    prixMoyen: 32000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Axe fixe de guidage du pignon fou de marche arrière traité cémenté.'
  },

  // 5. ROULEMENTS & CAGES À AIGUILLES
  {
    id: 'cat-rlm-1',
    nom: 'Roulement à Rouleaux Coniques Avant Arbre Primaire (SKF / Timken)',
    categorie: 'roulement',
    referencePiece: 'SKF 32215 J2/Q / TIMKEN 32215',
    boiteCompatible: 'ZF 16S / Mercedes G240 / Volvo VT',
    prixMoyen: 32000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Roulement à rouleaux coniques à haute capacité de charge radiale et axiale combinée.'
  },
  {
    id: 'cat-rlm-2',
    nom: 'Roulement à Rouleaux Coniques Arrière Arbre Secondaire (Timken)',
    categorie: 'roulement',
    referencePiece: 'TIMKEN 32314 B / SKF 32314',
    boiteCompatible: 'ZF 16S1820 / 16S2220 / Ecosplit',
    prixMoyen: 38000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Roulement conique de palier arrière supportant l\'effort de poussée du réducteur planétaire.'
  },
  {
    id: 'cat-rlm-3',
    nom: 'Cage à Aiguilles Double Rangée Pignon 1ère / 2ème Vitesse (INA / FAG)',
    categorie: 'roulement',
    referencePiece: 'INA K 65x73x40 / ZF 0635 303 018',
    boiteCompatible: 'ZF 16S / Mercedes-Benz / Scania',
    prixMoyen: 18500,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Cage à aiguilles de précision pour pignon fou sur arbre secondaire, fonctionnement haute vitesse.'
  },
  {
    id: 'cat-rlm-4',
    nom: 'Cage à Aiguilles Pignon 3ème / 4ème Vitesse (INA)',
    categorie: 'roulement',
    referencePiece: 'INA K 60x68x35 / ZF 0635 303 022',
    boiteCompatible: 'ZF 16S151 à 16S2220',
    prixMoyen: 16000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Cage à aiguilles de pignon fou intermédiaire résistant aux chocs de passage de vitesses.'
  },
  {
    id: 'cat-rlm-5',
    nom: 'Roulement à Billes avec Gorge d\'Arrêt Arbre Primaire (FAG)',
    categorie: 'roulement',
    referencePiece: 'FAG 6312 NR / SKF 6312-2RS1N',
    boiteCompatible: 'ZF 16S / Fast Gear 12JSD / Shacman',
    prixMoyen: 26000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Roulement rigide à billes équipé de segment d\'arrêt pour positionnement axial dans le carter.'
  },
  {
    id: 'cat-rlm-6',
    nom: 'Jeu Complet de Roulements & Cages de Révision Boîte ZF 16S (Kit 8 pcs)',
    categorie: 'roulement',
    referencePiece: 'EUR Kit Roulements 95508 / SKF Master Kit',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S2220',
    prixMoyen: 145000,
    unite: 'Jeux',
    type: 'matiere_premiere',
    description: 'Ensemble complet des roulements primaires, secondaires, contre-arbre et cages à aiguilles pour réfection complète.'
  },

  // 6. FOURCHETTES & COMMANDES
  {
    id: 'cat-fch-1',
    nom: 'Fourchette de Passage 1ère / 2ème Vitesse Renforcée avec Patins (ZF 16S)',
    categorie: 'fourchette',
    referencePiece: 'ZF 1315 306 014 / EUR 95536014',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S2220',
    prixMoyen: 42000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Fourchette en acier forgé trempé avec patins d\'usure amovibles en bronze.'
  },
  {
    id: 'cat-fch-2',
    nom: 'Fourchette de Passage 3ème / 4ème Vitesse (ZF 16S)',
    categorie: 'fourchette',
    referencePiece: 'ZF 1315 306 018 / CEI 137.018',
    boiteCompatible: 'ZF 16S Ecosplit / Renault Trucks / MAN',
    prixMoyen: 39000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Fourchette de commande de boîte manuelle avec axe d\'entraînement alésé.'
  },
  {
    id: 'cat-fch-3',
    nom: 'Doigt de Sélection & Coulisseau d\'Axe Central de Commande',
    categorie: 'fourchette',
    referencePiece: 'ZF 1315 307 008 / EUR 95537008',
    boiteCompatible: 'ZF 16S / 9S / 8S',
    prixMoyen: 29000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Doigt d\'enclenchement de grille de sélection vitesses dans la tour de commande.'
  },

  // 7. JOINTS & ÉTANCHÉITÉ
  {
    id: 'cat-jnt-1',
    nom: 'Bague d\'Étanchéité / Joint Spi Arbre Primaire Viton Double Lèvre (ZF 16S)',
    categorie: 'joint_etancheite',
    referencePiece: 'ZF 0734 319 412 / CORTECO 12015412B',
    boiteCompatible: 'ZF 16S / Ecosplit / Renault DXi / MAN',
    prixMoyen: 6800,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bague d\'étanchéité radiale en Viton (FKM) résistant aux températures d\'huile jusqu\'à 160°C.'
  },
  {
    id: 'cat-jnt-2',
    nom: 'Joint Spi de Bride de Sortie de Boîte (Pont / Transmission)',
    categorie: 'joint_etancheite',
    referencePiece: 'ZF 0734 319 580 / CORTECO 12018580B',
    boiteCompatible: 'ZF 16S / Mercedes G240 / Scania GRS',
    prixMoyen: 8200,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Bague d\'étanchéité à lèvre antipoussière renforcée pour bride de transmission cardan.'
  },
  {
    id: 'cat-jnt-3',
    nom: 'Pochette Complète de Joints Carter, Toriques & Rondelles Cuivre (ZF 16S)',
    categorie: 'joint_etancheite',
    referencePiece: 'ZF 1315 298 005 / EUR Kit Joints 955005',
    boiteCompatible: 'ZF 16S151 / 16S181 / 16S221 / 16S2220',
    prixMoyen: 24500,
    unite: 'Kits',
    type: 'matiere_premiere',
    description: 'Kit complet de joints plats papier métallisé, joints toriques NBR/Viton et rondelles d\'étanchéité bouchons.'
  },

  // 8. BOÎTES COMPLÈTES (Produits Finis)
  {
    id: 'cat-box-1',
    nom: 'Boîte de Vitesses ZF 16S2220 TD Ecosplit Reconditionnée (Renault / MAN)',
    categorie: 'boite_complete',
    referencePiece: 'ZF 1316 055 120 / RECON CHAOUI BV-16S22',
    boiteCompatible: 'Renault Trucks Kerax/Premium/Magnum & MAN TGA/TGS',
    prixMoyen: 2450000,
    unite: 'Unités',
    type: 'produit_fini',
    description: 'Boîte de vitesses mécanique à 16 rapports révisée à neuf avec pignonnerie et synchros neufs, garantie atelier 12 mois.'
  },
  {
    id: 'cat-box-2',
    nom: 'Boîte de Vitesses Mercedes-Benz G281-12 PowerShift 3 (Actros MP4)',
    categorie: 'boite_complete',
    referencePiece: 'A 945 260 88 00 / MB G281-12 KL',
    boiteCompatible: 'Mercedes-Benz Actros 1845 / 1848 / 2042 / Antos',
    prixMoyen: 3100000,
    unite: 'Unités',
    type: 'produit_fini',
    description: 'Boîte automatisée 12 rapports révisée et calibrée avec servomoteur et capteurs d\'embrayage testés.'
  },
  {
    id: 'cat-box-3',
    nom: 'Boîte de Vitesses ZF Ecolife 6AP2000B Automatique (Bus & Autocars)',
    categorie: 'boite_complete',
    referencePiece: 'ZF 4192 001 024 / ECOLIFE 6AP',
    boiteCompatible: 'Bus Mercedes Citaro, MAN Lion\'s City, Iveco Urbanway, Higer',
    prixMoyen: 2950000,
    unite: 'Unités',
    type: 'produit_fini',
    description: 'Boîte automatique hydraulique à 6 rapports avec convertisseur de couple et ralentisseur intégré.'
  },
  {
    id: 'cat-box-4',
    nom: 'Boîte de Vitesses Scania GRS905R avec Ralentisseur R4100 (Série R/G/Streamline)',
    categorie: 'boite_complete',
    referencePiece: 'SCA 1932450 / GRS905R-OPT',
    boiteCompatible: 'Scania R420, R440, R480, G420, Streamline',
    prixMoyen: 2750000,
    unite: 'Unités',
    type: 'produit_fini',
    description: 'Boîte de vitesses 12+2 vitesses Opticruise avec ralentisseur hydraulique intégré Scania Retarder.'
  },
  {
    id: 'cat-box-5',
    nom: 'Boîte de Vitesses Volvo I-Shift AT2612D Reconditionnée (FH13 / FM)',
    categorie: 'boite_complete',
    referencePiece: 'VOL 21543200 / AT2612D-REC',
    boiteCompatible: 'Volvo Trucks FH 440 / 480 / 500 / 520 D13A/D13C',
    prixMoyen: 3250000,
    unite: 'Unités',
    type: 'produit_fini',
    description: 'Transmission robotisée 12 rapports I-Shift testée sur banc d\'essai charge avec huile synthétique 75W80.'
  },
  {
    id: 'cat-box-6',
    nom: 'Boîte de Vitesses Fast Gear 12JSD160T / 12JSD200T (Shacman / HOWO / CAMC)',
    categorie: 'boite_complete',
    referencePiece: 'FAST 12JSD160T-1701010 / SHACMAN',
    boiteCompatible: 'Camions chinois Shacman F2000/F3000, Sinotruk HOWO A7, CAMC, Foton',
    prixMoyen: 1750000,
    unite: 'Unités',
    type: 'produit_fini',
    description: 'Boîte manuelle à double arbre intermédiaire 12 rapports avant et 2 arrière, très robuste pour chantiers et carrières.'
  },

  // 9. AUTRES ORGANES
  {
    id: 'cat-org-1',
    nom: 'Kit d\'Embrayage Complet Sachs 430mm Renforcé (Disque + Mécanisme + Butée)',
    categorie: 'autre_organe',
    referencePiece: 'SACHS 3400 700 385 / EUR 95590385',
    boiteCompatible: 'Renault Trucks DXi / MAN TGX / Volvo FH / Mercedes Actros',
    prixMoyen: 195000,
    unite: 'Kits',
    type: 'matiere_premiere',
    description: 'Kit d\'embrayage complet monodisque 430mm avec garnitures organiques haute résistance et butée tirée.'
  },
  {
    id: 'cat-org-2',
    nom: 'Ralentisseur Hydraulique Voith Retarder VR 115 HV Reconditionné',
    categorie: 'autre_organe',
    referencePiece: 'VOITH VR115HV-02 / 153.000.320',
    boiteCompatible: 'Mercedes Actros, MAN TGA, DAF XF (accouplé en sortie BV)',
    prixMoyen: 750000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Ralentisseur hydraulique à huile de freinage secondaire haute puissance sans usure mécanique.'
  },
  {
    id: 'cat-org-3',
    nom: 'Servo-Débrayage Pneumatique Wabco / Knorr-Bremse Ø 100mm',
    categorie: 'autre_organe',
    referencePiece: 'WABCO 970 051 433 0 / KNORR VG3260',
    boiteCompatible: 'Renault Kerax, Iveco Stralis, MAN F2000',
    prixMoyen: 48000,
    unite: 'Unités',
    type: 'matiere_premiere',
    description: 'Cylindre récepteur d\'embrayage avec assistance pneumatique pour commande de débrayage douce.'
  }
];

/**
 * Automatically detects the component category from an item's name if not explicitly set
 */
export function detectCategory(nom: string): CategorieComposantBV {
  const lower = (nom || '').toLowerCase();

  // 1. Pignons
  if (
    lower.includes('pignon') || 
    lower.includes('engrenage') || 
    lower.includes('denture') || 
    lower.includes('planétaire') || 
    lower.includes('couronne dentée') || 
    lower.includes('train fixe') ||
    lower.includes('train de pignon')
  ) {
    return 'pignon';
  }

  // 2. Bagues de frein
  if (
    lower.includes('bague de frein') || 
    lower.includes('bague frein') || 
    lower.includes('cône de friction') || 
    lower.includes('cône synchro') || 
    lower.includes('bague d\'arrêt') ||
    lower.includes('rondelle de calage') ||
    lower.includes('bague de butée')
  ) {
    return 'bague_frein';
  }

  // 3. Synchroniseurs & Baladeurs
  if (
    lower.includes('synchro') || 
    lower.includes('synchroniseur') || 
    lower.includes('syncrou') || 
    lower.includes('baladeur') || 
    lower.includes('manchon baladeur') || 
    lower.includes('moyeu synchro') ||
    lower.includes('corps synchro') ||
    lower.includes('clavette')
  ) {
    return 'synchroniseur';
  }

  // 4. Arbres
  if (
    lower.includes('arbre') || 
    lower.includes('contre-arbre') || 
    lower.includes('axe de') || 
    lower.includes('arbre primaire') || 
    lower.includes('arbre secondaire') || 
    lower.includes('arbre intermédiaire') || 
    lower.includes('arbre d\'entrée') || 
    lower.includes('arbre de sortie')
  ) {
    return 'arbre';
  }

  // 5. Roulements
  if (
    lower.includes('roulement') || 
    lower.includes('cage à aiguille') || 
    lower.includes('cages à aiguille') || 
    lower.includes('timken') || 
    lower.includes('skf') || 
    lower.includes('fag') || 
    lower.includes('ina') ||
    lower.includes('rouleau conique')
  ) {
    return 'roulement';
  }

  // 6. Fourchettes & Commandes
  if (
    lower.includes('fourchette') || 
    lower.includes('doigt de sélection') || 
    lower.includes('coulisseau') || 
    lower.includes('tringlerie') || 
    lower.includes('axe de commande')
  ) {
    return 'fourchette';
  }

  // 7. Joints & Spi
  if (
    lower.includes('joint spi') || 
    lower.includes('bague d\'étanchéité') || 
    lower.includes('pochette de joint') || 
    lower.includes('joint torique') || 
    lower.includes('joint carter')
  ) {
    return 'joint_etancheite';
  }

  // 8. Boîtes complètes
  if (
    lower.includes('boîte de vitesse') || 
    lower.includes('boite de vitesse') || 
    lower.includes('boîte complète') || 
    lower.includes('boite complete') || 
    lower.includes('zf 16s') || 
    lower.includes('powershift') || 
    lower.includes('ecolife') || 
    lower.includes('i-shift') || 
    lower.includes('grs905') || 
    lower.includes('12jsd')
  ) {
    return 'boite_complete';
  }

  // 9. Autres organes
  return 'autre_organe';
}

/**
 * Returns metadata definition for a category
 */
export function getCategoryDefinition(catId?: CategorieComposantBV | string): CategoryBVDefinition {
  const found = CATEGORIES_BV.find(c => c.id === catId);
  if (found) return found;
  return {
    id: 'autre_organe',
    label: 'Autre composant BV',
    shortLabel: 'Autre',
    iconName: 'Package',
    colorClass: 'text-slate-600 bg-slate-50 border-slate-200',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: '⚙️ Organe BV',
    description: 'Composant mécanique de transmission'
  };
}

/**
 * Automatically infers brand/manufacturer from name or reference
 */
export function detectMarque(nom: string = '', ref: string = '', compat: string = ''): string {
  const combined = `${nom} ${ref} ${compat}`.toLowerCase();
  if (combined.includes('mercedes') || combined.includes('actros') || combined.includes('atego') || combined.includes('axor') || combined.includes('g281') || combined.includes('g240') || combined.includes('g330') || combined.includes('powershift')) return 'Mercedes-Benz';
  if (combined.includes('volvo') || combined.includes('i-shift') || combined.includes('ishift') || combined.includes('vt2214') || combined.includes('vt2514') || combined.includes('fh') || combined.includes('fm')) return 'Volvo';
  if (combined.includes('scania') || combined.includes('opticruise') || combined.includes('grs905') || combined.includes('grs900') || combined.includes('gr875')) return 'Scania';
  if (combined.includes('eaton') || combined.includes('fuller') || combined.includes('twin splitter') || combined.includes('roadranger')) return 'Eaton Fuller';
  if (combined.includes('euroricambi') || combined.includes('eur ')) return 'Euroricambi';
  if (combined.includes('cei') || combined.includes('cei-')) return 'CEI';
  if (combined.includes('skf') || combined.includes('timken') || combined.includes('fag') || combined.includes('koyo')) return 'SKF / Timken';
  if (combined.includes('corteco')) return 'Corteco';
  if (combined.includes('renault') || combined.includes('dxi') || combined.includes('kerax') || combined.includes('premium')) return 'Renault Trucks';
  if (combined.includes('man') || combined.includes('tgx') || combined.includes('tgs')) return 'MAN';
  if (combined.includes('iveco') || combined.includes('stralis') || combined.includes('eurotrakker')) return 'Iveco';
  if (combined.includes('fast') || combined.includes('12jsd') || combined.includes('shacman') || combined.includes('howo')) return 'Fast Gear';
  if (combined.includes('zf') || combined.includes('ecosplit') || combined.includes('ecolife') || combined.includes('traxon') || combined.includes('astronic')) return 'ZF';
  return 'ZF';
}

