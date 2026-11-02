/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CircuitModel, CircuitSolver } from './services/circuitSolver';
import { CircuitStorage } from './services/circuitStorage';
import { i18n, Language } from './services/i18n';
import { PresetCircuit } from './services/presets';
import { Toolbar, ToolMode } from './components/Toolbar';
import { MultimeterBar } from './components/MultimeterBar';
import { CircuitCanvas } from './components/CircuitCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ExplanationPanel } from './components/ExplanationPanel';
import { WelcomeModal } from './components/WelcomeModal';
import { PresetsModal } from './components/PresetsModal';
import { QAReportModal } from './components/QAReportModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { MobileSelectedCard } from './components/MobileSelectedCard';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileMenuModal } from './components/MobileMenuModal';
import { ComponentProperties, ComponentType, SolverResult } from './types/circuit';
import {
  Zap,
  Sparkles,
  Save,
  FolderOpen,
  Download,
  Upload,
  PlusCircle,
  ShieldCheck,
  Globe,
  Sliders,
  BookOpen,
  Menu,
} from 'lucide-react';

export default function App() {
  const [model] = useState(() => new CircuitModel());
  const [storage] = useState(() => new CircuitStorage());
  const [solver] = useState(() => new CircuitSolver(model));

  const [currentTool, setCurrentTool] = useState<ToolMode>('select');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  const [solverResult, setSolverResult] = useState<SolverResult>(() => solver.solve());
  const [, setLangVersion] = useState(0);

  // Modals state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isQAOpen, setIsQAOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Right sidebar tab ('properties' | 'explanation')
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'explanation'>('properties');

  // File input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update circuit solver calculations
  const recalculate = useCallback(() => {
    const res = solver.solve();
    setSolverResult(res);
  }, [solver]);

  // Subscribe to i18n changes
  useEffect(() => {
    return i18n.subscribe(() => {
      setLangVersion((v) => v + 1);
    });
  }, []);

  // Initial calculation
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // Handle Component Properties update
  const handleUpdateComponentProperties = (id: string, newProps: Partial<ComponentProperties>) => {
    const comp = model.getComponent(id);
    if (comp) {
      comp.properties = { ...comp.properties, ...newProps };
      recalculate();
    }
  };

  // Toggle switch
  const handleToggleSwitch = (id: string) => {
    const comp = model.getComponent(id);
    if (comp && comp.type === 'switch') {
      comp.properties.closed = !comp.properties.closed;
      recalculate();
    }
  };

  // Delete component
  const handleDeleteComponent = (id: string) => {
    model.removeComponent(id);
    if (selectedComponentId === id) setSelectedComponentId(null);
    recalculate();
  };

  // Delete wire
  const handleDeleteWire = (wireId: string) => {
    model.removeWire(wireId);
    if (selectedWireId === wireId) setSelectedWireId(null);
    recalculate();
  };

  // Rotate component
  const handleRotateComponent = (id: string) => {
    const comp = model.getComponent(id);
    if (comp) {
      comp.rotation = ((comp.rotation || 0) + 90) % 360;
      recalculate();
    }
  };

  // Duplicate component
  const handleDuplicateComponent = (id: string) => {
    const comp = model.getComponent(id);
    if (comp) {
      const newComp = model.addComponent(
        comp.type,
        { ...comp.properties },
        { x: Math.min(comp.position.x + 35, 600), y: Math.min(comp.position.y + 35, 450) }
      );
      newComp.rotation = comp.rotation || 0;
      setSelectedComponentId(newComp.id);
      setSelectedWireId(null);
      setActiveRightTab('properties');
      recalculate();
    }
  };

  // Reset component defaults
  const handleResetComponent = (id: string) => {
    const comp = model.getComponent(id);
    if (comp) {
      const defaultProps: Record<string, ComponentProperties> = {
        battery: { voltage: 9 },
        acSource: { voltageRms: 120, frequency: 60 },
        resistor: { resistance: 10 },
        capacitor: { value: 0.000001 },
        inductor: { value: 0.01 },
        switch: { closed: true },
        bulb: { resistance: 5 },
        appliance: { ratedVoltage: 120, ratedPower: 100, powerFactor: 0.9 },
        utilityBox: {},
        ground: {},
      };
      comp.properties = { ...defaultProps[comp.type] };
      comp.rotation = 0;
      recalculate();
    }
  };

  // Delete element (component or wire)
  const handleDeleteElement = (id: string) => {
    if (id.startsWith('wire_')) {
      handleDeleteWire(id);
    } else {
      handleDeleteComponent(id);
    }
  };

  // Add wire
  const handleAddWire = (fromTerminalId: string, toTerminalId: string) => {
    const wire = model.addWire(fromTerminalId, toTerminalId);
    if (wire) {
      recalculate();
    }
  };

  // Add component (supports direct coordinate or center placement for mobile)
  const handleAddComponent = (type: ComponentType, position?: { x: number; y: number }) => {
    const defaultProps: Record<string, ComponentProperties> = {
      battery: { voltage: 9 },
      acSource: { voltageRms: 120, frequency: 60 },
      resistor: { resistance: 10 },
      capacitor: { value: 0.000001 },
      inductor: { value: 0.01 },
      switch: { closed: true },
      bulb: { resistance: 5 },
      appliance: { ratedVoltage: 120, ratedPower: 100, powerFactor: 0.9 },
      utilityBox: {},
      ground: {},
    };

    const targetPos = position || {
      x: Math.max(50, Math.floor((typeof window !== 'undefined' ? window.innerWidth : 400) / 2 - 40)),
      y: Math.max(90, Math.floor((typeof window !== 'undefined' ? window.innerHeight : 600) / 2 - 80)),
    };

    const comp = model.addComponent(type, defaultProps[type] || {}, targetPos);
    setSelectedComponentId(comp.id);
    setSelectedWireId(null);
    setCurrentTool('select');
    recalculate();
  };

  // Clear / New Circuit
  const handleNewCircuit = () => {
    if (model.components.size === 0 || window.confirm(i18n.t('confirm-new'))) {
      model.clear();
      setSelectedComponentId(null);
      setSelectedWireId(null);
      recalculate();
    }
  };

  // Save to LocalStorage
  const handleSave = () => {
    if (storage.save(model)) {
      alert(i18n.t('circuit-saved'));
    } else {
      alert(i18n.t('storage-error'));
    }
  };

  // Load from LocalStorage
  const handleLoad = () => {
    const data = storage.load();
    if (data) {
      model.fromJSON(data);
      setSelectedComponentId(null);
      setSelectedWireId(null);
      recalculate();
      alert(i18n.t('circuit-loaded'));
    } else {
      alert(i18n.t('no-saved-circuit'));
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    const jsonStr = storage.exportJSON(model);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voltflow_circuit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = storage.importJSON(content);
      if (data) {
        model.fromJSON(data);
        setSelectedComponentId(null);
        setSelectedWireId(null);
        recalculate();
        alert(i18n.t('circuit-loaded'));
      } else {
        alert(i18n.t('schema-error'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load Preset
  const handleLoadPreset = (preset: PresetCircuit) => {
    model.fromJSON(preset.data);
    setSelectedComponentId(null);
    setSelectedWireId(null);
    recalculate();
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focused on an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId) {
          handleDeleteComponent(selectedComponentId);
        } else if (selectedWireId) {
          handleDeleteWire(selectedWireId);
        }
      } else if (e.key === 'Escape') {
        setSelectedComponentId(null);
        setSelectedWireId(null);
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 's') {
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 'w') {
        setCurrentTool('wire');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, selectedWireId]);

  const selectedComp = selectedComponentId ? model.getComponent(selectedComponentId) || null : null;
  const selectedWire = selectedWireId ? model.wires.find((w) => w.id === selectedWireId) || null : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121620] text-slate-100 select-none overflow-hidden font-sans">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* TOP HEADER */}
      <header className="h-14 bg-[#182030] border-b border-[#2d374d] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="metallic-text-shine font-black text-xs md:text-sm tracking-wider font-mono">
                GEO.SAB
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="font-extrabold text-sm md:text-base tracking-tight text-white flex items-center gap-1.5">
                Volt-Flow <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">v2.0</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden lg:inline">Circuit Analysis Engine</span>
          </div>
        </div>

        {/* Global Toolbar Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 md:gap-2">
          {/* Presets Button */}
          <button
            onClick={() => setIsPresetsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#252e44] hover:bg-[#303b54] text-slate-200 text-xs font-semibold transition"
            title="Load educational preset circuits"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{i18n.t('presets-btn')}</span>
          </button>

          {/* New Circuit */}
          <button
            onClick={handleNewCircuit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#252e44] hover:bg-[#303b54] text-slate-200 text-xs font-semibold transition"
            title={i18n.t('new-circuit-btn')}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{i18n.t('new-circuit-btn')}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#252e44] hover:bg-[#303b54] text-slate-200 text-xs font-semibold transition"
            title={i18n.t('save-btn')}
          >
            <Save className="w-3.5 h-3.5 text-sky-400" />
            <span>{i18n.t('save-btn')}</span>
          </button>

          {/* Load */}
          <button
            onClick={handleLoad}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#252e44] hover:bg-[#303b54] text-slate-200 text-xs font-semibold transition"
            title={i18n.t('load-btn')}
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>{i18n.t('load-btn')}</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1.5 rounded-lg bg-[#252e44] hover:bg-[#303b54] text-slate-200 text-xs font-semibold transition flex items-center gap-1"
            title={i18n.t('export-btn')}
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-[#252e44] hover:bg-[#303b54] text-slate-200 text-xs font-semibold transition flex items-center gap-1"
            title={i18n.t('import-btn')}
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>Import</span>
          </button>

          {/* Inspection & QA Report */}
          <button
            onClick={() => setIsQAOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
            title="Inspect defects and verify QA suite"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{i18n.t('qa-report-btn')}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1 ml-1 bg-[#121622] border border-[#2d374d] rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={i18n.getLanguage()}
              onChange={(e) => i18n.setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-[#182030] text-slate-100">EN</option>
              <option value="ceb" className="bg-[#182030] text-slate-100">CEB (Bisaya)</option>
            </select>
          </div>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => setIsPresetsOpen(true)}
            className="p-2 rounded-lg bg-[#252e44] text-amber-400 hover:bg-[#303b54] transition"
            title="Presets"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewCircuit}
            className="p-2 rounded-lg bg-[#252e44] text-emerald-400 hover:bg-[#303b54] transition"
            title="New Circuit"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition shadow-sm"
            title="Menu & Settings"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* MULTIMETER HUD BAR */}
      <MultimeterBar result={solverResult} />

      {/* MAIN WORKSPACE BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbar (Desktop only) */}
        <Toolbar currentTool={currentTool} onSelectTool={setCurrentTool} />

        {/* Center SVG Interactive Canvas */}
        <CircuitCanvas
          model={model}
          solverResult={solverResult}
          currentTool={currentTool}
          selectedId={selectedComponentId || selectedWireId}
          onSelectComponent={(id) => {
            setSelectedComponentId(id);
            setSelectedWireId(null);
            if (id) setActiveRightTab('properties');
          }}
          onSelectWire={(wireId) => {
            setSelectedWireId(wireId);
            setSelectedComponentId(null);
            if (wireId) setActiveRightTab('properties');
          }}
          onComponentMoved={recalculate}
          onToggleSwitch={handleToggleSwitch}
          onAddWire={handleAddWire}
          onAddComponent={handleAddComponent}
          onDeleteElement={handleDeleteElement}
          onRotateComponent={handleRotateComponent}
          onDuplicateComponent={handleDuplicateComponent}
          onSelectTool={setCurrentTool}
        />

        {/* Right Sidebar: Properties & Explanations (Desktop only) */}
        <aside className="hidden md:flex md:w-80 bg-[#182030] border-l border-[#2d374d] flex-col shrink-0 select-none overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-[#2d374d] bg-[#151a28]">
            <button
              onClick={() => setActiveRightTab('properties')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                activeRightTab === 'properties'
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-[#182030]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Inspector
            </button>
            <button
              onClick={() => setActiveRightTab('explanation')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                activeRightTab === 'explanation'
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-[#182030]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Analysis & Formulas
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeRightTab === 'properties' ? (
              <PropertiesPanel
                selectedComponent={selectedComp}
                selectedWire={selectedWire}
                solverResult={solverResult}
                onUpdateComponentProperties={handleUpdateComponentProperties}
                onDeleteComponent={handleDeleteComponent}
                onDeleteWire={handleDeleteWire}
                onToggleSwitch={handleToggleSwitch}
                onRotateComponent={handleRotateComponent}
                onDuplicateComponent={handleDuplicateComponent}
                onResetComponent={handleResetComponent}
              />
            ) : (
              <ExplanationPanel
                result={solverResult}
                componentCount={model.components.size}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Floating Action Card for Selected Element */}
      <MobileSelectedCard
        selectedComponent={selectedComp}
        selectedWire={selectedWire}
        solverResult={solverResult}
        onOpenFullInspector={() => {
          setActiveRightTab('properties');
          setIsMobileDrawerOpen(true);
        }}
        onRotateComponent={handleRotateComponent}
        onDuplicateComponent={handleDuplicateComponent}
        onToggleSwitch={handleToggleSwitch}
        onDeleteComponent={handleDeleteComponent}
        onDeleteWire={handleDeleteWire}
        onDeselect={() => {
          setSelectedComponentId(null);
          setSelectedWireId(null);
        }}
      />

      {/* Mobile Dock Bottom Navigation Bar */}
      <MobileBottomBar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        onAddComponent={(type) => handleAddComponent(type)}
        onOpenInspector={() => {
          setActiveRightTab('properties');
          setIsMobileDrawerOpen(true);
        }}
        onOpenFormulas={() => {
          setActiveRightTab('explanation');
          setIsMobileDrawerOpen(true);
        }}
        hasSelection={Boolean(selectedComponentId || selectedWireId)}
      />

      {/* Mobile Drawer (Bottom Sheet for Inspector & Formulas) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeRightTab}
        onChangeTab={setActiveRightTab}
      >
        {activeRightTab === 'properties' ? (
          <PropertiesPanel
            selectedComponent={selectedComp}
            selectedWire={selectedWire}
            solverResult={solverResult}
            onUpdateComponentProperties={handleUpdateComponentProperties}
            onDeleteComponent={(id) => {
              handleDeleteComponent(id);
              setIsMobileDrawerOpen(false);
            }}
            onDeleteWire={(id) => {
              handleDeleteWire(id);
              setIsMobileDrawerOpen(false);
            }}
            onToggleSwitch={handleToggleSwitch}
            onRotateComponent={handleRotateComponent}
            onDuplicateComponent={handleDuplicateComponent}
            onResetComponent={handleResetComponent}
          />
        ) : (
          <ExplanationPanel
            result={solverResult}
            componentCount={model.components.size}
          />
        )}
      </MobileDrawer>

      {/* Mobile Menu Modal (Save, Load, Export, Import, QA, Language) */}
      <MobileMenuModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExportJSON}
        onImport={() => fileInputRef.current?.click()}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenQA={() => setIsQAOpen(true)}
        onClear={handleNewCircuit}
        currentLang={i18n.getLanguage()}
        onSetLang={(lang) => i18n.setLanguage(lang)}
      />

      {/* MODALS */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onStart={() => setIsWelcomeOpen(false)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenQA={() => setIsQAOpen(true)}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleLoadPreset}
      />

      <QAReportModal
        isOpen={isQAOpen}
        onClose={() => setIsQAOpen(false)}
      />
    </div>
  );
}
