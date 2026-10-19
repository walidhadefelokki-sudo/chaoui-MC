/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { StockMovement, Supplier, Client, StockItem, User } from '../types';
import { 
  History, ArrowUpRight, ArrowDownRight, Search, Plus, Trash2, 
  Calendar, UserCheck, Building2, Package, Layers, RefreshCw, 
  CheckCircle2, AlertTriangle, FileText, X
} from 'lucide-react';

interface StockHistorySectionProps {
  movements: StockMovement[];
  suppliers: Supplier[];
  clients: Client[];
  stockItems?: StockItem[];
  currentUser: User | null;
  onAddStockMovement?: (movement: StockMovement) => void;
  onEditStockItem?: (item: StockItem) => void;
  onDeleteMovement?: (id: string) => void;
  onClearMovements?: () => void;
}

export interface UnifiedHistoryItem {
  id: string;
  typeMouvement: 'ENTREE' | 'SORTIE';
  date: string;
  produit: string;
  quantite: number;
  unite: string;
  typeArticle: 'matiere_premiere' | 'produit_fini';
  nomUtilisateur: string;
  tierNom: string;
  motif: string;
  source: 'MANUEL' | 'FOURNISSEUR' | 'CLIENT';
  createdAt: string;
}

export default function StockHistorySection({
  movements,
  suppliers,
  clients,
  stockItems = [],
  currentUser,
  onAddStockMovement,
  onEditStockItem,
  onDeleteMovement,
  onClearMovements,
}: StockHistorySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeMouvementFilter, setTypeMouvementFilter] = useState<'ALL' | 'ENTREE' | 'SORTIE'>('ALL');
  const [articleTypeFilter, setArticleTypeFilter] = useState<'ALL' | 'matiere_premiere' | 'produit_fini'>('ALL');

  // Track deleted history IDs (persisted locally so any individual item can be suppressed)
  const [deletedUnifiedIds, setDeletedUnifiedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('chaoui_deleted_history_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<UnifiedHistoryItem | null>(null);

  // Form states for adding movement
  const [formType, setFormType] = useState<'ENTREE' | 'SORTIE'>('ENTREE');
  const [formProduit, setFormProduit] = useState('');
  const [formQuantite, setFormQuantite] = useState<number>(1);
  const [formUnite, setFormUnite] = useState('Unités');
  const [formTypeArticle, setFormTypeArticle] = useState<'matiere_premiere' | 'produit_fini'>('matiere_premiere');
  const [formTierNom, setFormTierNom] = useState('');
  const [formMotif, setFormMotif] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [formError, setFormError] = useState('');

  // Build unified history from explicit movements, supplier arrivals, and client sales
  const unifiedHistory = useMemo<UnifiedHistoryItem[]>(() => {
    const items: UnifiedHistoryItem[] = [];

    // 1. Direct manual stock movements
    movements.forEach(m => {
      if (!deletedUnifiedIds.has(m.id)) {
        items.push({
          id: m.id,
          typeMouvement: m.typeMouvement,
          date: m.date || m.createdAt,
          produit: m.produit,
          quantite: m.quantite,
          unite: m.unite || 'Unités',
          typeArticle: m.typeArticle || 'matiere_premiere',
          nomUtilisateur: m.nomUtilisateur || 'Gestionnaire Stock',
          tierNom: m.tierNom || (m.typeMouvement === 'ENTREE' ? 'Fournisseur' : 'Client Interne'),
          motif: m.motif || (m.typeMouvement === 'ENTREE' ? 'Réception Stock' : 'Sortie Atelier'),
          source: 'MANUEL',
          createdAt: m.createdAt,
        });
      }
    });

    // 2. Supplier purchases & deliveries (ENTRÉE)
    suppliers.forEach(s => {
      if (s.produits && s.produits.length > 0) {
        s.produits.forEach(p => {
          const id = `sup-${s.id}-${p.id}`;
          if (!deletedUnifiedIds.has(id)) {
            items.push({
              id,
              typeMouvement: 'ENTREE',
              date: s.dateAchat || s.createdAt,
              produit: p.produit,
              quantite: p.quantite,
              unite: p.unite || 'Unités',
              typeArticle: p.type || 'matiere_premiere',
              nomUtilisateur: 'Service Achats',
              tierNom: s.nomPrenom || 'Fournisseur',
              motif: s.livre ? 'Achat Fournisseur (Livré)' : 'Achat En Transit',
              source: 'FOURNISSEUR',
              createdAt: s.createdAt,
            });
          }
        });
      } else if (s.articleAchete) {
        const id = `sup-${s.id}`;
        if (!deletedUnifiedIds.has(id)) {
          items.push({
            id,
            typeMouvement: 'ENTREE',
            date: s.dateAchat || s.createdAt,
            produit: s.articleAchete,
            quantite: s.quantite || 0,
            unite: 'Unités',
            typeArticle: 'matiere_premiere',
            nomUtilisateur: 'Service Achats',
            tierNom: s.nomPrenom || 'Fournisseur',
            motif: s.livre ? 'Achat Fournisseur (Livré)' : 'Achat En Transit',
            source: 'FOURNISSEUR',
            createdAt: s.createdAt,
          });
        }
      }
    });

    // 3. Client sales (SORTIE)
    clients.forEach(c => {
      if (c.produits && c.produits.length > 0) {
        c.produits.forEach(p => {
          const id = `cli-${c.id}-${p.id}`;
          if (!deletedUnifiedIds.has(id)) {
            items.push({
              id,
              typeMouvement: 'SORTIE',
              date: c.dateAchat || c.createdAt,
              produit: p.produit,
              quantite: p.quantite,
              unite: 'Unités',
              typeArticle: 'produit_fini',
              nomUtilisateur: 'Direction Générale',
              tierNom: c.nomPrenom || 'Client',
              motif: `Vente Client (${c.detailVente || 'Commande'})`,
              source: 'CLIENT',
              createdAt: c.createdAt,
            });
          }
        });
      } else if (c.produit) {
        const id = `cli-${c.id}`;
        if (!deletedUnifiedIds.has(id)) {
          items.push({
            id,
            typeMouvement: 'SORTIE',
            date: c.dateAchat || c.createdAt,
            produit: c.produit,
            quantite: c.quantite || 1,
            unite: 'Unités',
            typeArticle: 'produit_fini',
            nomUtilisateur: 'Commercial',
            tierNom: c.nomPrenom || 'Client',
            motif: `Vente Client (${c.detailVente || 'Commande'})`,
            source: 'CLIENT',
            createdAt: c.createdAt,
          });
        }
      }
    });

    // Sort chronologically by date/createdAt desc
    return items.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [movements, suppliers, clients, deletedUnifiedIds]);

  // Filtered list
  const filteredHistory = useMemo(() => {
    return unifiedHistory.filter(item => {
      // Type filter
      if (typeMouvementFilter !== 'ALL' && item.typeMouvement !== typeMouvementFilter) {
        return false;
      }
      // Article type filter
      if (articleTypeFilter !== 'ALL' && item.typeArticle !== articleTypeFilter) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesProduct = item.produit.toLowerCase().includes(query);
        const matchesUser = item.nomUtilisateur.toLowerCase().includes(query);
        const matchesTier = item.tierNom.toLowerCase().includes(query);
        const matchesMotif = item.motif.toLowerCase().includes(query);
        const matchesDate = item.date.toLowerCase().includes(query);
        return matchesProduct || matchesUser || matchesTier || matchesMotif || matchesDate;
      }
      return true;
    });
  }, [unifiedHistory, typeMouvementFilter, articleTypeFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    let totalEntrees = 0;
    let totalSorties = 0;
    unifiedHistory.forEach(item => {
      if (item.typeMouvement === 'ENTREE') totalEntrees += item.quantite;
      if (item.typeMouvement === 'SORTIE') totalSorties += item.quantite;
    });
    return {
      totalMouvements: unifiedHistory.length,
      totalEntrees,
      totalSorties,
    };
  }, [unifiedHistory]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Non spécifiée';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setFormType('ENTREE');
    setFormProduit(stockItems[0]?.nom || '');
    setFormQuantite(1);
    setFormUnite('Unités');
    setFormTypeArticle('matiere_premiere');
    setFormTierNom('');
    setFormMotif('');
    setFormDate(new Date().toISOString().slice(0, 16));
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Handle save new movement
  const handleSaveNewMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduit.trim()) {
      setFormError("Veuillez indiquer le nom de l'article ou du produit.");
      return;
    }
    if (formQuantite <= 0) {
      setFormError("La quantité doit être supérieure à 0.");
      return;
    }

    const newMov: StockMovement = {
      id: crypto.randomUUID(),
      typeMouvement: formType,
      date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
      produit: formProduit.trim(),
      quantite: formQuantite,
      unite: formUnite.trim() || 'Unités',
      typeArticle: formTypeArticle,
      nomUtilisateur: currentUser?.fullName || 'Islam Chaoui',
      tierNom: formTierNom.trim() || (formType === 'ENTREE' ? 'Fournisseur' : 'Atelier / Client'),
      motif: formMotif.trim() || (formType === 'ENTREE' ? 'Réception manuelle en stock' : 'Sortie manuelle du stock'),
      createdAt: new Date().toISOString()
    };

    if (onAddStockMovement) {
      onAddStockMovement(newMov);
    }

    // Auto-adjust quantity of corresponding stock item if found
    if (onEditStockItem && stockItems.length > 0) {
      const matched = stockItems.find(s => s.nom.toLowerCase().trim() === formProduit.trim().toLowerCase());
      if (matched) {
        const curQty = matched.quantite ?? matched.quantiteInitiale ?? 0;
        const updatedQty = formType === 'ENTREE' ? curQty + formQuantite : Math.max(0, curQty - formQuantite);
        onEditStockItem({
          ...matched,
          quantite: updatedQty,
          quantiteInitiale: updatedQty
        });
      }
    }

    setIsAddModalOpen(false);
  };

  // Handle delete a specific movement
  const handleConfirmDelete = () => {
    if (!movementToDelete) return;
    const targetId = movementToDelete.id;

    // Call external delete handler if direct manual movement
    if (onDeleteMovement) {
      onDeleteMovement(targetId);
    }

    // Also register in deleted set for instant UI disappearance and persistent exclusion
    setDeletedUnifiedIds(prev => {
      const next = new Set(prev);
      next.add(targetId);
      try {
        localStorage.setItem('chaoui_deleted_history_ids', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error("Failed to save deleted history IDs:", err);
      }
      return next;
    });

    setMovementToDelete(null);
  };


  return (
    <div id="stock-history-section" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Title */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5" />
              Traçabilité &amp; Journal des Mouvements
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Historique des Entrées &amp; Sorties du Stock
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl font-medium">
              Consultez en temps réel l'ensemble des réceptions, ventes clients et opérations d'atelier. Vous pouvez ajouter et supprimer des mouvements à tout moment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">

            {/* Add Movement Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Mouvement
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <History className="w-6 h-6 stroke-[2.2px]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mouvements Totaux</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalMouvements}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Opérations enregistrées</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quantités Entrées</p>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">+{stats.totalEntrees}</p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Achats &amp; réceptions stock</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
            <ArrowDownRight className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quantités Sorties</p>
            <p className="text-2xl font-black text-amber-700 tracking-tight">-{stats.totalSorties}</p>
            <p className="text-[10px] font-bold text-amber-600 mt-0.5">Ventes &amp; prélèvements atelier</p>
          </div>
        </div>

      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par article, client, fournisseur, motif..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Movement Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeMouvementFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeMouvementFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({unifiedHistory.length})
            </button>
            <button
              onClick={() => setTypeMouvementFilter('ENTREE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                typeMouvementFilter === 'ENTREE'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5px]" />
              Entrées
            </button>
            <button
              onClick={() => setTypeMouvementFilter('SORTIE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                typeMouvementFilter === 'SORTIE'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5px]" />
              Sorties
            </button>
          </div>

          {/* Article Type Filter */}
          <select
            value={articleTypeFilter}
            onChange={(e) => setArticleTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
          >
            <option value="ALL">Tous les types d'articles</option>
            <option value="matiere_premiere">Matières premières / Pièces</option>
            <option value="produit_fini">Produits finis / Boîtes</option>
          </select>

        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">Mouvement</th>
                <th className="py-3.5 px-4">Date &amp; Heure</th>
                <th className="py-3.5 px-4">Produit / Article</th>
                <th className="py-3.5 px-4">Quantité</th>
                <th className="py-3.5 px-4">Type Article</th>
                <th className="py-3.5 px-4">Intervenant</th>
                <th className="py-3.5 px-4">Client / Fournisseur</th>
                <th className="py-3.5 px-4">Motif</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <History className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
                    <p className="font-bold text-slate-700">Aucun mouvement trouvé dans l'historique</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchTerm || typeMouvementFilter !== 'ALL' || articleTypeFilter !== 'ALL'
                        ? 'Modifiez vos critères de recherche ou de filtre'
                        : "Vous pouvez ajouter une nouvelle entrée ou sortie manuelle de stock dès maintenant."}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un Mouvement
                    </button>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isEntree = item.typeMouvement === 'ENTREE';

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors font-medium text-slate-800"
                    >
                      {/* Mouvement badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                          isEntree
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isEntree ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                              ENTRÉE
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-amber-600 stroke-[3px]" />
                              SORTIE
                            </>
                          )}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>

                      {/* Produit */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{item.produit}</span>
                        </div>
                      </td>

                      {/* Quantité */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`font-black text-xs ${isEntree ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isEntree ? `+${item.quantite}` : `-${item.quantite}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold ml-1">{item.unite}</span>
                      </td>

                      {/* Type Article */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.typeArticle === 'matiere_premiere'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                        }`}>
                          {item.typeArticle === 'matiere_premiere' ? 'Matière Première' : 'Produit Fini'}
                        </span>
                      </td>

                      {/* Nom Utilisateur */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{item.nomUtilisateur}</span>
                        </div>
                      </td>

                      {/* Client / Fournisseur */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{item.tierNom}</span>
                        </div>
                      </td>

                      {/* Motif / Source */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 text-slate-600 max-w-xs truncate" title={item.motif}>
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.motif}</span>
                        </div>
                      </td>

                      {/* Actions: Delete movement */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setMovementToDelete(item)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Supprimer ce mouvement de l'historique"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Affichage de <strong>{filteredHistory.length}</strong> mouvement(s) sur {unifiedHistory.length} au total</span>
          <span className="text-[11px] text-slate-400">SARL Chaoui Poids Lourds — Journal de Traçabilité</span>
        </div>
      </div>

      {/* Modal: Add Manual Movement */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full my-auto overflow-hidden animate-in fade-in duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    Nouveau Mouvement de Stock
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enregistrement direct d'une entrée ou d'une sortie dans l'historique
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewMovement} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              {/* Type de mouvement (ENTREE vs SORTIE) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Sens du Mouvement *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('ENTREE')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'ENTREE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    ENTRÉE (+ Stock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('SORTIE')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'SORTIE'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    SORTIE (- Stock)
                  </button>
                </div>
              </div>

              {/* Produit / Article */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Article / Pièce / Boîte *
                </label>
                <input
                  type="text"
                  required
                  value={formProduit}
                  onChange={(e) => setFormProduit(e.target.value)}
                  placeholder="Ex: Pignon 3ème, Boîte ZF 16S2220 TD, Kit embrayage..."
                  list="history-stock-suggestions"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
                <datalist id="history-stock-suggestions">
                  {stockItems.map(s => (
                    <option key={s.id} value={s.nom}>{s.reference ? `Réf: ${s.reference} (${s.marque})` : s.marque}</option>
                  ))}
                </datalist>
              </div>

              {/* Quantité & Unité */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Quantité *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formQuantite}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setFormQuantite(Math.max(1, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 1))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Unité
                  </label>
                  <select
                    value={formUnite}
                    onChange={(e) => setFormUnite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Unités">Unités</option>
                    <option value="Pièces">Pièces</option>
                    <option value="Kits">Kits</option>
                    <option value="Boîtes">Boîtes</option>
                    <option value="Litres">Litres</option>
                  </select>
                </div>
              </div>

              {/* Type d'article & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Type d'Article
                  </label>
                  <select
                    value={formTypeArticle}
                    onChange={(e) => setFormTypeArticle(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="matiere_premiere">Matière première / Pièce détachée</option>
                    <option value="produit_fini">Produit fini / Boîte de vitesses complète</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Date &amp; Heure
                  </label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tier / Partenaire & Motif */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Client / Fournisseur / Destination
                </label>
                <input
                  type="text"
                  value={formTierNom}
                  onChange={(e) => setFormTierNom(e.target.value)}
                  placeholder="Ex: Atelier Réparation, Client Bouchra, Fournisseur Euroricambi..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Motif / Remarque
                </label>
                <input
                  type="text"
                  value={formMotif}
                  onChange={(e) => setFormMotif(e.target.value)}
                  placeholder="Ex: Entrée stock arrivage, Sortie pour révision boîte Mercedes..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Enregistrer l'Opération
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Movement */}
      {movementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 text-left space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">Supprimer ce mouvement</h3>
                <p className="text-xs text-slate-500">Retirer cette ligne du journal d'historique</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{movementToDelete.produit}</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                  movementToDelete.typeMouvement === 'ENTREE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {movementToDelete.typeMouvement === 'ENTREE' ? `+${movementToDelete.quantite}` : `-${movementToDelete.quantite}`} {movementToDelete.unite}
                </span>
              </div>
              <p className="text-slate-600">Partenaire : <span className="font-bold">{movementToDelete.tierNom}</span></p>
              <p className="text-slate-500 text-[11px]">Motif : {movementToDelete.motif}</p>
              <p className="text-slate-400 text-[10px] font-mono">{formatDate(movementToDelete.date)}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Êtes-vous sûr de vouloir supprimer définitivement cette opération de l'historique ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMovementToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
