/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, AttachedFile, StockItem, Supplier, ClientType, DetailVente, ClientProductItem } from '../types';
import { CATEGORIES_BV, CATALOG_PRESET_ITEMS } from '../lib/gearboxCatalog';
import { X, AlertCircle, ShoppingCart, Banknote, CreditCard, Wrench, Package, Sparkles, Search } from 'lucide-react';
import { generatePartImageSearchUrl } from '../utils/partSearch';

interface ClientFormModalProps {
  client: Client | null;
  onClose: () => void;
  onSave: (client: Client) => void;
  onViewFile?: (file: AttachedFile) => void;
  stockItems?: StockItem[];
  clients?: Client[];
  suppliers?: Supplier[];
}

export default function ClientFormModal({ 
  client, 
  onClose, 
  onSave, 
  stockItems,
  clients,
  suppliers
}: ClientFormModalProps) {
  const [nomPrenom, setNomPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [nis, setNis] = useState('');
  const [nif, setNif] = useState('');
  const [rc, setRc] = useState('');
  const [numArticle, setNumArticle] = useState('');
  const [retour, setRetour] = useState('');
  
  // General Order Settings
  const [detailVente, setDetailVente] = useState<DetailVente>('Boîte de vitesses complète');
  const [tvaApplicable, setTvaApplicable] = useState<boolean>(true);
  
  // Multi-Products State
  const [products, setProducts] = useState<ClientProductItem[]>([]);
  
  // Client type: vente | vente_reparation
  const [typeClient, setTypeClient] = useState<ClientType>('vente');
  const [dateAchat, setDateAchat] = useState('');
  const [montantPaye, setMontantPaye] = useState<number>(0);
  const [modePaiement, setModePaiement] = useState<'cash' | 'cheque'>('cash');
  const [chequeNomPrenom, setChequeNomPrenom] = useState('');
  const [chequeBanque, setChequeBanque] = useState('');
  const [chequeReference, setChequeReference] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Helper to compute available stock for a product name
  const getAvailableStockForProduct = (productName: string) => {
    if (!stockItems || stockItems.length === 0) return null;
    const match = stockItems.find(s => s.nom.toLowerCase().trim() === productName.toLowerCase().trim());
    if (!match) return null;

    const recu = (suppliers || [])
      .filter(s => s.articleAchete.toLowerCase().trim() === match.nom.toLowerCase().trim() && s.livre)
      .reduce((sum, s) => sum + (s.quantite || 0), 0);

    const vendu = (clients || [])
      .filter(c => c.produit && c.produit.toLowerCase().trim() === match.nom.toLowerCase().trim() && c.id !== client?.id)
      .reduce((sum, c) => sum + (c.quantite || 0), 0);

    const baseQty = match.quantite ?? match.quantiteInitiale ?? 0;
    return baseQty + recu - vendu;
  };

  useEffect(() => {
    if (client) {
      setNomPrenom(client.nomPrenom || '');
      setTelephone(client.telephone || '');
      setEmail(client.email || '');
      setNis(client.nis || '');
      setNif(client.nif || '');
      setRc(client.rc || '');
      setNumArticle(client.numArticle || '');
      setRetour(client.retour || '');
      setDetailVente(client.detailVente || 'Boîte de vitesses complète');
      setTvaApplicable(client.tvaApplicable ?? true);
      setTypeClient(client.typeClient === 'vente_reparation' ? 'vente_reparation' : 'vente');
      setDateAchat(client.dateAchat || (client.createdAt ? client.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]));
      setMontantPaye(client.montantPaye ?? 0);
      setModePaiement(client.modePaiement || 'cash');
      setChequeNomPrenom(client.chequeNomPrenom || '');
      setChequeBanque(client.chequeBanque || '');
      setChequeReference(client.chequeReference || '');

      if (client.produits && client.produits.length > 0) {
        setProducts(client.produits);
      } else {
        setProducts([{
          id: 'prod-1',
          produit: client.produit || 'Boîte de Vitesses ZF 16S2220 TD',
          segment: 'camion',
          quantite: client.quantite ?? 0,
          prixBase: client.prixBase ?? 0,
          remise: client.remise ?? false,
          tauxRemise: client.tauxRemise ?? 0,
          prixApresRemise: client.prixApresRemise ?? 0,
        }]);
      }
    } else {
      setNomPrenom('');
      setTelephone('');
      setEmail('');
      setNis('');
      setNif('');
      setRc('');
      setNumArticle('');
      setRetour('');
      setDetailVente('Boîte de vitesses complète');
      setTvaApplicable(true);
      setTypeClient('vente');
      setDateAchat(new Date().toISOString().split('T')[0]);
      setMontantPaye(0);
      setModePaiement('cash');
      setChequeNomPrenom('');
      setChequeBanque('');
      setChequeReference('');
      setProducts([{
        id: crypto.randomUUID(),
        produit: '',
        segment: 'camion',
        quantite: 0,
        prixBase: 0,
        remise: false,
        tauxRemise: 0,
        prixApresRemise: 0,
      }]);
    }
  }, [client]);

  const handleAddProduct = () => {
    setProducts(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        produit: '',
        segment: 'camion',
        quantite: 0,
        prixBase: 0,
        remise: false,
        tauxRemise: 0,
        prixApresRemise: 0,
      }
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length <= 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ClientProductItem, value: any) => {
    setProducts(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'prixBase' || field === 'prixApresRemise' || field === 'remise') {
        const base = field === 'prixBase' ? Math.max(0, parseFloat(value) || 0) : item.prixBase;
        const isRemise = field === 'remise' ? Boolean(value) : item.remise;

        if (field === 'prixBase') {
          item.prixBase = base;
          if (!isRemise || !item.prixApresRemise) {
            item.prixApresRemise = base;
          }
        }

        if (field === 'remise') {
          item.remise = isRemise;
          if (!isRemise) {
            item.prixApresRemise = item.prixBase;
            item.tauxRemise = 0;
          } else {
            if (!item.prixApresRemise || item.prixApresRemise === 0) {
              item.prixApresRemise = item.prixBase;
            }
          }
        }

        if (field === 'prixApresRemise') {
          const discounted = Math.max(0, parseFloat(value) || 0);
          item.prixApresRemise = discounted;
          if (item.prixBase > 0) {
            item.tauxRemise = Math.max(0, Math.round(((item.prixBase - discounted) / item.prixBase) * 100));
          }
        }
      }

      // Auto-fill price if matched with stock item
      if (field === 'produit' && typeof value === 'string' && value.trim()) {
        const matched = stockItems?.find(s => s.nom.toLowerCase().trim() === value.toLowerCase().trim());
        if (matched) {
          const suggestedPrice = matched.prixVente || matched.prixUnitaireMoyen || 0;
          if (suggestedPrice > 0 && item.prixBase === 0) {
            item.prixBase = suggestedPrice;
            item.prixApresRemise = suggestedPrice;
          }
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomPrenom.trim()) {
      setErrorMsg("Le nom et prénom du client est obligatoire.");
      return;
    }

    if (!products || products.length === 0) {
      setErrorMsg("Veuillez ajouter au moins un produit ou article.");
      return;
    }

    if (montantPaye > 0 && modePaiement === 'cheque') {
      if (!chequeNomPrenom.trim() || !chequeBanque.trim() || !chequeReference.trim()) {
        setErrorMsg("Veuillez remplir toutes les informations du chèque (Nom & Prénom, Banque, et Référence du chèque).");
        return;
      }
    }

    const firstProd = products[0];
    const totalQuantite = products.reduce((sum, p) => sum + (p.quantite || 0), 0);
    const totalPrixBase = products.reduce((sum, p) => sum + (p.prixBase || 0) * (p.quantite || 0), 0);
    const totalPrixApresRemise = products.reduce((sum, p) => sum + (p.prixApresRemise || 0) * (p.quantite || 0), 0);
    const hasAnyRemise = products.some(p => p.remise);

    const savedClient: Client = {
      id: client ? client.id : crypto.randomUUID(),
      nomPrenom: nomPrenom.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      nis: nis.trim(),
      nif: nif.trim(),
      rc: rc.trim(),
      numArticle: numArticle.trim(),
      retour: retour.trim(),
      remise: hasAnyRemise,
      prixBase: totalPrixBase,
      tauxRemise: firstProd.tauxRemise || 0,
      prixApresRemise: totalPrixApresRemise,
      detailVente,
      tvaApplicable,
      segment: firstProd.segment || 'camion',
      produit: products.map(p => `${p.produit || 'Article'}${p.quantite > 1 ? ` (x${p.quantite})` : ''}`).join(' + '),
      produits: products,
      typeClient,
      quantite: totalQuantite,
      dateAchat,
      montantPaye,
      modePaiement: montantPaye > 0 ? modePaiement : undefined,
      chequeNomPrenom: (montantPaye > 0 && modePaiement === 'cheque') ? chequeNomPrenom.trim() : undefined,
      chequeBanque: (montantPaye > 0 && modePaiement === 'cheque') ? chequeBanque.trim() : undefined,
      chequeReference: (montantPaye > 0 && modePaiement === 'cheque') ? chequeReference.trim() : undefined,
      bonCommande: null,
      facture: null,
      bonLivraison: null,
      createdAt: client ? client.createdAt : new Date().toISOString(),
    };

    onSave(savedClient);
  };

  return (
    <div id="client-form-backdrop" className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div id="client-form-content" className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-7xl w-full my-auto overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200 bg-slate-950 text-white select-none">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#f5be1a]" />
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase font-sans">
                {client ? 'Modifier le Dossier Client' : 'Nouveau Dossier Client'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {client ? `Édition des informations de vente ou réparation pour ${client.nomPrenom}` : 'Saisie du dossier de vente ou vente & réparation'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[82vh] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-4 flex items-start gap-3.5 text-xs">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="leading-normal">
                <span className="font-extrabold uppercase tracking-wider block text-red-600 mb-0.5">Erreur de saisie</span>
                <span className="font-medium text-slate-700">{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left section: Info & Finances (7/12) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* General Contact fields */}
              <div className="bg-slate-50/60 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pb-2 border-b border-slate-200/60">
                  Informations Générales
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nom complet / Entreprise *</label>
                  <input
                    type="text"
                    required
                    value={nomPrenom}
                    onChange={(e) => setNomPrenom(e.target.value)}
                    placeholder="Ex: SARL Trans-Express ou Chaoui Mohamed"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-800 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>

                {/* Type de Client Picklist: Vente ou Vente et Réparation */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Type de Client *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTypeClient('vente')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-2 ${
                        typeClient === 'vente'
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
                          : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-50'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      1. Vente
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeClient('vente_reparation')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-2 ${
                        typeClient === 'vente_reparation'
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
                          : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-50'
                      }`}
                    >
                      <Wrench className="w-4 h-4" />
                      2. Vente et Réparation
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">N° de Téléphone</label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="Ex: 0550 12 34 56"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-255 rounded-xl text-slate-800 text-sm font-bold font-mono placeholder:text-slate-450 focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Adresse E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: contact@client.dz"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-255 rounded-xl text-slate-800 text-sm font-bold placeholder:text-slate-450 focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                    />
                  </div>
                </div>
              </div>

              {/* Commercial Conditions & Multi-Product Management */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-500" />
                      Détails des Produits & Commandes Client
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ajoutez les articles commandés ou réparés pour ce client.
                    </p>
                  </div>
                </div>

                {/* Common Order Metadata: Date d'achat & Détail de Vente Général */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                      Catégorie Principale *
                    </label>
                    <select
                      value={detailVente}
                      onChange={(e) => setDetailVente(e.target.value as DetailVente)}
                      className="w-full px-3.5 py-2 bg-amber-50/70 border border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs cursor-pointer"
                    >
                      <option value="Boîte de vitesses complète">Boîte de vitesses complète</option>
                      <option value="Pignons & Trains d'engrenages">Pignons &amp; Trains d'engrenages</option>
                      <option value="Bagues de frein & Cônes synchro">Bagues de frein &amp; Cônes synchro</option>
                      <option value="Synchroniseurs & Baladeurs">Synchroniseurs &amp; Baladeurs</option>
                      <option value="Arbres de boîte (Primaire, Secondaire, Intermédiaire)">Arbres de boîte</option>
                      <option value="Roulements & Cages à aiguilles">Roulements &amp; Cages à aiguilles</option>
                      <option value="Fourchettes & Tringlerie de commande">Fourchettes &amp; Commandes</option>
                      <option value="Kit d'embrayage complet">Kit d'embrayage complet</option>
                      <option value="Ralentisseur (Retarder)">Ralentisseur (Retarder)</option>
                      <option value="Pièces de rechange diverses">Pièces de rechange diverses</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Date de l'opération
                    </label>
                    <input
                      type="date"
                      value={dateAchat}
                      onChange={(e) => setDateAchat(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-255 rounded-xl text-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                    />
                  </div>
                </div>

                {/* Multi-Products List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Articles ({products.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 hover:bg-amber-500 text-amber-900 hover:text-slate-950 font-black text-[11px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      + Ajouter un article
                    </button>
                  </div>

                  {products.map((prod, index) => {
                    const availableStock = getAvailableStockForProduct(prod.produit);
                    return (
                      <div key={prod.id || index} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-600 uppercase font-mono">
                            Article #{index + 1}
                          </span>
                          {products.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6 space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Désignation / Article</label>
                            <input
                              type="text"
                              value={prod.produit}
                              onChange={(e) => handleProductChange(index, 'produit', e.target.value)}
                              placeholder="Ex: Pignon de 3ème vitesse ZF 16S"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-bold focus:border-amber-500 focus:outline-hidden"
                            />
                            {availableStock !== null && (
                              <span className="text-[9px] font-mono text-slate-500 block">
                                Stock actuel disponible : <strong>{availableStock}</strong>
                              </span>
                            )}
                            {prod.produit && prod.produit.trim().length > 2 && (
                              <div className="pt-0.5">
                                <a
                                  href={generatePartImageSearchUrl(prod.produit, '')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-900 transition-colors"
                                  title="Voir les photos de cette pièce sur Google Images"
                                >
                                  <Search className="w-3 h-3 text-amber-600" />
                                  <span>Voir photo de la pièce ↗</span>
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Quantité</label>
                            <input
                              type="number"
                              min="0"
                              value={prod.quantite}
                              onChange={(e) => handleProductChange(index, 'quantite', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold focus:border-amber-500 focus:outline-hidden"
                            />
                          </div>

                          <div className="sm:col-span-4 space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Prix Unitaire Brut (DA)</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={prod.prixBase || ''}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                handleProductChange(index, 'prixBase', parseFloat(val) || 0);
                              }}
                              placeholder="0"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold focus:border-amber-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Remise controls - Write new amount directly, without percentage */}
                        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-200/60 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold text-[11px] select-none">
                            <input
                              type="checkbox"
                              checked={prod.remise}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                handleProductChange(index, 'remise', checked);
                                if (checked && (!prod.prixApresRemise || prod.prixApresRemise === prod.prixBase)) {
                                  handleProductChange(index, 'prixApresRemise', prod.prixBase);
                                }
                              }}
                              className="w-4 h-4 text-amber-500 rounded border-slate-300 cursor-pointer"
                            />
                            <span className="font-extrabold text-slate-800">Appliquer une remise</span>
                          </label>

                          {prod.remise && (
                            <div className="flex flex-wrap items-center gap-2 bg-emerald-50/80 border border-emerald-300 px-3 py-1.5 rounded-xl">
                              <span className="text-[11px] text-emerald-950 font-black">Nouveau Montant (DA) :</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={prod.prixApresRemise ?? prod.prixBase ?? ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  handleProductChange(index, 'prixApresRemise', parseFloat(val) || 0);
                                }}
                                placeholder="Écrire le nouveau montant"
                                className="w-36 px-2.5 py-1 bg-white border border-emerald-400 rounded-lg text-xs font-mono font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden shadow-2xs"
                              />
                              {prod.prixBase > (prod.prixApresRemise || 0) && (
                                <span className="text-[10px] font-black text-emerald-700 font-mono">
                                  (-{new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(prod.prixBase - (prod.prixApresRemise || 0))} DA)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="ml-auto font-mono text-xs text-slate-600">
                            Sous-total : <strong className="text-slate-900">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format((prod.remise ? (prod.prixApresRemise || 0) : (prod.prixBase || 0)) * (prod.quantite || 0))}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Summary & Payment */}
                {(() => {
                  const totalHT = products.reduce((sum, p) => sum + (p.prixApresRemise || 0) * (p.quantite || 0), 0);
                  const totalTVA = tvaApplicable ? Math.round(totalHT * 0.19) : 0;
                  const totalTTC = totalHT + totalTVA;
                  const reste = Math.max(0, totalTTC - (montantPaye || 0));

                  return (
                    <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs font-black uppercase text-amber-400">Totalisation Commande</span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-300 font-bold flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tvaApplicable}
                              onChange={(e) => setTvaApplicable(e.target.checked)}
                              className="w-4 h-4 text-amber-500 rounded border-slate-700"
                            />
                            TVA 19% applicable
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-sans block">Total HT</span>
                          <span className="text-sm font-bold text-slate-200">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(totalHT)}
                          </span>
                        </div>
                        <div>
                          <span className="text-amber-400 text-[10px] uppercase font-sans block">TVA {tvaApplicable ? '(19%)' : '(0%)'}</span>
                          <span className="text-sm font-bold text-amber-300">
                            +{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(totalTVA)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#f5be1a] text-[10px] uppercase font-sans font-black block">TOTAL GÉNÉRAL</span>
                          <span className="text-base font-black text-[#f5be1a]">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(totalTTC)}
                          </span>
                        </div>
                      </div>

                      {/* Montant Payé */}
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">Montant Payé (DA)</label>
                            <input
                              type="number"
                              min="0"
                              max={totalTTC}
                              value={montantPaye || ''}
                              onChange={(e) => setMontantPaye(Math.max(0, parseFloat(e.target.value) || 0))}
                              placeholder="0"
                              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:border-amber-500"
                            />
                          </div>

                          <div className="text-right font-mono text-xs">
                            <span className="text-slate-400 block text-[10px] font-sans">Reste à Régler :</span>
                            <span className={reste > 0 ? 'text-amber-400 font-black text-sm' : 'text-emerald-400 font-black text-sm'}>
                              {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(reste)}
                            </span>
                          </div>
                        </div>

                        {/* Mode de paiement */}
                        {montantPaye > 0 && (
                          <div className="mt-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setModePaiement('cash')}
                                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  modePaiement === 'cash' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                <Banknote className="w-3.5 h-3.5" /> Espèces (Cash)
                              </button>
                              <button
                                type="button"
                                onClick={() => setModePaiement('cheque')}
                                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  modePaiement === 'cheque' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Chèque
                              </button>
                            </div>

                            {modePaiement === 'cheque' && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                                <input
                                  type="text"
                                  value={chequeNomPrenom}
                                  onChange={(e) => setChequeNomPrenom(e.target.value)}
                                  placeholder="Nom émetteur *"
                                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={chequeBanque}
                                  onChange={(e) => setChequeBanque(e.target.value)}
                                  placeholder="Banque (BNA, CPA...) *"
                                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={chequeReference}
                                  onChange={(e) => setChequeReference(e.target.value)}
                                  placeholder="N° Chèque *"
                                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>

            {/* Right section: Tax IDs & Observations (5/12) - NO UPLOADS */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              
              {/* Fiscal identifiers */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-4 shadow-xs">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pb-2 border-b border-slate-200/60">
                  Identifiants Fiscaux
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Registre de Commerce (RC)</label>
                  <input
                    type="text"
                    value={rc}
                    onChange={(e) => setRc(e.target.value)}
                    placeholder="Ex: 16/00-0987654B15"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-800 text-sm font-bold font-mono uppercase focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">NIF (Identifiant Fiscal)</label>
                  <input
                    type="text"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    placeholder="Ex: 001506012456789"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-800 text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">NIS (Identifiant Statistique)</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Ex: 002015340123456"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-800 text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Article d'Imposition</label>
                  <input
                    type="text"
                    value={numArticle}
                    onChange={(e) => setNumArticle(e.target.value)}
                    placeholder="Ex: 16215432101"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-800 text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>
              </div>

              {/* Suivi des retours & observations */}
              <div className="bg-slate-50/60 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Observations & Suivi Technique
                </label>
                <textarea
                  rows={4}
                  value={retour}
                  onChange={(e) => setRetour(e.target.value)}
                  placeholder="Notes techniques, garantie, observations sur la boîte de vitesses ou les pièces installées..."
                  className="w-full px-3.5 py-3 bg-white border border-slate-250 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs resize-none leading-relaxed"
                />
              </div>

            </div>

          </div>

        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-t border-slate-200 bg-slate-50 gap-3">
          <div className="text-xs text-slate-400 italic order-2 sm:order-1 self-start sm:self-center font-mono">
            * Nom du client requis
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-2.5 text-sm font-black text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-all cursor-pointer uppercase"
            >
              {client ? 'Enregistrer les Modifications' : 'Créer le Dossier'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
