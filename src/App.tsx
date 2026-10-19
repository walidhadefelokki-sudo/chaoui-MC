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
  getStockMovements, saveStockMovement, deleteStockMovement,
  clearStockMovements, clearAllData
} from './lib/db';
import { SEED_CLIENTS, SEED_SUPPLIERS, SEED_STOCK } from './lib/seedData';
import DashboardStats from './components/DashboardStats';
import ClientSection from './components/ClientSection';
import SupplierSection from './components/SupplierSection';
import StockSection from './components/StockSection';
import StockHistorySection from './components/StockHistorySection';
import UserProfileModal from './components/UserProfileModal';
import LoginScreen from './components/LoginScreen';
import { GearMaxLogo } from './components/GearMaxLogo';
import { ChaouiLogo } from './components/ChaouiLogo';
import { Truck, ShieldAlert, ShoppingBag, Users, LogOut, Shield, Boxes, User as UserIcon, History } from 'lucide-react';

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

  // User Session State: Admin name must be Islam Chaoui
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    localStorage.removeItem('carpole_user');
    localStorage.removeItem('carpole_custom_creds');
    const stored = localStorage.getItem('chaoui_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          username: 'admin',
          fullName: 'Islam Chaoui',
          email: parsed.email || 'direction@chaoui-bv.dz',
          role: 'admin' as const
        };
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



  // Customer Actions
  const handleAddClient = async (newClient: Client) => {
    try {
      await saveClient(newClient);
      setClients(prev => [newClient, ...prev]);
    } catch (err) {
      console.error("Failed to add client:", err);
    }
  };

  const handleEditClient = async (updatedClient: Client) => {
    try {
      await saveClient(updatedClient);
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (err) {
      console.error("Failed to edit client:", err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete client:", err);
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
    try {
      await deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete supplier:", err);
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
    }
  };

  // Stock Actions
  const handleAddStockItem = async (newStockItem: StockItem) => {
    try {
      await saveStockItem(newStockItem);
      setStockItems(prev => [newStockItem, ...prev]);
    } catch (err) {
      console.error("Failed to add stock item:", err);
    }
  };

  const handleEditStockItem = async (updatedStockItem: StockItem) => {
    try {
      await saveStockItem(updatedStockItem);
      setStockItems(prev => prev.map(item => item.id === updatedStockItem.id ? updatedStockItem : item));
    } catch (err) {
      console.error("Failed to edit stock item:", err);
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    try {
      await deleteStockItem(id);
      setStockItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete stock item:", err);
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

  const handleDeleteMovement = async (id: string) => {
    try {
      await deleteStockMovement(id);
      setMovements(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to delete stock movement:", err);
    }
  };

  const handleClearMovements = async () => {
    try {
      await clearStockMovements();
      setMovements([]);
    } catch (err) {
      console.error("Failed to clear stock movements:", err);
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
          
          {/* Brand Identity: GearMax */}
          <div className="flex items-center gap-4 self-start md:self-center">
            <div className="flex items-center py-1">
              <GearMaxLogo variant="on-dark" className="h-10 sm:h-12 w-auto object-contain drop-shadow" />
            </div>
            <div className="hidden lg:block border-l border-slate-700/60 pl-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block leading-tight">
                Gestion Commerciale &amp; Stocks
              </span>
              <span className="text-[9px] text-amber-400 font-mono font-semibold">
                GearMax • Transmissions Poids Lourds
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
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Direction Générale
                  </span>
                </div>
              </div>
            </button>
            <div className="h-6 w-px bg-slate-700/60" />
            
            
            
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
                  stockItems={stockItems}
                  currentUser={currentUser}
                  onAddStockMovement={handleAddStockMovement}
                  onEditStockItem={handleEditStockItem}
                  onDeleteMovement={handleDeleteMovement}
                  onClearMovements={handleClearMovements}
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
            <span>© {new Date().getFullYear()} Chaoui Moundji Islam. Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-500">RC: 04/00- 20744945 A 25 • NIF: 19725010758115300400 • NIS: 199725010758126 • ART: 04030052121</span>
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
        />
      )}

    </div>
  );
}
