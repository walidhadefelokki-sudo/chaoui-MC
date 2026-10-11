/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, Supplier, User, StockItem, StockMovement } from './types';
import { 
  getClients, saveClient, deleteClient, 
  getSuppliers, saveSupplier, deleteSupplier,
  getStockItems, saveStockItem, deleteStockItem,
  getStockMovements, saveStockMovement,
  clearAllData
} from './lib/db';
import { SEED_CLIENTS, SEED_SUPPLIERS, SEED_STOCK } from './lib/seedData';
import DashboardStats from './components/DashboardStats';
import ClientSection from './components/ClientSection';
import SupplierSection from './components/SupplierSection';
import StockSection from './components/StockSection';
import StockHistorySection from './components/StockHistorySection';
import UserProfileModal from './components/UserProfileModal';
import LoginScreen from './components/LoginScreen';
import { ChaouiLogo } from './components/ChaouiLogo';
import { Truck, ShieldAlert, ShoppingBag, Users, LogOut, Shield, Boxes, User as UserIcon, History, Trash2 } from 'lucide-react';
import ResetDatabaseModal from './components/ResetDatabaseModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers' | 'stock' | 'history'>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // User Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Reset All Data Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // User Session State: Admin name must be Islam Chaoui
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    localStorage.removeItem('carpole_user');
    localStorage.removeItem('carpole_custom_creds');
    const stored = localStorage.getItem('chaoui_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin') {
          return {
            username: 'admin',
            fullName: 'Islam Chaoui',
            email: parsed.email || 'direction@chaoui-bv.dz',
            role: 'admin'
          };
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    // Default admin is Islam Chaoui
    return {
      username: 'admin',
      fullName: 'Islam Chaoui',
      email: 'direction@chaoui-bv.dz',
      role: 'admin'
    };
  });

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('chaoui_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('chaoui_user');
    setCurrentUser(null);
  };

  // Load data from IndexedDB on startup & Migrate with all figures at 0
  useEffect(() => {
    async function loadData() {
      try {
        const isCleanZeroMigrated = localStorage.getItem('chaoui_zero_reset_v4');

        if (!isCleanZeroMigrated) {
          // Clean out previous database stores and carpole legacy data
          try {
            await clearAllData();
          } catch (e) {
            console.warn("Could not clear previous database stores:", e);
          }

          // Seed stock items with all figures at 0
          for (const stockItem of SEED_STOCK) {
            await saveStockItem(stockItem);
          }

          localStorage.setItem('chaoui_zero_reset_v4', 'true');
        }

        let loadedClients = await getClients();
        let loadedSuppliers = await getSuppliers();
        let loadedStock = await getStockItems();
        let loadedMovements = await getStockMovements();

        // If stock is empty, initialize zeroed stock items
        if (loadedStock.length === 0) {
          for (const stockItem of SEED_STOCK) {
            await saveStockItem(stockItem);
          }
          loadedStock = await getStockItems();
        }

        setClients(loadedClients || []);
        setSuppliers(loadedSuppliers || []);
        setStockItems(loadedStock || []);
        setMovements(loadedMovements || []);
      } catch (err) {
        console.error("IndexedDB error during startup:", err);
        setDbError("Impossible de charger la base de données locale. Vérifiez les autorisations de votre navigateur.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset/Empty all data handler
  const handleResetAllData = async () => {
    try {
      await clearAllData();
      localStorage.setItem('chaoui_database_cleared', 'true');
      localStorage.removeItem('chaoui_proforma_invoices');

      setClients([]);
      setSuppliers([]);
      setStockItems([]);
      setMovements([]);

      setResetSuccessMessage("Toutes les données du logiciel ont été supprimées avec succès. Le système est maintenant vierge avec tous les compteurs à 0.");
      setTimeout(() => setResetSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to reset database:", err);
      alert("Erreur lors de la suppression des données. Veuillez réessayer.");
    }
  };

  // Restore zeroed catalog
  const handleRestoreDemoData = async () => {
    try {
      setIsLoading(true);
      await clearAllData();
      for (const stockItem of SEED_STOCK) {
        await saveStockItem(stockItem);
      }

      setClients([]);
      setSuppliers([]);
      setStockItems(SEED_STOCK);
      setMovements([]);
      setResetSuccessMessage("Le catalogue avec toutes les valeurs à 0 a été réinitialisé.");
      setTimeout(() => setResetSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Customer Actions
  const handleAddClient = async (newClient: Client) => {
    try {
      await saveClient(newClient);
      setClients(prev => [newClient, ...prev]);
    } catch (err) {
      console.error("Failed to add client:", err);
      alert("Erreur lors de l'enregistrement du client.");
    }
  };

  const handleEditClient = async (updatedClient: Client) => {
    try {
      await saveClient(updatedClient);
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (err) {
      console.error("Failed to edit client:", err);
      alert("Erreur lors de la modification du client.");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      alert("⚠️ Action Refusée : En tant que Responsable Commercial, vous n'êtes pas autorisé à supprimer les dossiers de vente. Veuillez contacter l'administrateur Islam Chaoui.");
      return;
    }
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete client:", err);
      alert("Erreur lors de la suppression du client.");
    }
  };

  // Helper to sync newly purchased products to Stock table automatically
  const syncSupplierProductsToStock = async (supplier: Supplier) => {
    const productsToSync = supplier.produits && supplier.produits.length > 0
      ? supplier.produits
      : [{
          id: crypto.randomUUID(),
          produit: supplier.articleAchete,
          prixUnitaire: supplier.prixUnitaire,
          quantite: supplier.quantite,
          type: 'matiere_premiere' as const,
          unite: 'Unités'
        }];

    for (const prod of productsToSync) {
      if (!prod.produit || !prod.produit.trim()) continue;
      const targetName = prod.produit.trim();
      const existing = stockItems.find(st => st.nom.toLowerCase().trim() === targetName.toLowerCase());
      if (!existing) {
        const newStockItem: StockItem = {
          id: crypto.randomUUID(),
          nom: targetName,
          reference: 'REF-' + Math.floor(1000 + Math.random() * 9000),
          referencePiece: 'REF-' + Math.floor(1000 + Math.random() * 9000),
          marque: 'ZF',
          quantite: 0,
          quantiteInitiale: 0,
          prixAchat: prod.prixUnitaire || 0,
          prixVente: 0,
          type: prod.type || 'matiere_premiere',
          unite: prod.unite || 'Unités',
          seuilAlerte: 2,
          prixUnitaireMoyen: prod.prixUnitaire || 0,
          fournisseurNom: supplier.nomPrenom,
          fournisseurTelephone: supplier.telephone,
          createdAt: new Date().toISOString()
        };
        await saveStockItem(newStockItem);
        setStockItems(prev => [newStockItem, ...prev]);
      }
    }
  };

  // Supplier Actions
  const handleAddSupplier = async (newSupplier: Supplier) => {
    try {
      await saveSupplier(newSupplier);
      setSuppliers(prev => [newSupplier, ...prev]);
      await syncSupplierProductsToStock(newSupplier);
    } catch (err) {
      console.error("Failed to add supplier:", err);
      alert("Erreur lors de l'enregistrement de l'achat.");
    }
  };

  const handleEditSupplier = async (updatedSupplier: Supplier) => {
    try {
      await saveSupplier(updatedSupplier);
      setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
      await syncSupplierProductsToStock(updatedSupplier);
    } catch (err) {
      console.error("Failed to edit supplier:", err);
      alert("Erreur lors de la modification de l'achat.");
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      alert("⚠️ Action Refusée : En tant que Responsable Commercial, vous n'êtes pas autorisé à supprimer les dossiers d'achat. Veuillez contacter l'administrateur Islam Chaoui.");
      return;
    }
    try {
      await deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete supplier:", err);
      alert("Erreur lors de la suppression de l'achat.");
    }
  };

  const handleToggleDeliveryStatus = async (id: string) => {
    try {
      const supplier = suppliers.find(s => s.id === id);
      if (supplier) {
        const updated = { ...supplier, livre: !supplier.livre };
        await saveSupplier(updated);
        setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
      }
    } catch (err) {
      console.error("Failed to toggle delivery status:", err);
      alert("Erreur lors de la mise à jour de la livraison.");
    }
  };

  // Stock Actions
  const handleAddStockItem = async (newStockItem: StockItem) => {
    try {
      await saveStockItem(newStockItem);
      setStockItems(prev => [newStockItem, ...prev]);
    } catch (err) {
      console.error("Failed to add stock item:", err);
      alert("Erreur lors de l'enregistrement de l'article de stock.");
    }
  };

  const handleEditStockItem = async (updatedStockItem: StockItem) => {
    try {
      await saveStockItem(updatedStockItem);
      setStockItems(prev => prev.map(item => item.id === updatedStockItem.id ? updatedStockItem : item));
    } catch (err) {
      console.error("Failed to edit stock item:", err);
      alert("Erreur lors de la mise à jour de l'article de stock.");
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      alert("⚠️ Action Refusée : Seul l'administrateur principal peut supprimer des articles de stock.");
      return;
    }
    try {
      await deleteStockItem(id);
      setStockItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete stock item:", err);
      alert("Erreur lors de la suppression de l'article de stock.");
    }
  };

  // Stock Movement Actions
  const handleAddStockMovement = async (movement: StockMovement) => {
    try {
      await saveStockMovement(movement);
      setMovements(prev => [movement, ...prev]);
    } catch (err) {
      console.error("Failed to save stock movement:", err);
    }
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleUpdateUser} />;
  }

  return (
    <div id="app-container" className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* High-End Enterprise Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="w-full px-6 sm:px-8 lg:px-12 h-20 flex flex-col md:flex-row items-center justify-between gap-4 py-2 md:py-0">
          
          {/* Brand Identity: SARL Chaoui */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="w-48 sm:w-56 h-12 flex items-center">
              <ChaouiLogo width="220" height="58" textColor="#ffffff" subtitleColor="#f59e0b" accentColor="#f59e0b" />
            </div>
            <div className="hidden lg:block border-l border-slate-700/60 pl-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                Gestion Commerciale &amp; Stocks
              </span>
              <span className="text-[9px] text-amber-400 font-mono font-semibold">
                Poids Lourds • Boîtes de Vitesses
              </span>
            </div>
          </div>

          {/* Navigation Tabs (WITHOUT Analytics & BI as requested) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('clients')}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Clients (Ventes &amp; Réparations)
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Fournisseurs
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Gestion de stock
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              Historique Entrées/Sorties
            </button>
          </div>

          {/* User Session Profile (Admin: Islam Chaoui) & Logout */}
          <div className="flex items-center gap-3 self-start md:self-center bg-slate-850 py-1.5 px-3 rounded-xl border border-slate-700/45 hover:border-amber-500/50 transition-colors">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 hover:bg-slate-800/80 p-1 rounded-lg transition-all cursor-pointer group text-left"
              title="Gérer le profil utilisateur"
            >
              <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-black transition-transform group-hover:scale-105 shadow-sm ${
                currentUser.role === 'admin' 
                  ? 'bg-amber-500 text-slate-950' 
                  : 'bg-cyan-500 text-slate-950'
              }`}>
                {currentUser.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="leading-none text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white leading-none group-hover:text-amber-400 transition-colors">{currentUser.fullName}</p>
                  <UserIcon className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {currentUser.role === 'admin' ? 'Direction (Admin)' : 'Commercial'}
                  </span>
                </div>
              </div>
            </button>
            <div className="h-6 w-px bg-slate-700/60" />
            
            {/* Purge Database Button */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
                title="Vider toutes les données du logiciel"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden xl:inline text-[11px] font-black uppercase">Vider les données</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-md transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full px-6 sm:px-8 lg:px-12 py-6">
        
        {resetSuccessMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-900 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-950">Mise à jour effectuée</p>
                <p className="text-xs text-emerald-800 font-medium">{resetSuccessMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRestoreDemoData}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline px-3 py-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer shrink-0"
            >
              Réinitialiser
            </button>
          </div>
        )}

        {dbError && (
          <div className="mb-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Avertissement de base de données :</p>
              <p className="text-[11px]">{dbError}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Chargement de la base de données Chaoui Poids Lourds...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Business stats */}
            {currentUser?.role === 'admin' && (
              <DashboardStats clients={clients} suppliers={suppliers} />
            )}

            {/* Dynamic Tab Rendering (Clients / Fournisseurs / Stock / Historique) */}
            <div className="bg-slate-50 rounded-lg">
              {activeTab === 'clients' ? (
                <ClientSection
                  clients={clients}
                  stockItems={stockItems}
                  suppliers={suppliers}
                  onAddClient={handleAddClient}
                  onEditClient={handleEditClient}
                  onDeleteClient={handleDeleteClient}
                  userRole={currentUser?.role}
                />
              ) : activeTab === 'suppliers' ? (
                <SupplierSection
                  suppliers={suppliers}
                  stockItems={stockItems}
                  onAddSupplier={handleAddSupplier}
                  onEditSupplier={handleEditSupplier}
                  onDeleteSupplier={handleDeleteSupplier}
                  onToggleDeliveryStatus={handleToggleDeliveryStatus}
                  userRole={currentUser?.role}
                />
              ) : activeTab === 'stock' ? (
                <StockSection
                  stockItems={stockItems}
                  clients={clients}
                  suppliers={suppliers}
                  onAddStockItem={handleAddStockItem}
                  onEditStockItem={handleEditStockItem}
                  onDeleteStockItem={handleDeleteStockItem}
                  userRole={currentUser?.role}
                  currentUser={currentUser}
                  onAddStockMovement={handleAddStockMovement}
                />
              ) : (
                <StockHistorySection
                  movements={movements}
                  suppliers={suppliers}
                  clients={clients}
                  currentUser={currentUser}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="w-full px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Truck className="w-4.5 h-4.5 text-slate-400" />
            <span>© {new Date().getFullYear()} SARL CHAOUI POIDS LOURDS &amp; TRANSMISSIONS. Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-500">RC: 21B0073197 • NIF: 002125007319732 • NIS: 002125010026564</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
              Base de Données Synchronisée
            </span>
          </div>
        </div>
      </footer>

      {/* User Profile & Account Settings Modal */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          clients={clients}
          suppliers={suppliers}
          stockItems={stockItems}
          onRequestResetDatabase={() => setIsResetModalOpen(true)}
        />
      )}

      {/* Confirmation Modal to Empty / Purge Database */}
      <ResetDatabaseModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleResetAllData}
        clientCount={clients.length}
        supplierCount={suppliers.length}
        stockCount={stockItems.length}
        movementCount={movements.length}
      />

    </div>
  );
}
