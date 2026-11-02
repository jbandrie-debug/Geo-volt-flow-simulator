/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentType, SerializedCircuit } from '../types/circuit';
import { CircuitModel } from './circuitSolver';

const VALID_COMPONENT_TYPES = new Set<ComponentType>([
  'battery',
  'acSource',
  'resistor',
  'capacitor',
  'inductor',
  'switch',
  'bulb',
  'appliance',
  'utilityBox',
  'ground',
]);

export class CircuitStorage {
  private storageKey = 'voltflow_circuit';

  isAvailable(): boolean {
    try {
      const test = '__voltflow_storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  validateSchema(data: any): data is SerializedCircuit {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.components)) return false;
    if (!Array.isArray(data.wires)) return false;
    if (typeof data.nextId !== 'number' || !Number.isFinite(data.nextId) || data.nextId < 1) {
      return false;
    }

    const componentIds = new Set<string>();
    const terminalIds = new Set<string>();

    for (const item of data.components) {
      if (!Array.isArray(item) || item.length !== 2) return false;
      const [id, comp] = item;
      if (typeof id !== 'string' || !id || componentIds.has(id)) return false;
      componentIds.add(id);

      if (!comp || typeof comp !== 'object') return false;
      if (comp.id !== id) return false;
      if (!VALID_COMPONENT_TYPES.has(comp.type)) return false;

      // Position check
      if (
        !comp.position ||
        typeof comp.position.x !== 'number' ||
        typeof comp.position.y !== 'number' ||
        !Number.isFinite(comp.position.x) ||
        !Number.isFinite(comp.position.y)
      ) {
        return false;
      }

      if (comp.rotation !== undefined && (!Number.isFinite(comp.rotation) || comp.rotation < 0)) {
        return false;
      }

      // Terminals check
      if (!Array.isArray(comp.terminals) || comp.terminals.length === 0) return false;
      for (const t of comp.terminals) {
        if (!t || typeof t.id !== 'string' || !t.id) return false;
        if (terminalIds.has(t.id)) return false;
        terminalIds.add(t.id);
      }

      // Numerical properties validation
      const p = comp.properties || {};
      if (p.voltage !== undefined && (!Number.isFinite(p.voltage) || p.voltage < 0)) return false;
      if (p.voltageRms !== undefined && (!Number.isFinite(p.voltageRms) || p.voltageRms <= 0)) return false;
      if (p.frequency !== undefined && (!Number.isFinite(p.frequency) || p.frequency <= 0)) return false;
      if (p.resistance !== undefined && (!Number.isFinite(p.resistance) || p.resistance < 0)) return false;
      if (p.value !== undefined && (!Number.isFinite(p.value) || p.value <= 0)) return false;
      if (p.ratedVoltage !== undefined && (!Number.isFinite(p.ratedVoltage) || p.ratedVoltage <= 0)) return false;
      if (p.ratedPower !== undefined && (!Number.isFinite(p.ratedPower) || p.ratedPower <= 0)) return false;
      if (p.powerFactor !== undefined && (!Number.isFinite(p.powerFactor) || p.powerFactor <= 0 || p.powerFactor > 1)) return false;
    }

    // Wires check
    for (const wire of data.wires) {
      if (!wire || typeof wire !== 'object') return false;
      if (typeof wire.id !== 'string') return false;
      if (typeof wire.from !== 'string' || typeof wire.to !== 'string') return false;
      if (wire.from === wire.to) return false; // Self-referencing wire rejected!
      if (!terminalIds.has(wire.from) || !terminalIds.has(wire.to)) return false; // Non-existent terminal
    }

    return true;
  }

  save(model: CircuitModel): boolean {
    if (!this.isAvailable()) return false;
    try {
      const data = model.toJSON();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  load(): SerializedCircuit | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!this.validateSchema(parsed)) {
        console.warn('CircuitStorage: loaded data failed schema validation');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  exportJSON(model: CircuitModel): string {
    return JSON.stringify(model.toJSON(), null, 2);
  }

  importJSON(jsonString: string): SerializedCircuit | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (this.validateSchema(parsed)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }
}
