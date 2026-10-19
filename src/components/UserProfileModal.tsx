import React, { useState, useEffect } from 'react';
import { User, Client, Supplier, StockItem } from '../types';
import { 
  X, User as UserIcon, Lock, Shield, CheckCircle, AlertCircle, 
  Download, RefreshCw, Key, Mail, Building, Bell, LogOut, ChevronRight, Sparkles, Check, Users, UserCheck, Eye, EyeOff,
  Trash2, AlertTriangle
} from 'lucide-react';

interface UserProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  clients: Client[];
  suppliers: Supplier[];
  stockItems: StockItem[];
  onRequestResetDatabase?: () => void;
}

export default function UserProfileModal({
  currentUser,
  onClose,
  onUpdateUser,
  onLogout,
  clients,
  suppliers,
  stockItems,
  onRequestResetDatabase
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'accounts' | 'actions'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Admin Account Management State (Direction Générale exclusively)
  const [managedFullName, setManagedFullName] = useState('');
  const [managedUsername, setManagedUsername] = useState('');
  const [managedEmail, setManagedEmail] = useState('');
  const [managedPassword, setManagedPassword] = useState('');
  const [showManagedPassword, setShowManagedPassword] = useState(false);

  // Status & Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Default account reference
  const DEFAULT_ACCOUNT = {
    username: 'admin',
    fullName: 'Islam Chaoui',
    email: 'direction@chaoui-bv.dz',
    password: 'admin',
    label: 'Direction Générale (Admin)'
  };

  // Helper to load managed account state
  const loadManagedAccount = () => {
    try {
      const storedCreds = JSON.parse(localStorage.getItem('chaoui_custom_creds') || '{}');
      const accountCreds = storedCreds['admin'] || {};

      setManagedFullName(accountCreds.fullName || DEFAULT_ACCOUNT.fullName);
      setManagedUsername(accountCreds.username || DEFAULT_ACCOUNT.username);
      setManagedEmail(accountCreds.email || DEFAULT_ACCOUNT.email);
      setManagedPassword(accountCreds.password || DEFAULT_ACCOUNT.password);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadManagedAccount();
  }, []);

  // Save General Profile Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      setStatusMessage({ type: 'error', text: 'Le nom complet et l\'identifiant sont obligatoires.' });
      return;
    }

    const updated: User = {
      ...currentUser,
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim()
    };

    onUpdateUser(updated);
    
    // Save to custom credentials list in localStorage so login persists
    try {
      const storedCreds = JSON.parse(localStorage.getItem('chaoui_custom_creds') || '{}');
      storedCreds[updated.role] = {
        ...(storedCreds[updated.role] || {}),
        username: updated.username,
        fullName: updated.fullName,
        email: updated.email
      };
      localStorage.setItem('chaoui_custom_creds', JSON.stringify(storedCreds));
    } catch (err) {
      console.error(err);
    }

    setStatusMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Change Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword) {
      setStatusMessage({ type: 'error', text: 'Veuillez saisir votre mot de passe actuel.' });
      return;
    }

    if (newPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 4 caractères.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'La confirmation du mot de passe ne correspond pas.' });
      return;
    }

    // Save new password to localStorage for login authentication
    try {
      const storedCreds = JSON.parse(localStorage.getItem('chaoui_custom_creds') || localStorage.getItem('carpole_custom_creds') || '{}');
      storedCreds[currentUser.role] = {
        ...(storedCreds[currentUser.role] || {}),
        password: newPassword
      };
      localStorage.setItem('chaoui_custom_creds', JSON.stringify(storedCreds));
    } catch (err) {
      console.error(err);
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage({ type: 'success', text: 'Votre mot de passe a été modifié avec succès ! Utilise ce nouveau mot de passe lors de vos prochaines connexions.' });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Admin Save Managed Account
  const handleSaveManagedAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!managedFullName.trim() || !managedUsername.trim()) {
      setStatusMessage({ type: 'error', text: 'Le nom complet et l\'identifiant sont obligatoires.' });
      return;
    }

    try {
      const storedCreds = JSON.parse(localStorage.getItem('chaoui_custom_creds') || localStorage.getItem('carpole_custom_creds') || '{}');
      storedCreds['admin'] = {
        fullName: managedFullName.trim(),
        username: managedUsername.trim().toLowerCase(),
        email: managedEmail.trim(),
        password: managedPassword || DEFAULT_ACCOUNT.password
      };
      // Remove any commercial account
      delete storedCreds['commercial'];
      localStorage.setItem('chaoui_custom_creds', JSON.stringify(storedCreds));

      onUpdateUser({
        ...currentUser,
        fullName: managedFullName.trim(),
        username: managedUsername.trim().toLowerCase(),
        email: managedEmail.trim()
      });

      setStatusMessage({
        type: 'success',
        text: `Les identifiants de la Direction Générale ont été mis à jour avec succès !`
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement des identifiants.' });
    }
  };

  // Export Database JSON Backup
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      currentUser,
      clientsCount: clients.length,
      suppliersCount: suppliers.length,
      stockItemsCount: stockItems.length,
      clients,
      suppliers,
      stockItems
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `CHAOUI_TRANSMISSIONS_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMessage({ type: 'success', text: 'Sauvegarde complète de la base de données téléchargée !' });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        {/* Header Banner */}
        <div className="bg-slate-900 p-6 text-white relative flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner border border-white/20 ${
              currentUser.role === 'admin' 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-cyan-500 text-slate-950'
            }`}>
              {currentUser.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{currentUser.fullName}</h2>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Direction Générale
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{currentUser.email}</p>
              <p className="text-[10px] text-amber-400/90 font-bold mt-0.5 flex items-center gap-1">
                <Building className="w-3 h-3 text-amber-400" /> GEARMAX • TRANSMISSIONS &amp; POIDS LOURDS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('profile'); setStatusMessage(null); }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 border-slate-200 border-b-transparent -mb-px font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <UserIcon className="w-4 h-4 text-amber-500" />
            Mon Profil
          </button>

          <button
            onClick={() => { setActiveTab('password'); setStatusMessage(null); }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x whitespace-nowrap ${
              activeTab === 'password'
                ? 'bg-white text-slate-900 border-slate-200 border-b-transparent -mb-px font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <Key className="w-4 h-4 text-amber-500" />
            Mon Mot de passe
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => { 
                setActiveTab('accounts'); 
                setStatusMessage(null); 
                loadManagedAccount(); 
              }}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'accounts'
                  ? 'bg-white text-slate-900 border-slate-200 border-b-transparent -mb-px font-black shadow-2xs'
                  : 'text-amber-700 font-extrabold hover:text-slate-900 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4 text-amber-500" />
              Sécurité & Accès Direction (Admin)
            </button>
          )}

          <button
            onClick={() => { setActiveTab('actions'); setStatusMessage(null); }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x whitespace-nowrap ${
              activeTab === 'actions'
                ? 'bg-white text-slate-900 border-slate-200 border-b-transparent -mb-px font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Actions & Outils
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-150 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: Profile Information */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/60 p-3.5 rounded-xl text-xs text-slate-700">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Identifiants de Session Utilisateur
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Vous pouvez mettre à jour le Nom Complet affiché dans le portail ainsi que votre Identifiant de connexion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Nom & Prénom Completes *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Farid Bouchaib"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-850 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Identifiant de Connexion *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: admin"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-850 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Adresse Email Professionnelle
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: direction@chaoui-bv.dz"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-850 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Enregistrer les modifications du Profil
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Password Change */}
          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-500" />
                  Modification du Mot de Passe
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Changez votre mot de passe d'accès au portail. La mise à jour est immédiate pour vos prochaines sessions.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Mot de passe actuel *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-850 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 4 caractères"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-850 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le nouveau mot de passe"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-850 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden transition-all shadow-3xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Mettre à jour le Mot de Passe
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADMIN ACCOUNTS MANAGEMENT */}
          {activeTab === 'accounts' && currentUser.role === 'admin' && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-300 p-4 rounded-xl text-xs text-slate-800">
                <p className="font-extrabold text-amber-950 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Gestion des Accès — Compte Unique Direction Générale
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Le système est configuré pour l'usage exclusif de la Direction Générale. Vous pouvez modifier ici votre nom, identifiant de connexion et mot de passe d'accès.
                </p>
              </div>

              {/* Form to update Direction Générale account */}
              <form onSubmit={handleSaveManagedAccount} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    Identifiants de la Direction Générale
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-250">
                    Accès Exclusif
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Nom & Prénom de l'utilisateur *
                    </label>
                    <input
                      type="text"
                      required
                      value={managedFullName}
                      onChange={(e) => setManagedFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Identifiant de connexion (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={managedUsername}
                      onChange={(e) => setManagedUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      value={managedEmail}
                      onChange={(e) => setManagedEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-slate-900 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block text-amber-900">
                      Mot de passe d'accès (Définir ou modifier) *
                    </label>
                    <div className="relative">
                      <input
                        type={showManagedPassword ? 'text' : 'password'}
                        required
                        value={managedPassword}
                        onChange={(e) => setManagedPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowManagedPassword(!showManagedPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      >
                        {showManagedPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Ce mot de passe permettra à l'utilisateur de se connecter immédiatement avec ces nouveaux identifiants.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Enregistrer les identifiants du compte
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Useful Buttons & Actions */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Outils d'Administration & Actions Rapides
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Action 1: Statut Direction Générale */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                      Privilèges Totaux
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-black text-slate-800">
                      Direction Générale
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Compte unique autorisé. Contrôle complet sur toutes les fonctionnalités et suppressions.
                    </p>
                  </div>
                </div>

                {/* Action 2: Backup Data */}
                <button
                  type="button"
                  onClick={handleExportData}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/30 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Backup JSON
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                      Sauvegarder la Base de Données
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Téléchargez un fichier JSON sécurisé contenant tous vos clients, achats fournisseurs et articles de stock.
                    </p>
                  </div>
                </button>

                {/* Action 3: Preferences / Notifications Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    setStatusMessage({
                      type: 'success',
                      text: notificationsEnabled ? 'Alertes visuelles de stock désactivées.' : 'Alertes visuelles de stock activées.'
                    });
                    setTimeout(() => setStatusMessage(null), 3000);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/30 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      notificationsEnabled ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {notificationsEnabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Alertes & Notifications de Stock
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Affiche des bannière d'alerte rouge immédiates lorsque le stock passe en-dessous du seuil minimal.
                    </p>
                  </div>
                </button>

                {/* Action 4: Logout / Lock session */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-200 text-slate-700 group-hover:bg-slate-300 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      Déconnexion
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-black text-slate-800 transition-colors">
                      Verrouiller & Se Déconnecter
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Ferme votre session courante en toute sécurité et retourne à l'écran de connexion.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-between items-center text-[10px] text-slate-400">
          <span>Connecté en tant que <strong className="text-slate-700">{currentUser.fullName}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
