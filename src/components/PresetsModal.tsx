/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { PRESET_CIRCUITS, PresetCircuit } from '../services/presets';
import { i18n } from '../services/i18n';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetCircuit) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;
  const lang = i18n.getLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#182030] border border-[#2d374d] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2d374d] flex items-center justify-between bg-[#151a28]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">{i18n.t('presets-btn')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 max-h-[70vh]">
          {PRESET_CIRCUITS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="group p-4 bg-[#141926] hover:bg-[#1f283d] border border-[#2d374d] hover:border-blue-500/50 rounded-xl cursor-pointer transition flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition text-sm">
                  {preset.name[lang] || preset.name.en}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {preset.description[lang] || preset.description.en}
                </p>
              </div>
              <div className="shrink-0 p-2 rounded-lg bg-[#1f283d] group-hover:bg-blue-600 text-slate-300 group-hover:text-white transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
