/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CircuitComponent, SolverResult, Wire } from '../types/circuit';
import { COMPONENT_INFO_REGISTRY } from '../services/componentInfo';
import { i18n } from '../services/i18n';
import {
  RotateCw,
  Copy,
  Trash2,
  ToggleRight,
  ToggleLeft,
  Sliders,
  X,
  Battery,
  Zap,
  Activity,
  Layers,
  Repeat,
  Lightbulb,
  Tv,
  Box,
  Compass,
  GitCommit,
} from 'lucide-react';

interface MobileSelectedCardProps {
  selectedComponent: CircuitComponent | null;
  selectedWire: Wire | null;
  solverResult: SolverResult;
  onOpenFullInspector: () => void;
  onRotateComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onToggleSwitch: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onDeleteWire: (wireId: string) => void;
  onDeselect: () => void;
}

export const MobileSelectedCard: React.FC<MobileSelectedCardProps> = ({
  selectedComponent,
  selectedWire,
  solverResult,
  onOpenFullInspector,
  onRotateComponent,
  onDuplicateComponent,
  onToggleSwitch,
  onDeleteComponent,
  onDeleteWire,
  onDeselect,
}) => {
  if (!selectedComponent && !selectedWire) return null;
  const lang = i18n.getLanguage();

  if (selectedWire) {
    return (
      <div className="md:hidden fixed bottom-18 left-3 right-3 z-30 bg-[#182030]/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-150">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <GitCommit className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-100 text-xs truncate">
              {i18n.t('component-type-wire')}
            </div>
            <div className="text-[10px] text-amber-300 font-mono truncate">
              {selectedWire.from} ↔ {selectedWire.to}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onDeleteWire(selectedWire.id)}
            className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 active:scale-95 transition"
            title="Delete Wire"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDeselect}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const comp = selectedComponent!;
  const compResult = solverResult.componentResults.get(comp.id);
  const infoData = COMPONENT_INFO_REGISTRY[comp.type];

  const renderIcon = () => {
    switch (comp.type) {
      case 'battery': return <Battery className="w-5 h-5 text-emerald-400" />;
      case 'acSource': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'resistor': return <Activity className="w-5 h-5 text-orange-400" />;
      case 'capacitor': return <Layers className="w-5 h-5 text-sky-400" />;
      case 'inductor': return <Repeat className="w-5 h-5 text-indigo-400" />;
      case 'switch': return <ToggleLeft className="w-5 h-5 text-violet-400" />;
      case 'bulb': return <Lightbulb className="w-5 h-5 text-yellow-300" />;
      case 'appliance': return <Tv className="w-5 h-5 text-rose-400" />;
      case 'utilityBox': return <Box className="w-5 h-5 text-blue-400" />;
      case 'ground': return <Compass className="w-5 h-5 text-emerald-300" />;
    }
  };

  return (
    <div className="md:hidden fixed bottom-18 left-3 right-3 z-30 bg-[#182030]/95 backdrop-blur-md border border-blue-500/50 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-150">
      {/* Top row: Icon, Name, Live readings, Close button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-slate-800 shrink-0">
            {renderIcon()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-100 text-xs truncate flex items-center gap-1.5">
              <span>{infoData ? infoData.title[lang] : comp.type}</span>
              {comp.rotation ? (
                <span className="text-[9px] bg-slate-700 text-slate-300 px-1 py-0.2 rounded font-mono">
                  {comp.rotation}°
                </span>
              ) : null}
            </div>
            <div className="text-[11px] text-slate-300 font-mono truncate">
              {compResult ? (
                <span className="text-emerald-400">
                  {compResult.voltage.toFixed(1)}V · {compResult.current >= 1 ? `${compResult.current.toFixed(2)}A` : `${(compResult.current * 1000).toFixed(0)}mA`} · {compResult.power.toFixed(1)}W
                </span>
              ) : comp.type === 'switch' ? (
                <span className={comp.properties.closed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {comp.properties.closed ? 'CLOSED (Conducting)' : 'OPEN (Disconnected)'}
                </span>
              ) : (
                <span className="text-slate-400">Idle / Ready</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDeselect}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom row: Quick action buttons */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-[#2d374d]/80">
        {/* Switch Toggle (if switch) */}
        {comp.type === 'switch' && (
          <button
            onClick={() => onToggleSwitch(comp.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              comp.properties.closed
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {comp.properties.closed ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{comp.properties.closed ? 'Open' : 'Close'}</span>
          </button>
        )}

        {/* Rotate 90° */}
        <button
          onClick={() => onRotateComponent(comp.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-xs font-semibold active:scale-95 transition"
        >
          <RotateCw className="w-4 h-4" />
          <span>Rotate</span>
        </button>

        {/* Duplicate */}
        <button
          onClick={() => onDuplicateComponent(comp.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold active:scale-95 transition"
        >
          <Copy className="w-4 h-4" />
          <span>Clone</span>
        </button>

        {/* Full Inspector & Info Sheet */}
        <button
          onClick={onOpenFullInspector}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold active:scale-95 transition shadow-sm"
        >
          <Sliders className="w-4 h-4" />
          <span>Edit & Info</span>
        </button>

        {/* Delete */}
        <button
          onClick={() => onDeleteComponent(comp.id)}
          className="p-1.5 px-2 bg-red-600/20 text-red-400 rounded-xl text-xs active:scale-95 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
