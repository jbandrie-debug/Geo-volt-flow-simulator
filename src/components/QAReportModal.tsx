/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Play, Terminal } from 'lucide-react';
import { CircuitModel, CircuitSolver } from '../services/circuitSolver';
import { CircuitStorage } from '../services/circuitStorage';

interface QAReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QAReportModal: React.FC<QAReportModalProps> = ({ isOpen, onClose }) => {
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');

  if (!isOpen) return null;

  const runLiveQASuite = () => {
    setTestStatus('running');
    const logs: string[] = [];
    logs.push('=== VOLT-FLOW SYSTEM VERIFICATION QA SUITE ===');

    try {
      const model = new CircuitModel();
      const solver = new CircuitSolver(model);
      const storage = new CircuitStorage();

      // Test 1: 9V + 10 Ohm Resistor
      model.clear();
      const b1 = model.addComponent('battery', { voltage: 9 }, { x: 50, y: 50 });
      const r1 = model.addComponent('resistor', { resistance: 10 }, { x: 200, y: 50 });
      model.addWire(`${b1.id}_pos`, `${r1.id}_t1`);
      model.addWire(`${r1.id}_t2`, `${b1.id}_neg`);
      let res = solver.solve();
      if (!res.valid || Math.abs((res.current || 0) - 0.9) > 0.001 || Math.abs((res.power || 0) - 8.1) > 0.001) {
        throw new Error('Test 1 Failed: 9V + 10Ω Ohm’s Law calculation mismatch');
      }
      logs.push('✅ Test 1 Passed: DC 9V + 10Ω Resistor → I = 0.900 A, P = 8.10 W');

      // Test 2: Series DC Loop (9V + 10Ω + 5Ω Bulb)
      model.clear();
      const b2 = model.addComponent('battery', { voltage: 9 }, { x: 50, y: 50 });
      const r2 = model.addComponent('resistor', { resistance: 10 }, { x: 200, y: 50 });
      const bulb2 = model.addComponent('bulb', { resistance: 5 }, { x: 350, y: 50 });
      model.addWire(`${b2.id}_pos`, `${r2.id}_t1`);
      model.addWire(`${r2.id}_t2`, `${bulb2.id}_t1`);
      model.addWire(`${bulb2.id}_t2`, `${b2.id}_neg`);
      res = solver.solve();
      if (!res.valid || Math.abs((res.current || 0) - 0.6) > 0.001 || Math.abs((res.power || 0) - 5.4) > 0.001) {
        throw new Error('Test 2 Failed: Series loop calculation mismatch');
      }
      logs.push('✅ Test 2 Passed: Series DC Loop → R_total = 15Ω, I = 0.600 A, P = 5.40 W');

      // Test 3: Parallel Resistors (12V + 20Ω || 20Ω)
      model.clear();
      const b3 = model.addComponent('battery', { voltage: 12 }, { x: 50, y: 50 });
      const pr1 = model.addComponent('resistor', { resistance: 20 }, { x: 200, y: 50 });
      const pr2 = model.addComponent('resistor', { resistance: 20 }, { x: 200, y: 150 });
      model.addWire(`${b3.id}_pos`, `${pr1.id}_t1`);
      model.addWire(`${b3.id}_pos`, `${pr2.id}_t1`);
      model.addWire(`${pr1.id}_t2`, `${b3.id}_neg`);
      model.addWire(`${pr2.id}_t2`, `${b3.id}_neg`);
      res = solver.solve();
      if (!res.valid || Math.abs((res.current || 0) - 1.2) > 0.001 || Math.abs((res.totalResistance || 0) - 10) > 0.001) {
        throw new Error('Test 3 Failed: Parallel loop calculation mismatch');
      }
      logs.push('✅ Test 3 Passed: Parallel DC Branches → R_eq = 10.00Ω, I = 1.200 A, P = 14.40 W');

      // Test 4: Open Switch Diagnostic
      model.clear();
      const b4 = model.addComponent('battery', { voltage: 9 }, { x: 50, y: 50 });
      const sw = model.addComponent('switch', { closed: false }, { x: 200, y: 50 });
      const r4 = model.addComponent('resistor', { resistance: 10 }, { x: 350, y: 50 });
      model.addWire(`${b4.id}_pos`, `${sw.id}_t1`);
      model.addWire(`${sw.id}_t2`, `${r4.id}_t1`);
      model.addWire(`${r4.id}_t2`, `${b4.id}_neg`);
      res = solver.solve();
      if (res.valid || res.current !== 0 || !res.warnings.includes('switch_open')) {
        throw new Error('Test 4 Failed: Open switch diagnostic mismatch');
      }
      logs.push('✅ Test 4 Passed: Open Switch → I = 0 A, Warning: switch_open');

      // Test 5: Short Circuit Protection
      model.clear();
      const b5 = model.addComponent('battery', { voltage: 9 }, { x: 50, y: 50 });
      model.addWire(`${b5.id}_pos`, `${b5.id}_neg`);
      res = solver.solve();
      if (res.valid || !res.shortCircuit || !res.warnings.includes('short_circuit')) {
        throw new Error('Test 5 Failed: Short circuit detection mismatch');
      }
      logs.push('✅ Test 5 Passed: Zero-Resistance Short Circuit → Safely Flagged, No Infinity');

      // Test 6: AC Sinusoidal Source & RC Circuit
      model.clear();
      const ac = model.addComponent('acSource', { voltageRms: 120, frequency: 60 }, { x: 50, y: 50 });
      const acR = model.addComponent('resistor', { resistance: 60 }, { x: 200, y: 50 });
      const acC = model.addComponent('capacitor', { value: 0.00003 }, { x: 350, y: 50 });
      model.addWire(`${ac.id}_pos`, `${acR.id}_t1`);
      model.addWire(`${acR.id}_t2`, `${acC.id}_t1`);
      model.addWire(`${acC.id}_t2`, `${ac.id}_neg`);
      res = solver.solve();
      if (!res.valid || res.sourceType !== 'ac' || (res.current || 0) <= 0) {
        throw new Error('Test 6 Failed: AC impedance solving mismatch');
      }
      logs.push(`✅ Test 6 Passed: AC 120V 60Hz RC Series → |Z| = ${res.totalResistance?.toFixed(1)}Ω, I = ${res.current?.toFixed(3)} A, PF = ${res.powerFactor?.toFixed(3)}`);

      // Test 7: Schema Validation & Malformed Storage Rejection
      const corruptData1 = {
        components: [['battery_1', { id: 'battery_1', type: 'laser_cannon', position: { x: 0, y: 0 }, properties: {}, terminals: [] }]],
        wires: [],
        nextId: 2,
      };
      const corruptData2 = {
        components: [
          ['battery_1', { id: 'battery_1', type: 'battery', position: { x: 0, y: 0 }, properties: {}, terminals: [{ id: 'b1_pos' }, { id: 'b1_neg' }] }],
        ],
        wires: [{ id: 'w1', from: 'b1_pos', to: 'b1_pos' }], // Self-referencing wire
        nextId: 2,
      };
      if (storage.validateSchema(corruptData1) || storage.validateSchema(corruptData2)) {
        throw new Error('Test 7 Failed: Storage allowed corrupt component type or self-wire');
      }
      logs.push('✅ Test 7 Passed: Storage Schema safely rejects corrupt types & self-referencing wires');

      logs.push('==================================================');
      logs.push('🎉 ALL SYSTEM QA VERIFICATIONS PASSED (7 / 7)');
      logs.push('==================================================');
      setTestStatus('passed');
    } catch (err: any) {
      logs.push(`❌ ${err.message}`);
      setTestStatus('failed');
    }
    setTestLogs(logs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#182030] border border-[#2d374d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d374d] flex items-center justify-between bg-[#151a28]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-100">
                Code Inspection, Defect Audit & Fix Report
              </h2>
              <p className="text-xs text-slate-400">
                Analysis of Geo-volt-flow-simulator-main archive & implemented architectural fixes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs md:text-sm">
          {/* Executive Summary */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Inspection Executive Summary
            </h3>
            <p className="text-slate-300 leading-relaxed">
              We conducted a comprehensive inspection of the provided repository archive (<code>Geo-volt-flow-simulator-main</code>),
              cross-referencing <code>index.html</code>, <code>QA-REPORT.md</code>, <code>README.md</code>, and runtime behavior.
              While mathematical nodal analysis was partially expanded for AC and parallel networks, multiple critical regressions,
              missing methods, broken inspector panels, and touch/drag boundary bugs were identified.
            </p>
          </section>

          {/* Audit Findings Matrix */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Audited Defects & Implemented Fixes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#121624] border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <span>1. Dead Explanation & Formula Panel</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong>Defect:</strong> <code>updateExplanation(result)</code> was completely omitted in <code>solveAndDisplay()</code>, leaving the right panel permanently frozen on initial placeholder text.
                </p>
                <p className="text-emerald-400 text-xs">
                  <strong>Fix:</strong> Implemented reactive <code>ExplanationPanel</code> showing step-by-step Ohm’s Law, real & apparent power formulas, AC power triangles, and diagnostic breakdowns.
                </p>
              </div>

              <div className="bg-[#121624] border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <span>2. Uneditable Components in Inspector</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong>Defect:</strong> <code>updateProperties()</code> only supported Battery and Resistor. AC Sources, Capacitors, Inductors, Switches, and Appliances could not be inspected or modified.
                </p>
                <p className="text-emerald-400 text-xs">
                  <strong>Fix:</strong> Expanded <code>PropertiesPanel</code> with full inputs for AC Voltage/Frequency, Capacitance (µF), Inductance (mH), Switch toggle button, and Appliance ratings.
                </p>
              </div>

              <div className="bg-[#121624] border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <span>3. AC Multimeter Metrics Hidden</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong>Defect:</strong> Apparent power and Power Factor had <code>style="display:none;"</code> and were never unhidden during AC simulation.
                </p>
                <p className="text-emerald-400 text-xs">
                  <strong>Fix:</strong> Built dynamic <code>MultimeterBar</code> that toggles between DC (V, I, Req, P) and AC (~ RMS Voltage, I, |Z|, Real Power, Apparent Power VA, and cos θ).
                </p>
              </div>

              <div className="bg-[#121624] border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <span>4. Storage Schema Validation Omitted</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong>Defect:</strong> <code>CircuitStorage.load()</code> executed raw <code>JSON.parse()</code> without schema validation, causing app crashes on corrupt localStorage data.
                </p>
                <p className="text-emerald-400 text-xs">
                  <strong>Fix:</strong> Re-architected <code>CircuitStorage.validateSchema()</code> supporting all 10 component types, validating positions, finite numbers, and non-self-referencing wires.
                </p>
              </div>

              <div className="bg-[#121624] border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <span>5. Sticky Dragging Beyond Canvas</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong>Defect:</strong> Lack of W3C Pointer Capture (<code>setPointerCapture</code>) caused components to get permanently stuck to pointer when dragged outside the SVG.
                </p>
                <p className="text-emerald-400 text-xs">
                  <strong>Fix:</strong> Attached pointer capture on pointerdown and safely released on pointerup/cancel, clamping coordinates to workspace boundaries.
                </p>
              </div>

              <div className="bg-[#121624] border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <span>6. Tiny Mobile Touch Targets</span>
                </div>
                <p className="text-slate-400 text-xs">
                  <strong>Defect:</strong> Switches only had a 3px thin SVG line to click, making toggling nearly impossible on mobile touchscreens without dragging the whole component.
                </p>
                <p className="text-emerald-400 text-xs">
                  <strong>Fix:</strong> Added generous 30px transparent touch target overlays over switches and 28px snap radii over terminals with magnetic hover rings.
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Live QA Suite */}
          <section className="bg-[#131724] border border-[#2d374d] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Live Verification QA Suite (Browser Execution)</span>
              </div>
              <button
                onClick={runLiveQASuite}
                disabled={testStatus === 'running'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition shadow"
              >
                <Play className="w-3.5 h-3.5" />
                {testStatus === 'running' ? 'Running Tests...' : 'Run Automated QA Suite'}
              </button>
            </div>

            {testLogs.length > 0 && (
              <div className="bg-[#0b0e17] rounded-lg p-3 font-mono text-[11px] space-y-1 border border-slate-800 text-slate-300 max-h-48 overflow-y-auto">
                {testLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.startsWith('✅')
                        ? 'text-emerald-400'
                        : log.startsWith('❌')
                        ? 'text-red-400 font-bold'
                        : log.startsWith('🎉')
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2d374d] flex justify-end bg-[#151a28]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#252e44] hover:bg-[#303b54] text-slate-200 rounded-lg font-medium text-xs md:text-sm transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
