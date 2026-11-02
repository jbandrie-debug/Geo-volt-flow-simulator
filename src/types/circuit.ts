/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ComponentType =
  | 'battery'
  | 'acSource'
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'switch'
  | 'bulb'
  | 'appliance'
  | 'utilityBox'
  | 'ground';

export type TerminalType = 'positive' | 'negative' | 'terminal1' | 'terminal2' | 'ground' | string;

export interface Terminal {
  id: string;
  componentId: string;
  type: TerminalType;
  position: { x: number; y: number };
}

export interface ComponentProperties {
  voltage?: number;          // Battery (V)
  voltageRms?: number;       // AC Source (V RMS)
  frequency?: number;        // AC Source (Hz)
  resistance?: number;       // Resistor & Bulb (Ω)
  value?: number;            // Capacitor (F) or Inductor (H)
  closed?: boolean;          // Switch
  ratedVoltage?: number;     // Appliance (V)
  ratedPower?: number;       // Appliance (W)
  powerFactor?: number;      // Appliance (0-1)
  name?: string;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  properties: ComponentProperties;
  position: { x: number; y: number };
  terminals: Terminal[];
  rotation?: number; // 0, 90, 180, 270 degrees
}

export interface Wire {
  id: string;
  from: string; // terminalId
  to: string;   // terminalId
}

export interface ComponentResult {
  voltage: number;
  current: number;
  power: number;
  powerFactor?: number;
}

export type SolverWarning =
  | 'no_source'
  | 'invalid_battery'
  | 'invalid_voltage'
  | 'invalid_resistance'
  | 'invalid_ac_source'
  | 'invalid_reactive_value'
  | 'invalid_appliance_rating'
  | 'mixed_source_types_unsupported'
  | 'multiple_ac_sources_unsupported'
  | 'appliance_requires_ac'
  | 'incompatible_sources'
  | 'unsupported_source_topology'
  | 'short_circuit'
  | 'switch_open'
  | 'open_circuit'
  | 'solver_error'
  | 'unsupported_parallel_topology'
  | 'multiple_sources';

export type CircuitTopology = 'series' | 'parallel' | 'complex' | 'single' | 'unknown';

export interface SolverResult {
  valid: boolean;
  topology: CircuitTopology;
  sourceType: 'dc' | 'ac';
  voltage: number | null;
  current: number | null;
  totalResistance: number | null; // Resistance for DC, Impedance |Z| for AC
  power: number | null;          // Real / Active Power (W)
  apparentPower: number | null;  // Apparent Power (VA)
  reactivePower?: number | null; // Reactive Power (VAR)
  powerFactor: number | null;    // Power Factor (cos phi)
  frequency: number | null;      // Frequency (Hz)
  componentResults: Map<string, ComponentResult>;
  warnings: SolverWarning[];
  shortCircuit: boolean;
  openCircuit: boolean;
  path: string[] | null;         // Sequence of terminal IDs in conducting loop
  paths?: string[][];            // All parallel paths
}

export interface SerializedCircuit {
  components: [string, CircuitComponent][];
  wires: Wire[];
  nextId: number;
}
