import React, { useState } from 'react';
import { StoreState } from '../../types';
import { Settings, Lock, FileCode, Download, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AdminSecurityTabProps {
  state: StoreState;
  onUpdateAdminPin: (pin: string) => void;
  onResetToDefault: () => void;
  onImportData: (data: StoreState) => void;
  showToast: (msg: string) => void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({
  state,
  onUpdateAdminPin,
  onResetToDefault,
  onImportData,
  showToast,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) return;
    onUpdateAdminPin(newPin.trim());
    setNewPin('');
    showToast('Admin password kamyabi se change ho gaya! 🔒');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ahmed-bhai-store-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON download shuru ho gaya!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed && parsed.items && Array.isArray(parsed.items)) {
            onImportData(parsed);
            showToast('Backup data kamyabi se restore ho gaya! ✅');
          } else {
            alert('Invalid backup structure!');
          }
        } catch {
          alert('Ghalat backup file format!');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-[#14141e] border border-neutral-800 rounded-3xl p-5 sm:p-7 max-w-3xl mx-auto shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-neutral-400" />
          Security & Data Management
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Admin password change karein ya data ka backup download karein.
        </p>
      </div>

      {/* Change Password Form */}
      <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Admin Password Tabdeel Karein</span>
        </h3>
        <form onSubmit={handleChangePin} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="password"
            id="input-new-admin-pin"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Naya Password likhein (e.g. ahmed123)..."
            className="w-full sm:flex-1 px-3.5 py-2.5 bg-[#08080c] border border-neutral-700 focus:border-[#ff5500] rounded-xl text-white text-sm outline-none font-mono"
            required
          />
          <button
            type="submit"
            id="btn-update-admin-pin"
            className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer active:scale-98"
          >
            Password Update Karein
          </button>
        </form>
      </div>

      {/* Backup & Restore */}
      <div className="bg-[#0e0e16] p-4 sm:p-5 rounded-2xl border border-neutral-700 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span>Backup & Export Data</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Aap apne store ke tamam cards, prices, announcements aur contact details ka JSON backup download kar ke mehfooz rakh sakte hain.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            id="btn-export-backup"
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-neutral-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Download Backup (JSON)
          </button>

          <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-neutral-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Restore from Backup</span>
            <input
              type="file"
              id="input-restore-backup"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>
        </div>
      </div>

      {/* Reset Defaults */}
      <div className="bg-red-950/20 border border-red-800/40 p-4 sm:p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-red-400 mb-1">
          Reset Store to Original Defaults
        </h3>
        <p className="text-xs text-neutral-400 mb-3">
          Agar aap original website wale 4 cards aur defaults wapas lana chahte hain to reset dabayein.
        </p>
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetToDefault();
                setConfirmReset(false);
                showToast('Store reset to defaults!');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Confirm Reset? Yes ⚠️
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Store
          </button>
        )}
      </div>
    </div>
  );
};
