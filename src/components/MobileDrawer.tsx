/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sliders, BookOpen } from 'lucide-react';
import { i18n } from '../services/i18n';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'properties' | 'explanation';
  onChangeTab: (tab: 'properties' | 'explanation') => void;
  children: React.ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  children,
}) => {
  if (!isOpen) return null;
  const lang = i18n.getLanguage();

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full bg-[#182030] border-t border-[#2d374d] rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200 overflow-hidden">
        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-600/70" />
        </div>

        {/* Header with Tabs & Close Button */}
        <div className="px-4 py-2 border-b border-[#2d374d] flex items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex bg-[#121622] p-1 rounded-xl border border-[#2d374d]">
            <button
              onClick={() => onChangeTab('properties')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'properties'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'ceb' ? 'Pagsusi & Info' : 'Inspector & Info'}</span>
            </button>
            <button
              onClick={() => onChangeTab('explanation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'explanation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'ceb' ? 'Pormula & Pisika' : 'Analysis & Formulas'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
