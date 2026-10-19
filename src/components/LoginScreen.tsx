import React, { useState } from 'react';
import { User } from '../types';
import { GearMaxLogo } from './GearMaxLogo';
import { Lock, User as UserIcon, ShieldAlert, Sparkles, AlertCircle, Shield } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authorized account: Direction Générale exclusively
  const ADMIN_ACCOUNT = {
    username: 'admin',
    email: 'direction@chaoui-bv.dz',
    fullName: 'Islam Chaoui',
    password: 'admin',
    role: 'admin' as const,
    description: 'Direction Générale (Accès Total, Gestion Commerciale & Stocks)'
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

    const adminUser = customCreds.admin?.username || ADMIN_ACCOUNT.username;
    const adminPass = customCreds.admin?.password || ADMIN_ACCOUNT.password;
    const adminName = customCreds.admin?.fullName || ADMIN_ACCOUNT.fullName;
    const adminEmail = customCreds.admin?.email || ADMIN_ACCOUNT.email;

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
        setErrorMsg('Mot de passe incorrect pour le compte Direction Générale.');
        return;
      }
    }

    if (trimmedUser === 'commercial' || trimmedUser.includes('commercial')) {
      setErrorMsg('Ce compte a été désactivé. Seul le compte Direction Générale est autorisé à accéder au système.');
      return;
    }

    setErrorMsg('Compte non reconnu. Veuillez vous connecter avec le compte Direction Générale.');
  };

  const handlePrefill = () => {
    setUsername(ADMIN_ACCOUNT.username);
    setPassword(ADMIN_ACCOUNT.password);
    setErrorMsg(null);
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Ambience Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Box */}
      <div id="login-card" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 z-10 transition-all duration-200">
        
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 select-none">
          {/* Official GearMax Logo without white background */}
          <div className="flex items-center justify-center mb-4 py-1">
            <GearMaxLogo variant="on-dark" className="h-16 sm:h-20 w-auto object-contain drop-shadow-xl" />
          </div>

          <span className="inline-flex items-center text-[10px] font-black uppercase text-[#f59e0b] border border-[#f59e0b]/30 px-3.5 py-1 rounded-full tracking-wider bg-[#f59e0b]/10">
            TRANSMISSIONS • CAMIONS &amp; BUS
          </span>

          <p className="text-xs text-slate-400 mt-3 max-w-[320px]">
            Portail de Gestion Interne — Boîtes de Vitesses &amp; Pièces Poids Lourds
          </p>
        </div>

        {/* Direction Générale Quick Selection Button */}
        <div className="mb-6 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Compte Autorisé — Direction Générale :
          </span>
          <button
            type="button"
            onClick={handlePrefill}
            className="w-full flex items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-black mr-3 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">Direction Générale (Islam Chaoui)</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">Identifiants par défaut : admin / admin</p>
            </div>
          </button>
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
                placeholder="Identifiant Direction Générale (ex: admin)"
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
            Se Connecter à l'Espace Direction
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[9px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-600" />
            Accès sécurisé réservé à la Direction Générale — Chaoui Moundji Islam
          </p>
        </div>

      </div>

      {/* Decorative footer */}
      <p className="text-[10px] text-slate-600 font-mono mt-4">
        © {new Date().getFullYear()} GearMax — Chaoui Moundji Islam. Tous droits réservés.
      </p>
    </div>
  );
}
