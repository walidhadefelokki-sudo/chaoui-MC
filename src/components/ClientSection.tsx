/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client, AttachedFile, Supplier, StockItem, ClientType, ProformaInvoice } from '../types';
import { 
  Plus, Search, Edit, Trash2, Eye, FileText, Check, AlertTriangle, 
  Sparkles, Filter, X, Phone, Mail, FileCheck, Truck, DollarSign, Package, Wrench, FileSpreadsheet
} from 'lucide-react';
import ClientFormModal from './ClientFormModal';
import ClientDetailsModal from './ClientDetailsModal';
import DocumentViewerModal, { DocumentType } from './DocumentViewerModal';
import ProformaFormModal from './ProformaFormModal';

interface ClientSectionProps {
  clients: Client[];
  stockItems: StockItem[];
  suppliers: Supplier[];
  onAddClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onViewFile?: (file: AttachedFile) => void;
  userRole?: 'admin' | 'commercial';
}

export default function ClientSection({
  clients,
  stockItems,
  suppliers,
  onAddClient,
  onEditClient,
  onDeleteClient,
  userRole
}: ClientSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRemise, setFilterRemise] = useState<'all' | 'oui' | 'non'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paye' | 'partiel' | 'non_paye'>('all');
  const [filterTypeClient, setFilterTypeClient] = useState<'all' | ClientType>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);

  // Document Viewer Modal State
  const [selectedDocClient, setSelectedDocClient] = useState<Client | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('facture');

  // Proforma Invoices state
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('chaoui_proforma_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isProformaFormOpen, setIsProformaFormOpen] = useState(false);
  const [activeClientTab, setActiveClientTab] = useState<'real' | 'proforma'>('real');

  const handleOpenDocument = (client: Client, type: DocumentType) => {
    setSelectedDocClient(client);
    setSelectedDocType(type);
  };

  const handleSaveProforma = (proforma: ProformaInvoice, autoPrint: boolean = false) => {
    setProformaInvoices(prev => {
      const updated = [proforma, ...prev];
      localStorage.setItem('chaoui_proforma_invoices', JSON.stringify(updated));
      return updated;
    });
    setIsProformaFormOpen(false);

    if (autoPrint) {
      handleOpenProformaDocument(proforma);
    }
  };

  const handleDeleteProforma = (id: string) => {
    setProformaInvoices(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('chaoui_proforma_invoices', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenProformaDocument = (proforma: ProformaInvoice) => {
    const clientView: Client = {
      id: proforma.id,
      nomPrenom: proforma.nomPrenom,
      telephone: proforma.telephone || '',
      email: proforma.email || '',
      nis: proforma.nis || '',
      nif: proforma.nif || '',
      rc: proforma.rc || '',
      numArticle: proforma.numArticle || '',
      bonCommande: null,
      facture: null,
      bonLivraison: null,
      retour: '',
      remise: false,
      prixBase: 0,
      tauxRemise: 0,
      prixApresRemise: 0,
      tvaApplicable: proforma.tvaApplicable,
      produits: proforma.produits,
      dateAchat: proforma.dateCreation,
      delaiRealisation: proforma.delaiRealisation,
      rendezVous: proforma.rendezVous,
      isProforma: true,
      typeClient: proforma.typeClient || 'vente',
      createdAt: proforma.createdAt
    };
    setSelectedDocClient(clientView);
    setSelectedDocType('facture');
  };

  const handleConvertProformaToClient = (proforma: ProformaInvoice) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      nomPrenom: proforma.nomPrenom,
      telephone: proforma.telephone || '',
      email: proforma.email || '',
      nis: proforma.nis || '',
      nif: proforma.nif || '',
      rc: proforma.rc || '',
      numArticle: proforma.numArticle || '',
      bonCommande: null,
      facture: null,
      bonLivraison: null,
      retour: '',
      remise: false,
      prixBase: 0,
      tauxRemise: 0,
      prixApresRemise: 0,
      tvaApplicable: proforma.tvaApplicable,
      produits: proforma.produits,
      typeClient: proforma.typeClient || 'vente',
      quantite: proforma.produits.reduce((s, p) => s + (p.quantite || 0), 0),
      dateAchat: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    onAddClient(newClient);
    handleDeleteProforma(proforma.id);
  };

  // Delete confirmation
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(val);
  };

  const handleOpenAddForm = () => {
    setSelectedClientForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (client: Client) => {
    setSelectedClientForEdit(client);
    setIsFormOpen(true);
  };

  const handleSaveClient = (client: Client) => {
    if (selectedClientForEdit) {
      onEditClient(client);
    } else {
      onAddClient(client);
    }
    setIsFormOpen(false);
  };

  const confirmDelete = (id: string) => {
    setClientToDelete(id);
  };

  const executeDelete = () => {
    if (clientToDelete) {
      onDeleteClient(clientToDelete);
      setClientToDelete(null);
    }
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || 
      (client.nomPrenom || '').toLowerCase().includes(term) ||
      (client.telephone || '').toLowerCase().includes(term) ||
      (client.email || '').toLowerCase().includes(term) ||
      (client.rc || '').toLowerCase().includes(term) ||
      (client.nif || '').toLowerCase().includes(term) ||
      (client.produit || '').toLowerCase().includes(term) ||
      (client.produits && client.produits.some(p => (p.produit || '').toLowerCase().includes(term)));

    const matchesRemise = 
      filterRemise === 'all' ? true :
      filterRemise === 'oui' ? client.remise : !client.remise;

    const totalContratHT = client.produits && client.produits.length > 0
      ? client.produits.reduce((sum, item) => sum + ((item.prixApresRemise || item.prixBase || 0) * (item.quantite || 0)), 0)
      : (client.prixApresRemise || client.prixBase || 0);
    const totalContratTVA = client.tvaApplicable !== false ? Math.round(totalContratHT * 0.19) : 0;
    const totalContrat = totalContratHT + totalContratTVA;
    const montantPaye = client.montantPaye || 0;
    const remains = totalContrat - montantPaye;

    const matchesPayment = 
      filterPayment === 'all' ? true :
      filterPayment === 'paye' ? remains <= 0 && totalContrat > 0 :
      filterPayment === 'partiel' ? montantPaye > 0 && remains > 0 :
      filterPayment === 'non_paye' ? montantPaye === 0 && totalContrat > 0 : false;

    const currentType = client.typeClient === 'vente_reparation' ? 'vente_reparation' : 'vente';
    const matchesType = 
      filterTypeClient === 'all' ? true : currentType === filterTypeClient;

    return matchesSearch && matchesRemise && matchesPayment && matchesType;
  }).sort((a, b) => {
    const dateA = new Date(a.dateAchat || a.createdAt || 0).getTime();
    const dateB = new Date(b.dateAchat || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const filteredProformas = proformaInvoices.filter(p => {
    const productsSearchStr = p.produits ? p.produits.map(item => item.produit).join(' ') : '';
    const search = searchTerm.toLowerCase();
    return (
      p.nomPrenom.toLowerCase().includes(search) ||
      (p.telephone && p.telephone.toLowerCase().includes(search)) ||
      (p.email && p.email.toLowerCase().includes(search)) ||
      productsSearchStr.toLowerCase().includes(search)
    );
  }).sort((a, b) => new Date(b.dateCreation || b.createdAt || 0).getTime() - new Date(a.dateCreation || a.createdAt || 0).getTime());

  return (
    <div id="clients-section" className="space-y-6">
      
      {/* Top Banner with Navigation between Real Sales & Proforma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Gestion des Ventes & Réparations
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-250">
              {activeClientTab === 'real' ? `${clients.length} clients` : `${proformaInvoices.length} proformas`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dossiers clients : facturation, bons de commande, bons de livraison et proformas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle between Ventes Réelles & Proformas */}
          <div className="inline-flex rounded-xl border border-slate-250 p-1 bg-white shadow-3xs">
            <button
              type="button"
              onClick={() => setActiveClientTab('real')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeClientTab === 'real'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Dossiers Clients ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveClientTab('proforma')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeClientTab === 'proforma'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Factures Proforma ({proformaInvoices.length})
            </button>
          </div>

          {activeClientTab === 'real' ? (
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Client
            </button>
          ) : (
            <button
              onClick={() => setIsProformaFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Rédiger Facture Proforma
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom client, téléphone, RC, NIF, article commandé..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:outline-hidden transition-all shadow-3xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-5 pt-1">
          {/* Type Client Filter: Vente ou Vente et Réparation */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
              Type Client:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setFilterTypeClient('all')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterTypeClient === 'all' ? 'bg-white text-slate-800 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterTypeClient('vente')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterTypeClient === 'vente' ? 'bg-white text-blue-700 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Vente
              </button>
              <button
                onClick={() => setFilterTypeClient('vente_reparation')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterTypeClient === 'vente_reparation' ? 'bg-white text-amber-700 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Vente &amp; Réparation
              </button>
            </div>
          </div>

          {/* Remise Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
              <Filter className="w-3.5 h-3.5" /> Remise:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setFilterRemise('all')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterRemise === 'all' ? 'bg-white text-slate-800 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterRemise('oui')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterRemise === 'oui' ? 'bg-white text-emerald-700 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Avec Remise
              </button>
              <button
                onClick={() => setFilterRemise('non')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterRemise === 'non' ? 'bg-white text-slate-800 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Sans Remise
              </button>
            </div>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
              <DollarSign className="w-3.5 h-3.5" /> Règlement:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setFilterPayment('all')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterPayment === 'all' ? 'bg-white text-slate-800 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterPayment('paye')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterPayment === 'paye' ? 'bg-white text-emerald-700 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Réglé
              </button>
              <button
                onClick={() => setFilterPayment('partiel')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterPayment === 'partiel' ? 'bg-white text-amber-600 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Partiel
              </button>
              <button
                onClick={() => setFilterPayment('non_paye')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${filterPayment === 'non_paye' ? 'bg-white text-red-600 shadow-3xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Non Payé
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Customers or Proformas List */}
      {activeClientTab === 'proforma' ? (
        filteredProformas.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white text-xs font-black uppercase tracking-wider">
                    <th className="px-5 py-3.5">Client Potentiel & Contact</th>
                    <th className="px-5 py-3.5">Articles & Désignation</th>
                    <th className="px-5 py-3.5">Délai & Rendez-vous</th>
                    <th className="px-5 py-3.5">Date Établissement</th>
                    <th className="px-5 py-3.5">Montant HT & TTC</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredProformas.map((proforma) => {
                    const totalHT = proforma.produits ? proforma.produits.reduce((sum, item) => sum + ((item.prixApresRemise || item.prixBase || 0) * (item.quantite || 0)), 0) : 0;
                    const totalTVA = proforma.tvaApplicable ? Math.round(totalHT * 0.19) : 0;
                    const totalTTC = totalHT + totalTVA;

                    return (
                      <tr key={proforma.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center font-black text-sm uppercase flex-shrink-0">
                              {proforma.nomPrenom.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-base truncate max-w-[240px]" title={proforma.nomPrenom}>
                                {proforma.nomPrenom}
                              </p>
                              {proforma.telephone && (
                                <p className="text-xs text-slate-600 font-mono mt-0.5">{proforma.telephone}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="leading-tight space-y-1">
                            {proforma.produits && proforma.produits.length > 0 ? (
                              proforma.produits.map((p, pIdx) => (
                                <div key={p.id || pIdx} className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs max-w-[200px] truncate" title={p.produit}>
                                    • {p.produit}
                                  </span>
                                  <span className="inline-flex items-center text-[10px] font-black text-blue-900 bg-blue-100/80 px-1.5 py-0.5 rounded border border-blue-200">
                                    x{p.quantite}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs italic">-</span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-xs font-medium">
                          {proforma.delaiRealisation || 'Non spécifié'}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-slate-600">
                          {proforma.dateCreation}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">
                          {formatCurrency(totalTTC)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenProformaDocument(proforma)}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold cursor-pointer"
                              title="Imprimer / Visualiser"
                            >
                              Imprimer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConvertProformaToClient(proforma)}
                              className="px-2.5 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs cursor-pointer"
                              title="Valider en vente"
                            >
                              Valider Vente
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProforma(proforma.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
            <FileSpreadsheet className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Aucune Facture Proforma trouvée</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchTerm ? 'Aucune proforma ne correspond à votre recherche.' : 'Rédigez un devis proforma pour un nouveau client.'}
            </p>
            <button
              onClick={() => setIsProformaFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Rédiger une Facture Proforma
            </button>
          </div>
        )
      ) : filteredClients.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                  <th className="px-5 py-3.5">Client & Contact</th>
                  <th className="px-5 py-3.5">Type de Client</th>
                  <th className="px-5 py-3.5">Article & Quantité</th>
                  <th className="px-5 py-3.5">Date d'achat</th>
                  <th className="px-5 py-3.5">Édition Documents</th>
                  <th className="px-5 py-3.5">Paiement & Reste</th>
                  <th className="px-5 py-3.5">Tarification Net</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredClients.map((client) => {
                  const isReparation = client.typeClient === 'vente_reparation';

                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-black text-sm uppercase flex-shrink-0">
                            {client.nomPrenom.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p 
                              className="font-bold text-slate-900 hover:text-amber-500 hover:underline cursor-pointer transition-colors text-base truncate max-w-[240px]"
                              onClick={() => setSelectedClientForDetails(client)}
                              title={client.nomPrenom}
                            >
                              {client.nomPrenom}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                              {client.telephone && (
                                <span className="flex items-center gap-1 font-semibold text-slate-500">
                                  <Phone className="w-3.5 h-3.5" /> {client.telephone}
                                </span>
                              )}
                              {client.email && (
                                <span className="flex items-center gap-1 truncate max-w-[150px]" title={client.email}>
                                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Client: Vente ou Vente et Réparation */}
                      <td className="px-5 py-4">
                        {isReparation ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-amber-50 text-amber-900 border border-amber-300">
                            <Wrench className="w-3.5 h-3.5 text-amber-600" />
                            Vente &amp; Réparation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-blue-50 text-blue-900 border border-blue-200">
                            <Package className="w-3.5 h-3.5 text-blue-600" />
                            Vente
                          </span>
                        )}
                      </td>

                      {/* Article & Quantité */}
                      <td className="px-5 py-4">
                        <div className="leading-tight space-y-1">
                          {client.produits && client.produits.length > 0 ? (
                            client.produits.map((p, pIdx) => (
                              <div key={p.id || pIdx} className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs max-w-[200px] truncate" title={p.produit}>
                                  • {p.produit}
                                </span>
                                <span className="inline-flex items-center text-[10px] font-black text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                                  x{p.quantite}
                                </span>
                              </div>
                            ))
                          ) : (
                            <>
                              <p className="font-bold text-slate-900 text-sm max-w-[220px] truncate" title={client.produit}>
                                {client.produit || 'Article'}
                              </p>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-600 mt-1">
                                Qté: {client.quantite ?? 0}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Date d'achat */}
                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {client.dateAchat || '-'}
                      </td>

                      {/* Documents ERP */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(client, 'facture')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-3xs uppercase"
                            title="Voir la Facture"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Facture
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(client, 'bon_commande')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                            title="Bon de Commande"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-slate-600" />
                            BC
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(client, 'bon_livraison')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                            title="Bon de Livraison"
                          >
                            <Truck className="w-3.5 h-3.5 text-slate-600" />
                            BL
                          </button>
                        </div>
                      </td>

                      {/* Paiement */}
                      <td className="px-5 py-4">
                        {(() => {
                          const totalContratHT = client.produits && client.produits.length > 0
                            ? client.produits.reduce((sum, item) => sum + ((item.prixApresRemise || item.prixBase || 0) * (item.quantite || 0)), 0)
                            : (client.prixApresRemise || client.prixBase || 0);
                          const totalContratTVA = client.tvaApplicable !== false ? Math.round(totalContratHT * 0.19) : 0;
                          const totalContrat = totalContratHT + totalContratTVA;
                          const montantPaye = client.montantPaye || 0;
                          const reste = Math.max(0, totalContrat - montantPaye);

                          return (
                            <div className="space-y-1 font-mono text-xs">
                              <span className="block font-bold text-slate-900">
                                Payé: {formatCurrency(montantPaye)}
                              </span>
                              <span className={`block font-semibold ${reste > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {reste > 0 ? `Reste: ${formatCurrency(reste)}` : 'Solde 0 DA'}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Tarification Net */}
                      <td className="px-5 py-4">
                        {(() => {
                          const totalContratHT = client.produits && client.produits.length > 0
                            ? client.produits.reduce((sum, item) => sum + ((item.prixApresRemise || item.prixBase || 0) * (item.quantite || 0)), 0)
                            : (client.prixApresRemise || client.prixBase || 0);
                          const totalContratTVA = client.tvaApplicable !== false ? Math.round(totalContratHT * 0.19) : 0;
                          const totalContrat = totalContratHT + totalContratTVA;

                          return (
                            <div className="font-mono text-xs">
                              <span className="block font-extrabold text-slate-950">
                                {formatCurrency(totalContrat)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans block">
                                {client.tvaApplicable !== false ? 'TTC (19%)' : 'HT (Exonéré)'}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedClientForDetails(client)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Voir Détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(client)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(client.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800 mb-1">Aucun dossier client trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchTerm ? 'Aucun client ne correspond aux critères de recherche.' : 'Créez votre premier dossier client de vente ou réparation.'}
          </p>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Dossier Client
          </button>
        </div>
      )}

      {/* Client Form Modal */}
      {isFormOpen && (
        <ClientFormModal
          client={selectedClientForEdit}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveClient}
          stockItems={stockItems}
          clients={clients}
          suppliers={suppliers}
        />
      )}

      {/* Client Details Modal */}
      {selectedClientForDetails && (
        <ClientDetailsModal
          client={selectedClientForDetails}
          onClose={() => setSelectedClientForDetails(null)}
          onEdit={handleOpenEditForm}
          onViewDocument={handleOpenDocument}
          userRole={userRole}
        />
      )}

      {/* ERP Document Viewer Modal */}
      {selectedDocClient && (
        <DocumentViewerModal
          client={selectedDocClient}
          initialType={selectedDocType}
          onClose={() => setSelectedDocClient(null)}
        />
      )}

      {/* Proforma Invoice Form Modal */}
      {isProformaFormOpen && (
        <ProformaFormModal
          onClose={() => setIsProformaFormOpen(false)}
          onSave={handleSaveProforma}
          stockItems={stockItems}
        />
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 text-left space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black uppercase">Confirmer la suppression</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Êtes-vous sûr de vouloir supprimer définitivement ce dossier client ? Cette opération ne peut pas être annulée.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={executeDelete}
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
