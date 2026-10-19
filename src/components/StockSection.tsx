/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StockItem, Client, Supplier, User, StockMovement } from '../types';
import StockExitModal from './StockExitModal';
import { 
  Package, Boxes, Plus, Search, Edit, Trash2, 
  MinusCircle, Coins, ShieldCheck, Sparkles, Building2, Tag, DollarSign, Layers
} from 'lucide-react';

interface StockSectionProps {
  stockItems: StockItem[];
  clients: Client[];
  suppliers: Supplier[];
  onAddStockItem: (item: StockItem) => void;
  onEditStockItem: (item: StockItem) => void;
  onDeleteStockItem: (id: string) => void;
  userRole?: 'admin' | 'commercial';
  currentUser?: User | null;
  onAddStockMovement?: (movement: StockMovement) => void;
}

const COMMON_BRANDS = [
  'ZF',
  'Eaton',
  'Mercedes-Benz',
  'Volvo',
  'Scania',
  'MAN',
  'Renault Trucks',
  'Euroricambi',
  'CEI',
  'Meritor',
  'SKF',
  'Valeo',
  'DAF',
  'Iveco',
  'Autre'
];

export default function StockSection({
  stockItems,
  clients,
  suppliers,
  onAddStockItem,
  onEditStockItem,
  onDeleteStockItem,
  userRole,
  currentUser,
  onAddStockMovement
}: StockSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  // Stock Exit Modal state
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  
  // Form state matching exact required columns: article / référence / marque / quantité / prix d'achat / prix de vente
  const [formArticle, setFormArticle] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formMarque, setFormMarque] = useState('ZF');
  const [formQuantite, setFormQuantite] = useState<number>(0);
  const [formPrixAchat, setFormPrixAchat] = useState<number>(0);
  const [formPrixVente, setFormPrixVente] = useState<number>(0);
  const [formError, setFormError] = useState('');

  // 1. Dynamic calculations for stock
  const stockWithCalculations = useMemo(() => {
    return stockItems.map(item => {
      const currentQty = item.quantite ?? item.quantiteInitiale ?? 0;
      const pAchat = item.prixAchat ?? item.prixUnitaireMoyen ?? 0;
      const pVente = item.prixVente ?? 0;
      const ref = item.reference || item.referencePiece || '-';
      const marque = item.marque || 'ZF';

      return {
        ...item,
        currentQty,
        pAchat,
        pVente,
        ref,
        marque,
        valeurAchatTotal: currentQty * pAchat,
        valeurVenteTotal: currentQty * pVente
      };
    });
  }, [stockItems]);

  // 2. Compute KPI card totals (all initialized with exact numbers)
  const stats = useMemo(() => {
    let totalItems = stockWithCalculations.length;
    let totalQuantite = 0;
    let totalValeurAchat = 0;
    let totalValeurVente = 0;

    stockWithCalculations.forEach(item => {
      totalQuantite += item.currentQty;
      totalValeurAchat += item.valeurAchatTotal;
      totalValeurVente += item.valeurVenteTotal;
    });

    return {
      totalItems,
      totalQuantite,
      totalValeurAchat,
      totalValeurVente
    };
  }, [stockWithCalculations]);

  // 3. Filtered Stock list
  const filteredStock = useMemo(() => {
    return stockWithCalculations
      .filter(item => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = !query || 
          (item.nom || '').toLowerCase().includes(query) ||
          (item.ref || '').toLowerCase().includes(query) ||
          (item.marque || '').toLowerCase().includes(query);

        const matchesBrand = selectedBrandFilter === 'all' || item.marque === selectedBrandFilter;
        return matchesSearch && matchesBrand;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [stockWithCalculations, searchTerm, selectedBrandFilter]);

  // Handle open exit stock modal
  const handleOpenExitModal = () => {
    setIsExitModalOpen(true);
  };

  const handleBatchConfirmExit = (exits: Array<{
    stockItemId: string;
    produit: string;
    quantite: number;
    type: 'matiere_premiere' | 'produit_fini';
    unite: string;
    clientNom: string;
    username: string;
    motif?: string;
    date?: string;
  }>) => {
    exits.forEach(exit => {
      const targetItem = stockItems.find(s => s.id === exit.stockItemId);
      if (targetItem) {
        const currentQty = targetItem.quantite ?? targetItem.quantiteInitiale ?? 0;
        const newQty = Math.max(0, currentQty - exit.quantite);
        const updatedItem: StockItem = {
          ...targetItem,
          quantite: newQty,
          quantiteInitiale: newQty
        };
        onEditStockItem(updatedItem);

        // Record stock movement
        if (onAddStockMovement) {
          onAddStockMovement({
            id: crypto.randomUUID(),
            typeMouvement: 'SORTIE',
            date: exit.date || new Date().toISOString(),
            produit: exit.produit,
            quantite: exit.quantite,
            unite: exit.unite || 'Unités',
            typeArticle: exit.type || 'matiere_premiere',
            nomUtilisateur: exit.username,
            tierNom: exit.clientNom,
            motif: exit.motif || 'Sortie Client / Atelier',
            createdAt: new Date().toISOString()
          });
        }
      }
    });
  };

  // Handle open modal
  const handleOpenModal = (item?: StockItem) => {
    if (item) {
      setEditingItem(item);
      setFormArticle(item.nom || '');
      setFormReference(item.reference || item.referencePiece || '');
      setFormMarque(item.marque || 'ZF');
      setFormQuantite(item.quantite ?? item.quantiteInitiale ?? 0);
      setFormPrixAchat(item.prixAchat ?? item.prixUnitaireMoyen ?? 0);
      setFormPrixVente(item.prixVente ?? 0);
    } else {
      setEditingItem(null);
      setFormArticle('');
      setFormReference('');
      setFormMarque('ZF');
      setFormQuantite(0);
      setFormPrixAchat(0);
      setFormPrixVente(0);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formArticle.trim()) {
      setFormError("Le nom de l'article est obligatoire.");
      return;
    }

    if (!formReference.trim()) {
      setFormError("La référence de la pièce est obligatoire.");
      return;
    }

    if (formQuantite < 0) {
      setFormError("La quantité ne peut pas être négative.");
      return;
    }

    if (formPrixAchat < 0) {
      setFormError("Le prix d'achat ne peut pas être négatif.");
      return;
    }

    if (formPrixVente < 0) {
      setFormError("Le prix de vente ne peut pas être négatif.");
      return;
    }

    const savedItem: StockItem = {
      id: editingItem ? editingItem.id : crypto.randomUUID(),
      nom: formArticle.trim(),
      reference: formReference.trim(),
      referencePiece: formReference.trim(),
      marque: formMarque.trim() || 'ZF',
      quantite: formQuantite,
      quantiteInitiale: formQuantite,
      prixAchat: formPrixAchat,
      prixVente: formPrixVente,
      prixUnitaireMoyen: formPrixAchat,
      type: 'matiere_premiere',
      unite: 'Unités',
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
    };

    if (editingItem) {
      onEditStockItem(savedItem);
    } else {
      onAddStockItem(savedItem);
      if (formQuantite > 0 && onAddStockMovement) {
        onAddStockMovement({
          id: crypto.randomUUID(),
          typeMouvement: 'ENTREE',
          date: new Date().toISOString(),
          produit: savedItem.nom,
          quantite: formQuantite,
          unite: 'Unités',
          typeArticle: 'matiere_premiere',
          nomUtilisateur: currentUser?.fullName || 'Islam Chaoui',
          tierNom: savedItem.marque || 'Fournisseur Initial',
          motif: 'Entrée initiale - Création article',
          createdAt: new Date().toISOString()
        });
      }
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="stock-section" className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Gestion des Produits en Stock
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-250">
              {stats.totalItems} articles
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Suivi des boîtes de vitesses et pièces : article, référence, marque, quantité, prix d'achat et prix de vente.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenExitModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <MinusCircle className="w-4 h-4 text-amber-400" />
            Sortie de Stock
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouvel Article
          </button>
        </div>
      </div>

      {/* KPI Cards (All numbers starting at 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Articles */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Articles</span>
            <p className="text-2xl font-black font-mono text-slate-900">{stats.totalItems}</p>
            <span className="text-[11px] text-slate-500 font-medium">références catalogue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Quantité Totale */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quantité en Stock</span>
            <p className="text-2xl font-black font-mono text-slate-900">{stats.totalQuantite}</p>
            <span className="text-[11px] text-slate-500 font-medium">unités physiques</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Valeur Achat */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Valeur Totale Achat</span>
            <p className="text-xl font-black font-mono text-slate-900 truncate max-w-[170px]">{formatCurrency(stats.totalValeurAchat)}</p>
            <span className="text-[11px] text-slate-500 font-medium">prix d'achat total</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Valeur Vente */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Valeur Totale Vente</span>
            <p className="text-xl font-black font-mono text-emerald-600 truncate max-w-[170px]">{formatCurrency(stats.totalValeurVente)}</p>
            <span className="text-[11px] text-slate-500 font-medium">prix de vente potentiel</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par article, référence OEM ou marque (ex: ZF, Eaton, Mercedes, 1315 304...)"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-hidden transition-all placeholder-slate-400"
            />
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Marque :</span>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Toutes les marques</option>
              {COMMON_BRANDS.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Products Stock Table: EXACT COLUMNS REQUIRED: article / référence / marque / quantité / prix d'achat / prix de vente */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Article</th>
                <th className="px-5 py-3.5">Référence</th>
                <th className="px-5 py-3.5">Marque</th>
                <th className="px-5 py-3.5 text-center">Quantité</th>
                <th className="px-5 py-3.5 text-right">Prix d'Achat</th>
                <th className="px-5 py-3.5 text-right">Prix de Vente</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Boxes className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-black text-slate-700">Aucun produit en stock</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Ajoutez votre premier article de boîte de vitesses ou pièce détachée.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenModal()}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un Article
                    </button>
                  </td>
                </tr>
              ) : (
                filteredStock.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* 1. Article */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.nom}</p>
                          {item.boiteCompatible && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Compatible : {item.boiteCompatible}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Référence */}
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">
                      {item.ref}
                    </td>

                    {/* 3. Marque */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.marque}
                      </span>
                    </td>

                    {/* 4. Quantité */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                        item.currentQty > 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {item.currentQty}
                      </span>
                    </td>

                    {/* 5. Prix d'achat */}
                    <td className="px-5 py-4 text-right font-mono text-xs font-bold text-slate-800">
                      {formatCurrency(item.pAchat)}
                    </td>

                    {/* 6. Prix de vente */}
                    <td className="px-5 py-4 text-right font-mono text-xs font-black text-emerald-700">
                      {formatCurrency(item.pVente)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                          title="Modifier l'article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Supprimer l'article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Stock Item Modal matching the 6 columns */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full my-auto overflow-hidden animate-in fade-in duration-150">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    {editingItem ? "Modifier l'Article de Stock" : "Ajouter un Article en Stock"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Saisie conforme : Article, Référence, Marque, Quantité, Prix d'achat, Prix de vente.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              {/* 1. Article (Désignation) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  1. Article (Désignation) *
                </label>
                <input
                  type="text"
                  required
                  value={formArticle}
                  onChange={(e) => setFormArticle(e.target.value)}
                  placeholder="Ex: Boîte ZF 16S2220 TD ou Pignon 3ème"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* 2. Référence & 3. Marque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    2. Référence (OEM / Pièce) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    placeholder="Ex: 1315 304 022"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    3. Marque *
                  </label>
                  <input
                    type="text"
                    required
                    value={formMarque}
                    onChange={(e) => setFormMarque(e.target.value)}
                    placeholder="Ex: ZF, Eaton, Mercedes, Euroricambi..."
                    list="brand-suggestions"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                  <datalist id="brand-suggestions">
                    {COMMON_BRANDS.map(b => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 4. Quantité */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  4. Quantité en Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formQuantite}
                  onChange={(e) => setFormQuantite(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* 5. Prix d'achat & 6. Prix de vente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    5. Prix d'Achat (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formPrixAchat}
                    onChange={(e) => setFormPrixAchat(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                    6. Prix de Vente (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formPrixVente}
                    onChange={(e) => setFormPrixVente(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-250 rounded-xl text-emerald-950 text-xs font-mono font-bold focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                >
                  {editingItem ? "Enregistrer" : "Créer l'Article"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Stock Exit Modal */}
      {isExitModalOpen && (
        <StockExitModal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          stockItems={stockItems}
          stockWithCalculations={stockWithCalculations.map(s => ({ ...s, restante: s.currentQty }))}
          clients={clients}
          currentUser={currentUser || null}
          onConfirmExit={handleBatchConfirmExit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 text-left space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">Confirmer la suppression</h3>
                <p className="text-xs text-slate-500">Suppression définitive de la référence</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{itemToDelete.nom}</p>
              <p className="text-slate-600 font-mono">Réf: {itemToDelete.reference || itemToDelete.referencePiece || '-'}</p>
              <p className="text-slate-600">Marque: <span className="font-bold">{itemToDelete.marque}</span> | En stock: <span className="font-bold font-mono">{itemToDelete.quantite ?? 0}</span></p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Êtes-vous sûr de vouloir supprimer définitivement cet article du stock ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStockItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Supprimer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
