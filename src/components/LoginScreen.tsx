import React, { useState } from 'react';
import { User } from '../types';
import { ChaouiLogo } from './ChaouiLogo';
import { Lock, User as UserIcon, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authorized accounts (Admin and Commercial only)
  const ACCOUNTS = {
    admin: {
      username: 'admin',
      email: 'direction@chaoui-bv.dz',
      fullName: 'Islam Chaoui',
      password: 'admin',
      role: 'admin' as const,
      description: 'Direction Générale (Accès Total, Gestion Commerciale & Stocks)'
    },
    commercial: {
      username: 'commercial',
      email: 'commercial@chaoui-bv.dz',
      fullName: 'Yacine Djebbar',
      password: 'commercial',
      role: 'commercial' as const,
      description: 'Service Ventes & Clientèle (Saisie, Devis, Proformas & Facturation)'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim().toLowerCase();

    // Check custom credentials if updated in profile modal
    let customCreds: any = {};
    try {
      customCreds = JSON.parse(localStorage.getItem('chaoui_custom_creds') || '{}');
    } catch (e) {
      console.error(e);
    }

    const adminUser = customCreds.admin?.username || ACCOUNTS.admin.username;
    const adminPass = customCreds.admin?.password || ACCOUNTS.admin.password;
    const adminName = customCreds.admin?.fullName || ACCOUNTS.admin.fullName;
    const adminEmail = customCreds.admin?.email || ACCOUNTS.admin.email;

    const commUser = customCreds.commercial?.username || ACCOUNTS.commercial.username;
    const commPass = customCreds.commercial?.password || ACCOUNTS.commercial.password;
    const commName = customCreds.commercial?.fullName || ACCOUNTS.commercial.fullName;
    const commEmail = customCreds.commercial?.email || ACCOUNTS.commercial.email;

    if (trimmedUser === adminUser.toLowerCase() || trimmedUser === adminEmail.toLowerCase() || trimmedUser === 'admin') {
      if (password === adminPass) {
        onLogin({
          username: adminUser,
          fullName: adminName,
          email: adminEmail,
          role: 'admin'
        });
        return;
      } else {
        setErrorMsg('Mot de passe incorrect pour le compte Administrateur.');
        return;
      }
    }

    if (trimmedUser === commUser.toLowerCase() || trimmedUser === commEmail.toLowerCase() || trimmedUser === 'commercial') {
      if (password === commPass) {
        onLogin({
          username: commUser,
          fullName: commName,
          email: commEmail,
          role: 'commercial'
        });
        return;
      } else {
        setErrorMsg('Mot de passe incorrect pour le compte Commercial.');
        return;
      }
    }

    setErrorMsg('Compte inconnu. Utilisez le compte admin ou commercial.');
  };

  const handlePrefill = (type: 'admin' | 'commercial') => {
    const selected = ACCOUNTS[type];
    setUsername(selected.username);
    setPassword(selected.password);
    setErrorMsg(null);
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Box */}
      <div id="login-card" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 z-10 transition-all duration-200">
        
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 select-none">
          {/* Custom CHAOUI Wordmark Logo */}
          <div className="h-16 w-auto flex items-center justify-center mb-3">
            <ChaouiLogo className="h-full w-auto" />
          </div>

          <span className="inline-flex items-center text-[10px] font-black uppercase text-[#f59e0b] border border-[#f59e0b]/30 px-3.5 py-1 rounded-full tracking-wider bg-[#f59e0b]/10">
            TRANSMISSIONS • CAMIONS &amp; BUS
          </span>

          <p className="text-xs text-slate-400 mt-3 max-w-[320px]">
            Portail de Gestion Interne — Boîtes de Vitesses &amp; Pièces Poids Lourds
          </p>
        </div>

        {/* Demo Accounts Quick Selection (Admin and Commercial only) */}
        <div className="mb-6 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Sélectionnez l'un des comptes autorisés :
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handlePrefill('admin')}
              className="flex items-start text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-black mr-2.5 mt-0.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">Direction Générale (Admin)</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">Identifiants: admin / admin</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handlePrefill('commercial')}
              className="flex items-start text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-black mr-2.5 mt-0.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                C
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">Responsable Commercial (Ventes &amp; Devis)</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">Identifiants: commercial / commercial</p>
              </div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="bg-red-950/40 text-red-400 border border-red-900/50 rounded-lg p-2.5 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Erreur de connexion : </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Identifiant ou Email</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                <UserIcon className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin ou commercial"
                className="w-full pl-8 pr-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-amber-500 focus:outline-hidden transition-all shadow-inner placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Mot de passe</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:border-amber-500 focus:outline-hidden transition-all shadow-inner placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 text-xs font-black uppercase text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer font-bold tracking-wide"
          >
            Se Connecter au Portail Chaoui
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[9px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-600" />
            Accès sécurisé réservé au personnel de SARL CHAOUI
          </p>
        </div>

      </div>

      {/* Decorative footer */}
      <p className="text-[10px] text-slate-600 font-mono mt-4">
        © 2026 CHAOUI — Boîtes de Vitesses &amp; Pièces Poids Lourds
      </p>
    </div>
  );
}
