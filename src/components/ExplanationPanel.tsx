/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SolverResult } from '../types/circuit';
import { i18n } from '../services/i18n';
import { BookOpen, Calculator, AlertOctagon, Info } from 'lucide-react';

interface ExplanationPanelProps {
  result: SolverResult;
  componentCount: number;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ result, componentCount }) => {
  if (componentCount === 0 || !result) {
    return (
      <div className="p-4 text-slate-400 text-xs md:text-sm">
        <h3 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          {i18n.t('explanation-title')}
        </h3>
        <p className="leading-relaxed text-slate-400">{i18n.t('default-explanation')}</p>
      </div>
    );
  }

  const isAC = result.sourceType === 'ac';

  return (
    <div className="p-4 space-y-4 text-xs md:text-sm overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-[#2d374d] pb-2">
        <BookOpen className="w-4 h-4 text-blue-400" />
        <h3 className="font-bold text-slate-200">{i18n.t('explanation-title')}</h3>
      </div>

      {/* Warnings & Diagnostics Explanations */}
      {result.shortCircuit && (
        <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg text-red-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-red-200">
            <AlertOctagon className="w-4 h-4 shrink-0 text-red-400" />
            <span>Short Circuit Diagnostic</span>
          </div>
          <p className="text-[11px] leading-relaxed">{i18n.t('short_circuit_explanation')}</p>
          <div className="bg-[#10141f] p-2 rounded text-[11px] font-mono text-red-300">
            I = V / R → V / 0 Ω = ∞ A (Divergent Current)
          </div>
        </div>
      )}

      {result.openCircuit && (
        <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-lg text-amber-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-200">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{result.warnings.includes('switch_open') ? 'Switch Disconnect' : 'Open Circuit'}</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {result.warnings.includes('switch_open')
              ? i18n.t('switch_open_explanation')
              : i18n.t('open_circuit_explanation')}
          </p>
          <div className="bg-[#10141f] p-2 rounded text-[11px] font-mono text-amber-300">
            R_loop = ∞ Ω ⟹ I = V / ∞ = 0.000 A
          </div>
        </div>
      )}

      {/* Valid Closed Circuit Equations & Derivations */}
      {result.valid && (
        <div className="space-y-3">
          {/* Topology Description */}
          <div className="bg-[#171d2b] p-3 rounded-lg border border-[#2d374d]">
            <span className="font-semibold text-slate-200 block mb-1 text-xs">
              {result.topology === 'series'
                ? i18n.t('topology-series')
                : result.topology === 'parallel'
                ? i18n.t('topology-parallel')
                : i18n.t('topology-complex')}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {result.topology === 'series'
                ? i18n.t('series_analysis_text')
                : result.topology === 'parallel'
                ? i18n.t('parallel_analysis_text')
                : i18n.t('complex_analysis_text')}
            </p>
          </div>

          {/* Ohm's Law / Impedance Formula */}
          <div className="bg-[#171d2b] p-3 rounded-lg border border-[#2d374d] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAC ? 'Ohm’s Law in AC (Phasors)' : i18n.t('ohms_law_title')}</span>
            </div>

            <div className="bg-[#10141f] p-2.5 rounded font-mono text-[11px] space-y-1 text-slate-300">
              {isAC ? (
                <>
                  <div className="text-cyan-400 font-semibold">I = V_RMS ÷ |Z_eq|</div>
                  <div>
                    I = {result.voltage?.toFixed(2)} V ÷ {result.totalResistance?.toFixed(2)} Ω ={' '}
                    <span className="text-blue-400 font-bold">{result.current?.toFixed(3)} A</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-emerald-400 font-semibold">I = V ÷ R_total</div>
                  <div>
                    I = {result.voltage?.toFixed(2)} V ÷ {result.totalResistance?.toFixed(2)} Ω ={' '}
                    <span className="text-blue-400 font-bold">{result.current?.toFixed(3)} A</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Electric Power Equations */}
          <div className="bg-[#171d2b] p-3 rounded-lg border border-[#2d374d] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAC ? i18n.t('ac_power_triangle') : i18n.t('power_formula_title')}</span>
            </div>

            <div className="bg-[#10141f] p-2.5 rounded font-mono text-[11px] space-y-1.5 text-slate-300">
              {isAC ? (
                <>
                  <div>
                    <span className="text-purple-400">Apparent Power (S):</span> V × I ={' '}
                    {result.voltage?.toFixed(1)} × {result.current?.toFixed(3)} ={' '}
                    <span className="text-purple-300 font-semibold">{result.apparentPower?.toFixed(2)} VA</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Active Real Power (P):</span> S × cos θ ={' '}
                    {result.apparentPower?.toFixed(2)} × {result.powerFactor?.toFixed(3)} ={' '}
                    <span className="text-amber-300 font-semibold">{result.power?.toFixed(2)} W</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Reactive Power (Q):</span> √(S² - P²) ={' '}
                    <span className="text-sky-300 font-semibold">{result.reactivePower?.toFixed(2)} VAR</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Power Factor:</span> cos θ ={' '}
                    <span className="text-slate-200 font-semibold">{result.powerFactor?.toFixed(3)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-amber-400 font-semibold">P = V × I = I² × R</div>
                  <div>
                    P = {result.voltage?.toFixed(2)} V × {result.current?.toFixed(3)} A ={' '}
                    <span className="text-amber-300 font-bold">{result.power?.toFixed(2)} W</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
