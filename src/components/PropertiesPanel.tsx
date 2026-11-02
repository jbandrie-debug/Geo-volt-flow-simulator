/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CircuitComponent, ComponentProperties, SolverResult, Wire } from '../types/circuit';
import { i18n } from '../services/i18n';
import { COMPONENT_INFO_REGISTRY } from '../services/componentInfo';
import {
  Battery,
  Zap,
  Activity,
  Layers,
  Repeat,
  ToggleLeft,
  ToggleRight,
  Lightbulb,
  Tv,
  Box,
  Compass,
  Trash2,
  GitCommit,
  RotateCw,
  Copy,
  RotateCcw,
  Info,
  Sliders,
  Sparkles,
  Gauge,
  BookOpen,
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedComponent: CircuitComponent | null;
  selectedWire: Wire | null;
  solverResult: SolverResult;
  onUpdateComponentProperties: (id: string, properties: Partial<ComponentProperties>) => void;
  onDeleteComponent: (id: string) => void;
  onDeleteWire: (wireId: string) => void;
  onToggleSwitch: (id: string) => void;
  onRotateComponent?: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onResetComponent?: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  selectedWire,
  solverResult,
  onUpdateComponentProperties,
  onDeleteComponent,
  onDeleteWire,
  onToggleSwitch,
  onRotateComponent,
  onDuplicateComponent,
  onResetComponent,
}) => {
  const [subTab, setSubTab] = useState<'controls' | 'info' | 'probe'>('controls');
  const lang = i18n.getLanguage();

  if (!selectedComponent && !selectedWire) {
    return (
      <div className="p-4 text-slate-400 text-xs md:text-sm">
        <h3 className="font-bold text-slate-200 text-sm mb-2">{i18n.t('properties-title')}</h3>
        <p className="leading-relaxed text-slate-400">{i18n.t('no-selection')}</p>
      </div>
    );
  }

  // Wire Selected
  if (selectedWire) {
    return (
      <div className="p-4 space-y-4 text-xs md:text-sm">
        <div className="flex items-center justify-between border-b border-[#2d374d] pb-2">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-200">{i18n.t('component-type-wire')}</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{selectedWire.id}</span>
        </div>

        <div className="bg-[#192030] p-3.5 rounded-xl border border-[#2d374d] space-y-2">
          <div className="text-slate-300">
            <span className="text-slate-400 block text-[11px] mb-0.5">{i18n.t('wire-connected-between')}:</span>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-[#121622] p-2 rounded">
              <span>{selectedWire.from}</span>
              <span className="text-slate-500">↔</span>
              <span>{selectedWire.to}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {lang === 'ceb'
              ? 'Ideal nga alambre sa kuryente: zero ohms (0 Ω) nga pagsukol ug walay paghagsa sa boltahe.'
              : 'Ideal electrical conductor: zero resistance (0 Ω) and zero voltage drop.'}
          </p>
        </div>

        <button
          onClick={() => onDeleteWire(selectedWire.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl font-medium transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          {i18n.t('delete-wire')}
        </button>
      </div>
    );
  }

  // Component Selected
  const comp = selectedComponent!;
  const compResult = solverResult.componentResults.get(comp.id);
  const p = comp.properties;
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
    <div className="p-4 space-y-4 text-xs md:text-sm">
      {/* Component Header with Icon and ID */}
      <div className="flex items-center justify-between border-b border-[#2d374d] pb-2">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <div>
            <h3 className="font-bold text-slate-100 text-sm leading-tight">
              {infoData ? infoData.title[lang] : i18n.t(`component-type-${comp.type}`)}
            </h3>
            <span className="text-[10px] text-blue-400 font-medium">
              {infoData ? infoData.category[lang] : comp.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {comp.rotation ? (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              {comp.rotation}°
            </span>
          ) : null}
          <span className="text-[11px] font-mono text-slate-400">{comp.id}</span>
        </div>
      </div>

      {/* Sub-Tabs: Controls, Info & Science, Live Probe */}
      <div className="flex bg-[#121622] p-1 rounded-xl border border-[#2d374d] gap-1">
        <button
          onClick={() => setSubTab('controls')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            subTab === 'controls'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{lang === 'ceb' ? 'Mga Kontrol' : 'Controls'}</span>
        </button>
        <button
          onClick={() => setSubTab('info')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            subTab === 'info'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{lang === 'ceb' ? 'Impormasyon' : 'Info & Science'}</span>
        </button>
        <button
          onClick={() => setSubTab('probe')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            subTab === 'probe'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{lang === 'ceb' ? 'Pagsukod' : 'Live Probe'}</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONTROLS & FUNCTIONS */}
      {subTab === 'controls' && (
        <div className="space-y-4">
          {/* Component Parameter Inputs */}
          <div className="space-y-3 bg-[#161c29] p-3 rounded-xl border border-[#2d374d]">
            {/* Battery */}
            {comp.type === 'battery' && (
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">
                  {i18n.t('voltage-property')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="1000"
                    value={p.voltage ?? 9}
                    onChange={(e) => onUpdateComponentProperties(comp.id, { voltage: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="font-mono text-slate-400 font-bold">V</span>
                </div>
              </div>
            )}

            {/* AC Source */}
            {comp.type === 'acSource' && (
              <>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">
                    {i18n.t('rms-voltage-property')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="5"
                      min="1"
                      max="1000"
                      value={p.voltageRms ?? 120}
                      onChange={(e) => onUpdateComponentProperties(comp.id, { voltageRms: parseFloat(e.target.value) || 0 })}
                      className="flex-1 bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="font-mono text-slate-400 font-bold">V~</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">
                    {i18n.t('frequency-property')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="10000"
                      value={p.frequency ?? 60}
                      onChange={(e) => onUpdateComponentProperties(comp.id, { frequency: parseFloat(e.target.value) || 0 })}
                      className="flex-1 bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="font-mono text-slate-400 font-bold">Hz</span>
                  </div>
                </div>
              </>
            )}

            {/* Resistor & Bulb */}
            {(comp.type === 'resistor' || comp.type === 'bulb') && (
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">
                  {i18n.t('resistance-property')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0.1"
                    max="1000000"
                    value={p.resistance ?? (comp.type === 'bulb' ? 5 : 10)}
                    onChange={(e) => onUpdateComponentProperties(comp.id, { resistance: parseFloat(e.target.value) || 0.1 })}
                    className="flex-1 bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="font-mono text-slate-400 font-bold">Ω</span>
                </div>
              </div>
            )}

            {/* Capacitor */}
            {comp.type === 'capacitor' && (
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">
                  {i18n.t('capacitance-property')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="0.01"
                    max="100000"
                    value={((p.value ?? 0.000001) * 1e6).toFixed(2)}
                    onChange={(e) => {
                      const uf = parseFloat(e.target.value) || 1;
                      onUpdateComponentProperties(comp.id, { value: uf * 1e-6 });
                    }}
                    className="flex-1 bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="font-mono text-slate-400 font-bold">µF</span>
                </div>
                {solverResult.sourceType === 'ac' && solverResult.frequency && (
                  <p className="mt-1 text-[11px] text-sky-400 font-mono">
                    Reactance Xc ≈ {(1 / (2 * Math.PI * solverResult.frequency * (p.value ?? 1e-6))).toFixed(1)} Ω
                  </p>
                )}
              </div>
            )}

            {/* Inductor */}
            {comp.type === 'inductor' && (
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">
                  {i18n.t('inductance-property')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0.1"
                    max="100000"
                    value={((p.value ?? 0.01) * 1e3).toFixed(1)}
                    onChange={(e) => {
                      const mh = parseFloat(e.target.value) || 1;
                      onUpdateComponentProperties(comp.id, { value: mh * 1e-3 });
                    }}
                    className="flex-1 bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="font-mono text-slate-400 font-bold">mH</span>
                </div>
                {solverResult.sourceType === 'ac' && solverResult.frequency && (
                  <p className="mt-1 text-[11px] text-indigo-400 font-mono">
                    Reactance XL ≈ {(2 * Math.PI * solverResult.frequency * (p.value ?? 0.01)).toFixed(1)} Ω
                  </p>
                )}
              </div>
            )}

            {/* Switch */}
            {comp.type === 'switch' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{i18n.t('switch-state')}:</span>
                  <span className={`font-semibold ${p.closed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.closed ? i18n.t('switch-closed') : i18n.t('switch-open')}
                  </span>
                </div>
                <button
                  onClick={() => onToggleSwitch(comp.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition cursor-pointer ${
                    p.closed
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
                      : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  }`}
                >
                  {p.closed ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {i18n.t('toggle-switch')}
                </button>
              </div>
            )}

            {/* Appliance */}
            {comp.type === 'appliance' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">
                    {i18n.t('rated-voltage-property')}
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    value={p.ratedVoltage ?? 120}
                    onChange={(e) => onUpdateComponentProperties(comp.id, { ratedVoltage: parseFloat(e.target.value) || 120 })}
                    className="w-full bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">
                    {i18n.t('rated-power-property')}
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={p.ratedPower ?? 100}
                    onChange={(e) => onUpdateComponentProperties(comp.id, { ratedPower: parseFloat(e.target.value) || 100 })}
                    className="w-full bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-medium">
                    {i18n.t('power-factor-property')}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="1.0"
                    value={p.powerFactor ?? 0.9}
                    onChange={(e) => onUpdateComponentProperties(comp.id, { powerFactor: parseFloat(e.target.value) || 0.9 })}
                    className="w-full bg-[#121622] border border-[#374259] rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets / Ratings */}
          {infoData && infoData.presets && infoData.presets.length > 0 && (
            <div className="space-y-2">
              <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {i18n.t('quick-presets-title')}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {infoData.presets.map((pr, idx) => (
                  <button
                    key={idx}
                    onClick={() => onUpdateComponentProperties(comp.id, pr.properties)}
                    className="w-full text-left p-2 rounded-lg bg-[#141926] hover:bg-[#1e2538] border border-[#2d374d] hover:border-blue-500/50 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{pr.label}</div>
                      <div className="text-[10px] text-slate-400">{pr.description}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase">Apply</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Component Functions / Actions */}
          <div className="space-y-2 pt-1 border-t border-[#2d374d]">
            <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider block">
              {i18n.t('component-functions-title')}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Rotate 90° */}
              <button
                onClick={() => onRotateComponent?.(comp.id)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#1e2538] hover:bg-[#28324a] text-slate-200 border border-[#2d374d] rounded-lg font-medium text-xs transition cursor-pointer"
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>{i18n.t('rotate-component')}</span>
              </button>

              {/* Duplicate Component */}
              <button
                onClick={() => onDuplicateComponent?.(comp.id)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#1e2538] hover:bg-[#28324a] text-slate-200 border border-[#2d374d] rounded-lg font-medium text-xs transition cursor-pointer"
                title="Create a copy of this component"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>{i18n.t('duplicate-component')}</span>
              </button>
            </div>

            {/* Reset to Defaults */}
            <button
              onClick={() => onResetComponent?.(comp.id)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#1e2538] hover:bg-[#28324a] text-slate-300 border border-[#2d374d] rounded-lg font-medium text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{i18n.t('reset-default-btn')}</span>
            </button>

            {/* Delete Component */}
            <button
              onClick={() => onDeleteComponent(comp.id)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition cursor-pointer mt-2"
            >
              <Trash2 className="w-4 h-4" />
              {i18n.t('delete-component')}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: COMPONENT INFO & SCIENCE */}
      {subTab === 'info' && (
        <div className="space-y-4">
          {infoData ? (
            <>
              {/* Description */}
              <div className="bg-[#151a27] p-3.5 rounded-xl border border-[#2d374d] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'ceb' ? 'Pagsabot sa Komponent' : 'Component Overview'}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {infoData.description[lang]}
                </p>
              </div>

              {/* Schematic Symbol */}
              <div className="bg-[#151a27] p-3 rounded-xl border border-[#2d374d] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {i18n.t('symbol-desc-title')}
                </span>
                <p className="text-slate-300 text-xs">
                  {infoData.symbolDesc[lang]}
                </p>
              </div>

              {/* DC Behavior */}
              <div className="bg-[#151a27] p-3 rounded-xl border border-[#2d374d] space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {i18n.t('dc-behavior-title')}
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {infoData.dcBehavior[lang]}
                </p>
              </div>

              {/* AC Behavior */}
              <div className="bg-[#151a27] p-3 rounded-xl border border-[#2d374d] space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  {i18n.t('ac-behavior-title')}
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {infoData.acBehavior[lang]}
                </p>
              </div>

              {/* Governing Equations */}
              <div className="bg-[#121622] p-3 rounded-xl border border-[#2d374d] space-y-1 font-mono">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {i18n.t('key-formula-title')}
                </span>
                <div className="p-2 rounded bg-[#0b0e17] text-slate-200 text-xs font-semibold">
                  {infoData.keyFormula}
                </div>
              </div>

              {/* Real-World Applications */}
              <div className="bg-[#151a27] p-3 rounded-xl border border-[#2d374d] space-y-1">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                  {i18n.t('real-world-apps-title')}
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {infoData.realWorldApplications[lang]}
                </p>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-xs">No extended information available for this component.</p>
          )}
        </div>
      )}

      {/* SUB-TAB 3: LIVE ELECTRICAL PROBE */}
      {subTab === 'probe' && (
        <div className="space-y-4">
          <div className="bg-[#151a27] p-3.5 rounded-xl border border-[#2d374d] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2d374d] pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                {i18n.t('live-probe-title')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                compResult && compResult.current > 0.001
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {compResult && compResult.current > 0.001 ? 'ENERGIZED' : 'IDLE / INACTIVE'}
              </span>
            </div>

            {compResult ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-[#10141f]">
                  <span className="text-slate-400">{i18n.t('branch-voltage')}:</span>
                  <span className="text-emerald-400 font-bold text-sm">{compResult.voltage.toFixed(2)} V</span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-[#10141f]">
                  <span className="text-slate-400">{i18n.t('branch-current')}:</span>
                  <span className="text-blue-400 font-bold text-sm">
                    {compResult.current >= 1
                      ? `${compResult.current.toFixed(3)} A`
                      : `${(compResult.current * 1000).toFixed(1)} mA`}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-[#10141f]">
                  <span className="text-slate-400">{i18n.t('power-dissipation')}:</span>
                  <span className="text-amber-400 font-bold text-sm">{compResult.power.toFixed(2)} W</span>
                </div>

                {compResult.powerFactor !== undefined && (
                  <div className="flex justify-between items-center p-2 rounded bg-[#10141f]">
                    <span className="text-slate-400">{i18n.t('power-factor-label')}:</span>
                    <span className="text-sky-400 font-bold text-sm">{compResult.powerFactor.toFixed(3)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs py-2 leading-relaxed">
                {lang === 'ceb'
                  ? 'Kini nga komponent wala sa sirado nga agianan sa kuryente o walay aktibong power source.'
                  : 'This component is not currently in a closed conducting path, or no power source is connected.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
