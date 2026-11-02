/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SolverResult } from '../types/circuit';
import { i18n } from '../services/i18n';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface MultimeterBarProps {
  result: SolverResult;
}

export const MultimeterBar: React.FC<MultimeterBarProps> = ({ result }) => {
  const isAC = result.sourceType === 'ac';

  return (
    <div className="bg-[#181d2c] border-b border-[#2d374d] px-3 md:px-4 py-1.5 md:py-2 flex items-center justify-between gap-3 text-xs md:text-sm shadow-inner overflow-x-auto whitespace-nowrap scrollbar-none">
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        {/* Source Mode Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
              isAC
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isAC ? 'AC Circuit (~)' : 'DC Circuit (⎓)'}
          </span>
        </div>

        {/* Voltage */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {isAC ? i18n.t('rms-voltage-label') : i18n.t('voltage-label')}
          </span>
          <span className="font-mono font-bold text-slate-100 text-sm md:text-base">
            {result.voltage !== null ? `${result.voltage.toFixed(2)} V` : '― V'}
          </span>
        </div>

        {/* Current */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {i18n.t('current-label')}
          </span>
          <span className="font-mono font-bold text-blue-400 text-sm md:text-base">
            {result.valid && result.current !== null
              ? `${result.current >= 1 ? result.current.toFixed(3) : (result.current * 1000).toFixed(1) + ' m'}A`
              : result.openCircuit
              ? '0.000 A'
              : '― A'}
          </span>
        </div>

        {/* Resistance or Impedance */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {isAC ? i18n.t('impedance-label') : i18n.t('resistance-label')}
          </span>
          <span className="font-mono font-bold text-emerald-400 text-sm md:text-base">
            {result.totalResistance !== null
              ? result.totalResistance >= 1000
                ? `${(result.totalResistance / 1000).toFixed(2)} kΩ`
                : `${result.totalResistance.toFixed(2)} Ω`
              : '― Ω'}
          </span>
        </div>

        {/* Active Power */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {i18n.t('power-label')}
          </span>
          <span className="font-mono font-bold text-amber-400 text-sm md:text-base">
            {result.valid && result.power !== null ? `${result.power.toFixed(2)} W` : '― W'}
          </span>
        </div>

        {/* AC specific metrics: Apparent Power & Power Factor */}
        {isAC && (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {i18n.t('apparent-power-label')}
              </span>
              <span className="font-mono font-bold text-purple-400 text-sm md:text-base">
                {result.valid && result.apparentPower !== null
                  ? `${result.apparentPower.toFixed(2)} VA`
                  : '― VA'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {i18n.t('power-factor-label')}
              </span>
              <span className="font-mono font-bold text-sky-400 text-sm md:text-base">
                {result.valid && result.powerFactor !== null
                  ? result.powerFactor.toFixed(3)
                  : '―'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {i18n.t('frequency-label')}
              </span>
              <span className="font-mono font-bold text-slate-300 text-sm md:text-base">
                {result.frequency !== null ? `${result.frequency} Hz` : '― Hz'}
              </span>
            </div>
          </>
        )}

        {/* Topology */}
        {result.valid && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {i18n.t('topology-label')}
            </span>
            <span className="font-medium text-slate-300 capitalize text-xs md:text-sm">
              {i18n.t(`topology-${result.topology}`)}
            </span>
          </div>
        )}
      </div>

      {/* Warnings & Diagnostics Badges */}
      <div className="flex items-center gap-2">
        {result.warnings.length > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-md text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[240px] md:max-w-[340px]">
              {i18n.t(result.warnings[0])}
            </span>
          </div>
        ) : result.valid ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-md text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Closed Circuit Active</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
