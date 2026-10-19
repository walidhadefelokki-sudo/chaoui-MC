/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface User {
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'commercial';
}

// Client types: Vente ou Vente et Réparation
export type ClientType = 'vente' | 'vente_reparation';

export type EtapeCommande = 
  | 'diagnostic_demontage' 
  | 'remplacement_pignonnerie' 
  | 'remontage_calage' 
  | 'test_banc_livraison';

export type CategorieComposantBV = 
  | 'pignon'
  | 'bague_frein'
  | 'synchroniseur'
  | 'arbre'
  | 'roulement'
  | 'fourchette'
  | 'joint_etancheite'
  | 'boite_complete'
  | 'autre_organe';

export type DetailVente = 
  | 'Pignons & Trains d\'engrenages'
  | 'Bagues de frein & Cônes synchro'
  | 'Synchroniseurs & Baladeurs'
  | 'Arbres de boîte (Primaire, Secondaire, Intermédiaire)'
  | 'Roulements & Cages à aiguilles'
  | 'Fourchettes & Tringlerie de commande'
  | 'Joints d\'étanchéité, Spi & Pochettes carter'
  | 'Boîte de vitesses complète'
  | 'Kit d\'embrayage complet'
  | 'Ralentisseur (Retarder)'
  | 'Servo-débrayage & Commandes'
  | 'Pièces de rechange diverses'
  | 'Autre';

export type SegmentVehicule = 'camion' | 'bus' | 'tracteur';

export interface ClientProductItem {
  id: string;
  produit: string;
  detailVente?: DetailVente;
  segment?: SegmentVehicule | string;
  quantite: number;
  prixBase: number;
  remise: boolean;
  tauxRemise: number;
  prixApresRemise: number;
  tvaApplicable?: boolean;
}

export interface Client {
  id: string;
  nomPrenom: string;
  telephone: string;
  email: string;
  nis: string; // Numéro d'identité de statistique
  nif: string; // Numéro d'identité fiscale
  rc: string; // Numéro de registre de commerce
  numArticle: string; // Numéro d'article d'imposition
  retour: string; // Remarques de retour
  remise: boolean; // Remise oui/non
  prixBase: number; // Prix brut de base
  tauxRemise: number; // Pourcentage de remise %
  prixApresRemise: number; // Prix final après remise HT
  detailVente?: DetailVente; // Détail de vente
  tvaApplicable?: boolean; // TVA 19% applicable (Oui / Non)
  segment?: SegmentVehicule | string; // Type de véhicule: Camion, Bus, Tracteur
  produit?: string; // Modèle de boîte de vitesses ou pièce principale
  produits?: ClientProductItem[]; // Liste de plusieurs produits/articles commandés
  typeClient?: ClientType; // Type de client: Vente ou Vente et Réparation
  etapeCommande?: EtapeCommande; // Étape de la commande (si rénovation/atelier BV)
  quantite?: number; // Quantité achetée
  dateAchat?: string; // Date d'achat
  montantPaye?: number; // Montant payé en DA
  modePaiement?: 'cash' | 'cheque'; // Moyen de paiement (cash ou chèque)
  chequeNomPrenom?: string; // Nom et prénom pour le chèque
  chequeBanque?: string; // Banque émettrice du chèque
  chequeReference?: string; // Référence / N° du chèque
  delaiRealisation?: string; // Délai de réalisation (Proforma)
  rendezVous?: string; // Rendez-vous pris (Proforma)
  isProforma?: boolean; // Facture proforma uniquement
  createdAt: string;
  // Legacy optional file fields (null / unused)
  bonCommande?: AttachedFile | null;
  facture?: AttachedFile | null;
  bonLivraison?: AttachedFile | null;
}

export interface ProformaInvoice {
  id: string;
  nomPrenom: string;
  telephone?: string;
  email?: string;
  nis?: string;
  nif?: string;
  rc?: string;
  numArticle?: string;
  dateCreation: string;
  delaiRealisation?: string;
  rendezVous?: string;
  produits: ClientProductItem[];
  tvaApplicable?: boolean;
  notes?: string;
  typeClient?: ClientType;
  createdAt: string;
}

export interface SupplierProductItem {
  id: string;
  produit: string;
  prixUnitaire: number;
  quantite: number;
  type?: 'matiere_premiere' | 'produit_fini';
  unite?: string;
  transit?: number;
  margeBeneficiaire?: number;
}

export interface Supplier {
  id: string;
  nomPrenom: string;
  telephone?: string;
  articleAchete: string;
  prixUnitaire: number;
  quantite: number;
  dateAchat: string;
  livre: boolean;
  createdAt: string;
  produits?: SupplierProductItem[];
  montantPaye?: number;
  tvaApplicable?: boolean;
  devis?: AttachedFile | null;
}

export interface StockItem {
  id: string;
  nom: string; // Article (désignation de l'article)
  reference: string; // Référence pièce / OEM
  marque: string; // Marque (ZF, Eaton, Mercedes, Volvo, Scania, Euroricambi, CEI, etc.)
  quantite: number; // Quantité en stock
  prixAchat: number; // Prix d'achat en DA
  prixVente: number; // Prix de vente en DA
  rechercheUrl?: string; // Lien de recherche d'image optimisé Google
  imageUrl?: string; // URL directe de l'image de la pièce (optionnel)
  // Compatibility helpers
  referencePiece?: string;
  quantiteInitiale?: number;
  prixUnitaireMoyen?: number;
  type?: 'matiere_premiere' | 'produit_fini';
  unite?: string;
  seuilAlerte?: number;
  fournisseurNom?: string;
  fournisseurTelephone?: string;
  categorieBV?: CategorieComposantBV;
  boiteCompatible?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  typeMouvement: 'ENTREE' | 'SORTIE';
  date: string;
  produit: string;
  quantite: number;
  unite: string;
  typeArticle: 'matiere_premiere' | 'produit_fini';
  nomUtilisateur: string;
  tierNom?: string;
  motif?: string;
  createdAt: string;
}
