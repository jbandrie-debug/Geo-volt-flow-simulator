/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  GitCommit,
  Plus,
  Trash2,
  Sliders,
  BookOpen,
  X,
  Battery,
  Zap,
  Activity,
  Layers,
  Repeat,
  ToggleLeft,
  Lightbulb,
  Tv,
  Box,
  Compass,
} from 'lucide-react';
import { ComponentType } from '../types/circuit';
import { ToolMode } from './Toolbar';
import { i18n } from '../services/i18n';

interface MobileBottomBarProps {
  currentTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  onAddComponent: (type: ComponentType) => void;
  onOpenInspector: () => void;
  onOpenFormulas: () => void;
  hasSelection: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentTool,
  onSelectTool,
  onAddComponent,
  onOpenInspector,
  onOpenFormulas,
  hasSelection,
}) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const lang = i18n.getLanguage();

  const componentPalette: {
    type: ComponentType;
    labelKey: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    { type: 'battery', labelKey: 'tool-battery', icon: <Battery className="w-6 h-6" />, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' },
    { type: 'acSource', labelKey: 'tool-acSource', icon: <Zap className="w-6 h-6" />, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40' },
    { type: 'resistor', labelKey: 'tool-resistor', icon: <Activity className="w-6 h-6" />, color: 'text-orange-400 border-orange-500/30 bg-orange-950/40' },
    { type: 'bulb', labelKey: 'tool-bulb', icon: <Lightbulb className="w-6 h-6" />, color: 'text-yellow-300 border-yellow-500/30 bg-yellow-950/40' },
    { type: 'switch', labelKey: 'tool-switch', icon: <ToggleLeft className="w-6 h-6" />, color: 'text-violet-400 border-violet-500/30 bg-violet-950/40' },
    { type: 'capacitor', labelKey: 'tool-capacitor', icon: <Layers className="w-6 h-6" />, color: 'text-sky-400 border-sky-500/30 bg-sky-950/40' },
    { type: 'inductor', labelKey: 'tool-inductor', icon: <Repeat className="w-6 h-6" />, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40' },
    { type: 'appliance', labelKey: 'tool-appliance', icon: <Tv className="w-6 h-6" />, color: 'text-rose-400 border-rose-500/30 bg-rose-950/40' },
    { type: 'utilityBox', labelKey: 'tool-utilityBox', icon: <Box className="w-6 h-6" />, color: 'text-blue-400 border-blue-500/30 bg-blue-950/40' },
    { type: 'ground', labelKey: 'tool-ground', icon: <Compass className="w-6 h-6" />, color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40' },
  ];

  return (
    <>
      {/* COMPONENT PALETTE BOTTOM SHEET (WHEN TAP "+ ADD") */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/70 backdrop-blur-sm select-none">
          <div
            className="w-full bg-[#182030] border-t border-[#2d374d] rounded-t-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2d374d]">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  {lang === 'ceb' ? 'Pagdugang og Komponent' : 'Add Component to Canvas'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ceb' ? 'Pilia ang komponent aron ibutang sa sirkito' : 'Tap any component to drop it on your workspace'}
                </p>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Large Touch-Friendly Component Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 overflow-y-auto pb-4">
              {componentPalette.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    onAddComponent(item.type);
                    setIsPaletteOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${item.color}`}
                >
                  <div className="p-2 rounded-xl bg-black/30 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs block text-slate-100 truncate">
                      {i18n.t(item.labelKey)}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {lang === 'ceb' ? 'Ibutang sa canvas' : 'Tap to add'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION DOCK (FIXED AT BOTTOM FOR PHONES & TABLETS) */}
      <nav className="md:hidden h-16 bg-[#161c28] border-t border-[#2d374d] px-2 flex items-center justify-around shrink-0 z-30 shadow-2xl">
        {/* Select / Move */}
        <button
          onClick={() => onSelectTool('select')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            currentTool === 'select'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={lang === 'ceb' ? 'Pilia / Ibalhin' : 'Select Tool'}
        >
          <MousePointer className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'ceb' ? 'Pilia' : 'Select'}</span>
        </button>

        {/* Pan / Drag Canvas */}
        <button
          onClick={() => onSelectTool('pan')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            currentTool === 'pan'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={lang === 'ceb' ? 'Kamot Tool (I-drag Canvas)' : 'Hand Tool (Drag Canvas)'}
        >
          <Hand className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'ceb' ? 'Kamot' : 'Pan'}</span>
        </button>

        {/* Wire */}
        <button
          onClick={() => onSelectTool('wire')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            currentTool === 'wire'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'ceb' ? 'Alambre' : 'Wire'}</span>
        </button>

        {/* BIG "+ ADD" COMPONENT BUTTON */}
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-slate-200 mt-1">
            {lang === 'ceb' ? 'Dugang' : 'Add'}
          </span>
        </button>

        {/* Inspector Button (Highlights when item is selected!) */}
        <button
          onClick={onOpenInspector}
          className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            hasSelection ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {hasSelection && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'ceb' ? 'Pagsusi' : 'Inspect'}</span>
        </button>

        {/* Formulas & Analysis */}
        <button
          onClick={onOpenFormulas}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'ceb' ? 'Pormula' : 'Analysis'}</span>
        </button>

        {/* Delete Mode */}
        <button
          onClick={() => onSelectTool('delete')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            currentTool === 'delete'
              ? 'text-red-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'ceb' ? 'Papasa' : 'Delete'}</span>
        </button>
      </nav>
    </>
  );
};
