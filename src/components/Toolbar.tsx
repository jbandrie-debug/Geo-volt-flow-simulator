/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  MousePointer,
  Hand,
  GitCommit,
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
  Trash2,
} from 'lucide-react';
import { ComponentType } from '../types/circuit';
import { i18n } from '../services/i18n';

export type ToolMode = 'select' | 'pan' | 'wire' | 'delete' | ComponentType;

interface ToolbarProps {
  currentTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ currentTool, onSelectTool }) => {
  const tools: { id: ToolMode; labelKey: string; icon: React.ReactNode; group: 'control' | 'source' | 'passive' | 'load' | 'misc' }[] = [
    { id: 'select', labelKey: 'tool-select', icon: <MousePointer className="w-5 h-5" />, group: 'control' },
    { id: 'pan', labelKey: 'tool-pan', icon: <Hand className="w-5 h-5 text-emerald-400" />, group: 'control' },
    { id: 'wire', labelKey: 'tool-wire', icon: <GitCommit className="w-5 h-5 text-amber-400" />, group: 'control' },
    { id: 'battery', labelKey: 'tool-battery', icon: <Battery className="w-5 h-5 text-emerald-400" />, group: 'source' },
    { id: 'acSource', labelKey: 'tool-acSource', icon: <Zap className="w-5 h-5 text-cyan-400" />, group: 'source' },
    { id: 'resistor', labelKey: 'tool-resistor', icon: <Activity className="w-5 h-5 text-orange-400" />, group: 'passive' },
    { id: 'capacitor', labelKey: 'tool-capacitor', icon: <Layers className="w-5 h-5 text-sky-400" />, group: 'passive' },
    { id: 'inductor', labelKey: 'tool-inductor', icon: <Repeat className="w-5 h-5 text-indigo-400" />, group: 'passive' },
    { id: 'switch', labelKey: 'tool-switch', icon: <ToggleLeft className="w-5 h-5 text-violet-400" />, group: 'control' },
    { id: 'bulb', labelKey: 'tool-bulb', icon: <Lightbulb className="w-5 h-5 text-yellow-300" />, group: 'load' },
    { id: 'appliance', labelKey: 'tool-appliance', icon: <Tv className="w-5 h-5 text-rose-400" />, group: 'load' },
    { id: 'utilityBox', labelKey: 'tool-utilityBox', icon: <Box className="w-5 h-5 text-blue-400" />, group: 'misc' },
    { id: 'ground', labelKey: 'tool-ground', icon: <Compass className="w-5 h-5 text-emerald-300" />, group: 'misc' },
    { id: 'delete', labelKey: 'tool-delete', icon: <Trash2 className="w-5 h-5 text-red-400" />, group: 'control' },
  ];

  return (
    <aside className="hidden md:flex w-56 bg-[#1a2030] border-r border-[#2d374d] flex-col shrink-0 select-none overflow-y-auto">
      <div className="p-3 border-b border-[#2d374d]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:block">
          Components & Tools
        </span>
      </div>

      <div className="p-2 space-y-1">
        {tools.map((t) => {
          const isActive = currentTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                  : 'text-slate-300 hover:bg-[#252e44] hover:text-white'
              }`}
              title={i18n.t(t.labelKey)}
            >
              <div className="shrink-0 flex items-center justify-center">{t.icon}</div>
              <span className="truncate hidden md:inline text-left">{i18n.t(t.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-3 border-t border-[#2d374d] text-[11px] text-slate-400 hidden md:block leading-relaxed">
        <p className="font-semibold text-slate-300 mb-1">💡 Quick Tip:</p>
        <p>Click component to place on grid. Select wire to link terminals together.</p>
      </div>
    </aside>
  );
};
