/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ResetDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => Promise<void>;
  clientCount: number;
  supplierCount: number;
  stockCount: number;
  movementCount: number;
}

export default function ResetDatabaseModal({
  isOpen,
  onClose,
  onConfirmReset,
  clientCount,
  supplierCount,
  stockCount,
  movementCount
}: ResetDatabaseModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const CONFIRM_KEYWORD = "SUPPRIMER TOUT";
  const isMatch = confirmationInput.trim().toUpperCase() === CONFIRM_KEYWORD;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) {
      setErrorMsg(`Veuillez saisir exactement "${CONFIRM_KEYWORD}" pour confirmer.`);
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await onConfirmReset();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Une erreur est survenue lors de la suppression des données.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-lg overflow-hidden flex flex-col text-left">
        
        {/* Header */}
        <div className="bg-red-600 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700/80 rounded-xl text-white shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide">
                Vider toutes les données
              </h3>
              <p className="text-xs text-red-100 font-medium mt-0.5">
                Action irréversible • Remise à zéro complète du logiciel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          <div className="p-4 bg-red-50 border border-red-250 rounded-xl text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-black text-red-950 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Attention : Cette opération est définitive !</span>
            </div>
            <p className="text-red-800 leading-relaxed font-medium">
              Toutes les données actuellement enregistrées dans le logiciel vont être immédiatement et définitivement effacées :
            </p>
            <ul className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-bold text-red-900 border-t border-red-200">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Dossiers Clients: <strong>{clientCount}</strong>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Achats Fournisseurs: <strong>{supplierCount}</strong>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Articles en Stock: <strong>{stockCount}</strong>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Mouvements d'historique: <strong>{movementCount}</strong>
              </li>
            </ul>
            <p className="text-[11px] text-red-700 font-semibold pt-1">
              Les factures proformas archivées seront également supprimées. Le logiciel repartira entièrement vierge.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block uppercase tracking-wider">
              Pour confirmer la suppression, tapez : <span className="font-mono text-red-600 select-all font-black">{CONFIRM_KEYWORD}</span>
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={`Tapez ${CONFIRM_KEYWORD}`}
              disabled={isDeleting}
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-mono font-bold uppercase text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg text-xs font-bold border border-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-850 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isMatch || isDeleting}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isMatch && !isDeleting
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Suppression en cours...' : 'Oui, Vider Tout Maintenant'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
