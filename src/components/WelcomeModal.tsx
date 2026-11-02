/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, Play, Sparkles, BookOpen, Globe } from 'lucide-react';
import { i18n } from '../services/i18n';

interface WelcomeModalProps {
  isOpen: boolean;
  onStart: () => void;
  onOpenPresets: () => void;
  onOpenQA: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onStart,
  onOpenPresets,
  onOpenQA,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-[#182030] border border-[#2d374d] rounded-3xl w-full max-w-xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* GEO.SAB Metallic Shining Brand (at the very top above the logo) */}
        <div className="flex flex-col items-center justify-center -mt-2">
          <div className="metallic-brand-badge px-6 py-2.5 rounded-2xl flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            {/* Reflective light sweep bar */}
            <div className="metallic-brand-shine" />

            <Sparkles className="w-4 h-4 text-slate-300 sparkle-icon shrink-0" />

            <div className="flex items-center gap-2">
              <span className="h-[1px] w-5 md:w-8 bg-gradient-to-r from-transparent via-slate-400 to-slate-200" />
              <span className="metallic-text-shine font-black text-2xl md:text-3xl tracking-[0.25em] uppercase font-mono select-none">
                GEO.SAB
              </span>
              <span className="h-[1px] w-5 md:w-8 bg-gradient-to-l from-transparent via-slate-400 to-slate-200" />
            </div>

            <Sparkles className="w-4 h-4 text-slate-300 sparkle-icon shrink-0" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Signature Edition &bull; Precision Simulator
          </span>
        </div>

        {/* Icon & Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Volt-Flow Simulator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Interactive Electrical Circuit Simulator & Analysis Engine
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 text-left text-xs text-slate-300">
          <div className="bg-[#131724] p-3 rounded-xl border border-[#2d374d] space-y-1">
            <span className="font-bold text-emerald-400 block">⚡ DC & AC Solvers</span>
            <p className="text-slate-400 text-[11px]">Nodal analysis with steady-state impedance matrices.</p>
          </div>
          <div className="bg-[#131724] p-3 rounded-xl border border-[#2d374d] space-y-1">
            <span className="font-bold text-cyan-400 block">✨ Charge Flow Dynamics</span>
            <p className="text-slate-400 text-[11px]">Animated electrons with frequency-based oscillation.</p>
          </div>
          <div className="bg-[#131724] p-3 rounded-xl border border-[#2d374d] space-y-1">
            <span className="font-bold text-amber-400 block">📐 Real-Time Formulas</span>
            <p className="text-slate-400 text-[11px]">Ohm’s law, active & apparent power derivations.</p>
          </div>
          <div className="bg-[#131724] p-3 rounded-xl border border-[#2d374d] space-y-1">
            <span className="font-bold text-purple-400 block">🌐 English & Bisaya</span>
            <p className="text-slate-400 text-[11px]">Full bilingual support for learning & education.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onStart}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition text-sm md:text-base cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Simulating
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                onStart();
                onOpenPresets();
              }}
              className="px-4 py-2 bg-[#252e44] hover:bg-[#323d5a] text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Explore Presets
            </button>
            <button
              onClick={() => {
                onStart();
                onOpenQA();
              }}
              className="px-4 py-2 bg-[#252e44] hover:bg-[#323d5a] text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Inspection & QA Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
