/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Save,
  FolderOpen,
  Download,
  Upload,
  Sparkles,
  ShieldCheck,
  Globe,
  Trash2,
  Zap,
} from 'lucide-react';
import { i18n, Language } from '../services/i18n';

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenPresets: () => void;
  onOpenQA: () => void;
  onClear: () => void;
  currentLang: Language;
  onSetLang: (lang: Language) => void;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onExport,
  onImport,
  onOpenPresets,
  onOpenQA,
  onClear,
  currentLang,
  onSetLang,
}) => {
  if (!isOpen) return null;
  const lang = i18n.getLanguage();

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full bg-[#182030] border-t border-[#2d374d] rounded-t-3xl shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh] animate-in slide-in-from-bottom duration-200 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d374d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm">Volt-Flow Menu</span>
              <span className="text-[10px] text-slate-400 block">Actions & Settings</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Switcher */}
        <div className="bg-[#121622] p-3 rounded-2xl border border-[#2d374d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200">
              {lang === 'ceb' ? 'Pinulongan' : 'Language'}
            </span>
          </div>
          <div className="flex bg-[#1a2030] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => onSetLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentLang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSetLang('ceb')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentLang === 'ceb' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Bisaya
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenPresets();
            }}
            className="p-3 bg-[#131724] hover:bg-[#1f283d] border border-[#2d374d] rounded-2xl text-left flex items-center gap-2.5 transition active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">{i18n.t('presets-btn')}</div>
              <div className="text-[10px] text-slate-400">Library</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenQA();
            }}
            className="p-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-2xl text-left flex items-center gap-2.5 transition active:scale-95"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-300">{i18n.t('qa-report-btn')}</div>
              <div className="text-[10px] text-slate-400">Audit & Tests</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSave();
            }}
            className="p-3 bg-[#131724] hover:bg-[#1f283d] border border-[#2d374d] rounded-2xl text-left flex items-center gap-2.5 transition active:scale-95"
          >
            <Save className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">{i18n.t('save-btn')}</div>
              <div className="text-[10px] text-slate-400">LocalStorage</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onLoad();
            }}
            className="p-3 bg-[#131724] hover:bg-[#1f283d] border border-[#2d374d] rounded-2xl text-left flex items-center gap-2.5 transition active:scale-95"
          >
            <FolderOpen className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">{i18n.t('load-btn')}</div>
              <div className="text-[10px] text-slate-400">Restore</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onExport();
            }}
            className="p-3 bg-[#131724] hover:bg-[#1f283d] border border-[#2d374d] rounded-2xl text-left flex items-center gap-2.5 transition active:scale-95"
          >
            <Download className="w-5 h-5 text-slate-300 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">{i18n.t('export-btn')}</div>
              <div className="text-[10px] text-slate-400">Save .json</div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onImport();
            }}
            className="p-3 bg-[#131724] hover:bg-[#1f283d] border border-[#2d374d] rounded-2xl text-left flex items-center gap-2.5 transition active:scale-95"
          >
            <Upload className="w-5 h-5 text-slate-300 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-200">{i18n.t('import-btn')}</div>
              <div className="text-[10px] text-slate-400">Load .json</div>
            </div>
          </button>
        </div>

        {/* Clear Circuit */}
        <button
          onClick={() => {
            onClose();
            onClear();
          }}
          className="w-full p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-2xl text-red-400 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>{i18n.t('clear-all')}</span>
        </button>
      </div>
    </div>
  );
};
