/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CircuitComponent,
  ComponentProperties,
  ComponentType,
  SerializedCircuit,
  SolverResult,
  Terminal,
  Wire,
} from '../types/circuit';

export class CircuitModel {
  components: Map<string, CircuitComponent> = new Map();
  wires: Wire[] = [];
  nextId: number = 1;

  clear() {
    this.components.clear();
    this.wires = [];
    this.nextId = 1;
  }

  addComponent(
    type: ComponentType,
    properties: ComponentProperties,
    position: { x: number; y: number }
  ): CircuitComponent {
    const id = `${type}_${this.nextId++}`;
    const component: CircuitComponent = {
      id,
      type,
      properties: { ...properties },
      position: { ...position },
      terminals: this.createTerminals(type, id),
    };
    this.components.set(id, component);
    return component;
  }

  createTerminals(type: ComponentType, componentId: string): Terminal[] {
    const terminals: Terminal[] = [];
    if (type === 'battery' || type === 'acSource') {
      terminals.push(
        { id: `${componentId}_pos`, componentId, type: 'positive', position: { x: 40, y: 0 } },
        { id: `${componentId}_neg`, componentId, type: 'negative', position: { x: 40, y: 80 } }
      );
    } else if (type === 'utilityBox') {
      terminals.push(
        { id: `${componentId}_t1`, componentId, type: 'positive', position: { x: 0, y: 16 } },
        { id: `${componentId}_t2`, componentId, type: 'positive', position: { x: 60, y: 16 } },
        { id: `${componentId}_t3`, componentId, type: 'negative', position: { x: 0, y: 44 } },
        { id: `${componentId}_t4`, componentId, type: 'negative', position: { x: 60, y: 44 } }
      );
    } else if (type === 'ground') {
      terminals.push({ id: `${componentId}_gnd`, componentId, type: 'ground', position: { x: 10, y: 0 } });
    } else {
      // resistor, capacitor, inductor, switch, bulb, appliance
      terminals.push(
        { id: `${componentId}_t1`, componentId, type: 'terminal1', position: { x: 0, y: 20 } },
        { id: `${componentId}_t2`, componentId, type: 'terminal2', position: { x: 80, y: 20 } }
      );
    }
    return terminals;
  }

  removeComponent(id: string) {
    const comp = this.components.get(id);
    if (comp) {
      const terminalIds = new Set(comp.terminals.map((t) => t.id));
      this.wires = this.wires.filter(
        (wire) => !terminalIds.has(wire.from) && !terminalIds.has(wire.to)
      );
      this.components.delete(id);
    }
  }

  getComponent(id: string): CircuitComponent | undefined {
    return this.components.get(id);
  }

  addWire(from: string, to: string): Wire | null {
    if (from === to) return null;
    const exists = this.wires.some(
      (w) => (w.from === from && w.to === to) || (w.from === to && w.to === from)
    );
    if (exists) return null;

    const wire: Wire = {
      id: `wire_${this.nextId++}`,
      from,
      to,
    };
    this.wires.push(wire);
    return wire;
  }

  removeWire(wireId: string) {
    this.wires = this.wires.filter((w) => w.id !== wireId);
  }

  getComponentCenter(type: ComponentType): { x: number; y: number } {
    if (type === 'battery' || type === 'acSource') return { x: 40, y: 40 };
    if (type === 'utilityBox') return { x: 30, y: 30 };
    if (type === 'ground') return { x: 10, y: 10 };
    return { x: 40, y: 20 };
  }

  getTerminalPosition(terminalId: string): { x: number; y: number } | null {
    for (const [, component] of this.components) {
      const terminal = component.terminals.find((t) => t.id === terminalId);
      if (terminal) {
        const rot = component.rotation || 0;
        if (rot === 0) {
          return {
            x: component.position.x + terminal.position.x,
            y: component.position.y + terminal.position.y,
          };
        }
        const center = this.getComponentCenter(component.type);
        const rad = (rot * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const dx = terminal.position.x - center.x;
        const dy = terminal.position.y - center.y;
        const rx = center.x + (dx * cos - dy * sin);
        const ry = center.y + (dx * sin + dy * cos);
        return {
          x: component.position.x + Math.round(rx),
          y: component.position.y + Math.round(ry),
        };
      }
    }
    return null;
  }

  findTerminalAt(x: number, y: number, threshold: number = 24): string | null {
    let closestId: string | null = null;
    let closestDist = threshold;
    for (const [, component] of this.components) {
      for (const terminal of component.terminals) {
        const pos = this.getTerminalPosition(terminal.id);
        if (pos) {
          const dx = pos.x - x;
          const dy = pos.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= closestDist) {
            closestDist = dist;
            closestId = terminal.id;
          }
        }
      }
    }
    return closestId;
  }

  buildGraph(includeSwitches: boolean = false): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    const connect = (a: string, b: string) => {
      if (!graph.has(a)) graph.set(a, []);
      if (!graph.has(b)) graph.set(b, []);
      graph.get(a)!.push(b);
      graph.get(b)!.push(a);
    };

    for (const wire of this.wires) {
      connect(wire.from, wire.to);
    }

    for (const component of this.components.values()) {
      if (component.type === 'battery' || component.type === 'acSource' || component.type === 'ground') {
        continue;
      }
      if (component.type === 'resistor' || component.type === 'bulb' || component.type === 'capacitor' || component.type === 'inductor' || component.type === 'appliance') {
        const [a, b] = component.terminals;
        if (a && b) connect(a.id, b.id);
      } else if (component.type === 'utilityBox') {
        const [p1, p2, n1, n2] = component.terminals;
        if (p1 && p2) connect(p1.id, p2.id);
        if (n1 && n2) connect(n1.id, n2.id);
      } else if (component.type === 'switch') {
        if (includeSwitches || component.properties.closed) {
          const [a, b] = component.terminals;
          if (a && b) connect(a.id, b.id);
        }
      }
    }
    return graph;
  }

  toJSON(): SerializedCircuit {
    return {
      components: Array.from(this.components.entries()),
      wires: this.wires,
      nextId: this.nextId,
    };
  }

  fromJSON(data: SerializedCircuit) {
    this.clear();
    if (data && Array.isArray(data.components)) {
      this.components = new Map(data.components);
    }
    if (data && Array.isArray(data.wires)) {
      this.wires = data.wires;
    }
    if (data && typeof data.nextId === 'number' && !isNaN(data.nextId)) {
      this.nextId = data.nextId;
    }
  }
}

// Complex Number Helper for AC Circuits
interface Complex {
  re: number;
  im: number;
}

const cZero = (): Complex => ({ re: 0, im: 0 });
const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const cSub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const cDiv = (a: Complex, b: Complex): Complex => {
  const den = b.re * b.re + b.im * b.im;
  if (den === 0) return { re: Infinity, im: 0 };
  return {
    re: (a.re * b.re + a.im * b.im) / den,
    im: (a.im * b.re - a.re * b.im) / den,
  };
};
const cMag = (a: Complex): number => Math.hypot(a.re, a.im);
const cConj = (a: Complex): Complex => ({ re: a.re, im: -a.im });

export class CircuitSolver {
  model: CircuitModel;

  constructor(model: CircuitModel) {
    this.model = model;
  }

  solve(): SolverResult {
    const result: SolverResult = {
      valid: false,
      topology: 'unknown',
      sourceType: 'dc',
      voltage: null,
      current: null,
      totalResistance: null,
      power: null,
      apparentPower: null,
      reactivePower: null,
      powerFactor: null,
      frequency: null,
      componentResults: new Map(),
      warnings: [],
      shortCircuit: false,
      openCircuit: false,
      path: null,
      paths: [],
    };

    const acSources = Array.from(this.model.components.values()).filter((c) => c.type === 'acSource');
    const batteries = Array.from(this.model.components.values()).filter((c) => c.type === 'battery');

    if (acSources.length > 0) {
      if (batteries.length > 0) {
        result.warnings.push('mixed_source_types_unsupported');
        return result;
      }
      return this.solveAC(result, acSources);
    }

    if (batteries.length === 0) {
      result.warnings.push('no_source');
      return result;
    }

    if (Array.from(this.model.components.values()).some((c) => c.type === 'appliance')) {
      result.warnings.push('appliance_requires_ac');
      return result;
    }

    const source = this.resolveSource(batteries);
    if ('error' in source) {
      result.warnings.push(source.error);
      return result;
    }

    const { voltage, positiveTerminal: batteryPosTerminal, negativeTerminal: batteryNegTerminal } = source;
    result.voltage = voltage;

    if (!batteryPosTerminal || !batteryNegTerminal) {
      result.warnings.push('invalid_battery');
      return result;
    }

    // Disjoint set for connectivity
    const parent = new Map<string, string>();
    const findRoot = (id: string): string => {
      if (!parent.has(id)) parent.set(id, id);
      let root = id;
      while (parent.get(root) !== root) root = parent.get(root)!;
      let curr = id;
      while (parent.get(curr) !== curr) {
        const next = parent.get(curr)!;
        parent.set(curr, root);
        curr = next;
      }
      return root;
    };

    const union = (a: string, b: string) => {
      const rootA = findRoot(a);
      const rootB = findRoot(b);
      if (rootA !== rootB) parent.set(rootB, rootA);
    };

    for (const comp of this.model.components.values()) {
      for (const t of comp.terminals) findRoot(t.id);
    }
    for (const wire of this.model.wires) union(wire.from, wire.to);

    interface ResistorEdge {
      component: CircuitComponent;
      a: string;
      b: string;
      resistance: number;
      nodeA?: string;
      nodeB?: string;
    }
    const resistors: ResistorEdge[] = [];

    for (const comp of this.model.components.values()) {
      if (comp.type === 'utilityBox') {
        const [p1, p2, n1, n2] = comp.terminals;
        if (p1 && p2) union(p1.id, p2.id);
        if (n1 && n2) union(n1.id, n2.id);
      } else if (comp.type === 'switch') {
        if (comp.properties.closed) {
          const [a, b] = comp.terminals;
          if (a && b) union(a.id, b.id);
        }
      } else if (comp.type === 'resistor' || comp.type === 'bulb') {
        const resistance = parseFloat(String(comp.properties.resistance ?? 10));
        if (!Number.isFinite(resistance) || resistance < 0) {
          result.warnings.push('invalid_resistance');
          return result;
        }
        const [a, b] = comp.terminals;
        if (a && b) {
          if (resistance === 0) union(a.id, b.id);
          else resistors.push({ component: comp, a: a.id, b: b.id, resistance });
        }
      } else if (comp.type === 'inductor') {
        // Ideal inductor acts as short circuit in DC steady state
        const [a, b] = comp.terminals;
        if (a && b) union(a.id, b.id);
      } else if (comp.type === 'capacitor') {
        // Ideal capacitor acts as open circuit in DC steady state
        // edges not united
      }
    }

    const positiveNode = findRoot(batteryPosTerminal.id);
    const negativeNode = findRoot(batteryNegTerminal.id);

    if (positiveNode === negativeNode) {
      result.shortCircuit = true;
      result.warnings.push('short_circuit');
      return result;
    }

    const edges = resistors
      .map((edge) => ({
        ...edge,
        nodeA: findRoot(edge.a),
        nodeB: findRoot(edge.b),
      }))
      .filter((edge) => edge.nodeA !== edge.nodeB);

    const adjacency = new Map<string, Set<string>>();
    const addNeighbor = (a: string, b: string) => {
      if (!adjacency.has(a)) adjacency.set(a, new Set());
      if (!adjacency.has(b)) adjacency.set(b, new Set());
      adjacency.get(a)!.add(b);
      adjacency.get(b)!.add(a);
    };
    for (const edge of edges) addNeighbor(edge.nodeA!, edge.nodeB!);

    // Reachability from positive terminal
    const reachable = new Set<string>([positiveNode]);
    const queue = [positiveNode];
    while (queue.length > 0) {
      const node = queue.shift()!;
      for (const next of adjacency.get(node) || []) {
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }

    if (!reachable.has(negativeNode)) {
      result.openCircuit = true;
      const possiblePath = this.findPath(
        this.model.buildGraph(true),
        batteryPosTerminal.id,
        batteryNegTerminal.id
      );
      const pathComponents = possiblePath ? this.getComponentsInPath(possiblePath) : [];
      const blockedByOpenSwitch = pathComponents.some(
        (c) => c.type === 'switch' && !c.properties.closed
      );
      result.warnings.push(blockedByOpenSwitch ? 'switch_open' : 'open_circuit');
      result.current = 0;
      return result;
    }

    const activeEdges = edges.filter(
      (edge) => reachable.has(edge.nodeA!) && reachable.has(edge.nodeB!)
    );
    const nodes = Array.from(reachable);
    const unknownNodes = nodes.filter((n) => n !== positiveNode && n !== negativeNode);
    const unknownIndex = new Map(unknownNodes.map((n, i) => [n, i]));

    const solvePotentials = (sourceVoltage: number): Map<string, number> | null => {
      const size = unknownNodes.length;
      const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
      const rhs: number[] = Array(size).fill(0);

      for (const edge of activeEdges) {
        const conductance = 1 / edge.resistance;
        const indexA = unknownIndex.get(edge.nodeA!);
        const indexB = unknownIndex.get(edge.nodeB!);

        if (indexA !== undefined) matrix[indexA][indexA] += conductance;
        if (indexB !== undefined) matrix[indexB][indexB] += conductance;

        if (indexA !== undefined && indexB !== undefined) {
          matrix[indexA][indexB] -= conductance;
          matrix[indexB][indexA] -= conductance;
        } else if (indexA !== undefined && edge.nodeB === positiveNode) {
          rhs[indexA] += conductance * sourceVoltage;
        } else if (indexB !== undefined && edge.nodeA === positiveNode) {
          rhs[indexB] += conductance * sourceVoltage;
        }
      }

      const values = this.solveLinearSystem(matrix, rhs);
      if (!values) return null;
      const potentials = new Map<string, number>([
        [positiveNode, sourceVoltage],
        [negativeNode, 0],
      ]);
      unknownNodes.forEach((node, index) => potentials.set(node, values[index]));
      return potentials;
    };

    const potentials = solvePotentials(voltage);
    const unitPotentials = solvePotentials(1);

    if (!potentials || !unitPotentials) {
      result.warnings.push('solver_error');
      return result;
    }

    const sourceCurrent = (voltageValue: number, values: Map<string, number>): number =>
      activeEdges
        .filter((edge) => edge.nodeA === positiveNode || edge.nodeB === positiveNode)
        .reduce((sum, edge) => {
          const otherNode = edge.nodeA === positiveNode ? edge.nodeB! : edge.nodeA!;
          return sum + (voltageValue - (values.get(otherNode) || 0)) / edge.resistance;
        }, 0);

    const unitCurrent = sourceCurrent(1, unitPotentials);
    if (!(unitCurrent > 0) || !Number.isFinite(unitCurrent)) {
      result.warnings.push('solver_error');
      return result;
    }

    result.totalResistance = 1 / unitCurrent;
    result.current = Math.abs(sourceCurrent(voltage, potentials));
    result.power = Math.abs(voltage) * result.current;
    result.apparentPower = result.power;
    result.reactivePower = 0;
    result.powerFactor = 1;
    result.valid = true;

    const flowingEdges = activeEdges.filter(
      (edge) =>
        Math.abs((potentials.get(edge.nodeA!) || 0) - (potentials.get(edge.nodeB!) || 0)) > 1e-12
    );

    result.topology = this.classifyTopology(
      flowingEdges.length ? flowingEdges : activeEdges,
      positiveNode,
      negativeNode
    );

    for (const edge of activeEdges) {
      const vA = potentials.get(edge.nodeA!) || 0;
      const vB = potentials.get(edge.nodeB!) || 0;
      const voltageDrop = Math.abs(vA - vB);
      const current = voltageDrop / edge.resistance;
      result.componentResults.set(edge.component.id, {
        voltage: voltageDrop,
        current,
        power: voltageDrop * current,
      });
    }

    result.paths = this.findAllPaths(
      this.model.buildGraph(false),
      batteryPosTerminal.id,
      batteryNegTerminal.id
    );
    result.path = result.paths[0] || null;
    return result;
  }

  solveAC(result: SolverResult, sources: CircuitComponent[]): SolverResult {
    result.sourceType = 'ac';
    if (sources.length !== 1) {
      result.warnings.push('multiple_ac_sources_unsupported');
      return result;
    }

    const source = sources[0];
    const voltage = parseFloat(String(source.properties.voltageRms ?? 120));
    const frequency = parseFloat(String(source.properties.frequency ?? 60));
    const positiveTerminal = source.terminals.find((t) => t.type === 'positive');
    const negativeTerminal = source.terminals.find((t) => t.type === 'negative');

    if (!Number.isFinite(voltage) || voltage <= 0 || !Number.isFinite(frequency) || frequency <= 0) {
      result.warnings.push('invalid_ac_source');
      return result;
    }
    if (!positiveTerminal || !negativeTerminal) {
      result.warnings.push('invalid_battery');
      return result;
    }

    result.voltage = voltage;
    result.frequency = frequency;

    const parent = new Map<string, string>();
    const findRoot = (id: string): string => {
      if (!parent.has(id)) parent.set(id, id);
      let root = id;
      while (parent.get(root) !== root) root = parent.get(root)!;
      let curr = id;
      while (parent.get(curr) !== curr) {
        const next = parent.get(curr)!;
        parent.set(curr, root);
        curr = next;
      }
      return root;
    };

    const union = (a: string, b: string) => {
      const rootA = findRoot(a);
      const rootB = findRoot(b);
      if (rootA !== rootB) parent.set(rootB, rootA);
    };

    for (const comp of this.model.components.values()) {
      for (const t of comp.terminals) findRoot(t.id);
    }
    for (const wire of this.model.wires) union(wire.from, wire.to);

    for (const comp of this.model.components.values()) {
      if (comp.type === 'utilityBox') {
        const [p1, p2, n1, n2] = comp.terminals;
        if (p1 && p2) union(p1.id, p2.id);
        if (n1 && n2) union(n1.id, n2.id);
      } else if (comp.type === 'switch') {
        if (comp.properties.closed) {
          const [a, b] = comp.terminals;
          if (a && b) union(a.id, b.id);
        }
      }
    }

    interface ImpedanceEdge {
      component: CircuitComponent;
      a: string;
      b: string;
      impedance: Complex;
      nodeA?: string;
      nodeB?: string;
    }
    const edges: ImpedanceEdge[] = [];

    for (const comp of this.model.components.values()) {
      const [a, b] = comp.terminals || [];
      if (!a || !b) continue;

      let impedance: Complex;
      if (comp.type === 'resistor' || comp.type === 'bulb') {
        const resistance = parseFloat(String(comp.properties.resistance ?? 10));
        if (!Number.isFinite(resistance) || resistance < 0) {
          result.warnings.push('invalid_resistance');
          return result;
        }
        if (resistance === 0) {
          union(a.id, b.id);
          continue;
        }
        impedance = { re: resistance, im: 0 };
      } else if (comp.type === 'capacitor' || comp.type === 'inductor') {
        const value = parseFloat(String(comp.properties.value ?? 0.000001));
        if (!Number.isFinite(value) || value <= 0) {
          result.warnings.push('invalid_reactive_value');
          return result;
        }
        const omega = 2 * Math.PI * frequency;
        impedance =
          comp.type === 'capacitor'
            ? { re: 0, im: -1 / (omega * value) }
            : { re: 0, im: omega * value };
      } else if (comp.type === 'appliance') {
        const ratedVoltage = parseFloat(String(comp.properties.ratedVoltage ?? 120));
        const ratedPower = parseFloat(String(comp.properties.ratedPower ?? 100));
        const powerFactor = parseFloat(String(comp.properties.powerFactor ?? 0.9));

        if (
          !Number.isFinite(ratedVoltage) || ratedVoltage <= 0 ||
          !Number.isFinite(ratedPower) || ratedPower <= 0 ||
          !Number.isFinite(powerFactor) || powerFactor <= 0 || powerFactor > 1
        ) {
          result.warnings.push('invalid_appliance_rating');
          return result;
        }
        const magnitude = (ratedVoltage * ratedVoltage * powerFactor) / ratedPower;
        impedance = {
          re: magnitude * powerFactor,
          im: magnitude * Math.sqrt(Math.max(0, 1 - powerFactor * powerFactor)),
        };
      } else {
        continue;
      }
      edges.push({ component: comp, a: a.id, b: b.id, impedance });
    }

    const positiveNode = findRoot(positiveTerminal.id);
    const negativeNode = findRoot(negativeTerminal.id);

    if (positiveNode === negativeNode) {
      result.shortCircuit = true;
      result.warnings.push('short_circuit');
      return result;
    }

    for (const edge of edges) {
      edge.nodeA = findRoot(edge.a);
      edge.nodeB = findRoot(edge.b);
    }
    const activeEdges = edges.filter((edge) => edge.nodeA !== edge.nodeB);

    const adjacency = new Map<string, Set<string>>();
    const connect = (a: string, b: string) => {
      if (!adjacency.has(a)) adjacency.set(a, new Set());
      if (!adjacency.has(b)) adjacency.set(b, new Set());
      adjacency.get(a)!.add(b);
      adjacency.get(b)!.add(a);
    };
    activeEdges.forEach((edge) => connect(edge.nodeA!, edge.nodeB!));

    const reachable = new Set<string>([positiveNode]);
    const queue = [positiveNode];
    while (queue.length > 0) {
      const node = queue.shift()!;
      for (const next of adjacency.get(node) || []) {
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }

    if (!reachable.has(negativeNode)) {
      result.openCircuit = true;
      const path = this.findPath(this.model.buildGraph(true), positiveTerminal.id, negativeTerminal.id);
      const pathComponents = path ? this.getComponentsInPath(path) : [];
      result.warnings.push(
        pathComponents.some((c) => c.type === 'switch' && !c.properties.closed)
          ? 'switch_open'
          : 'open_circuit'
      );
      result.current = 0;
      return result;
    }

    const conductingEdges = activeEdges.filter(
      (edge) => reachable.has(edge.nodeA!) && reachable.has(edge.nodeB!)
    );
    const nodes = Array.from(reachable);
    const unknownNodes = nodes.filter((n) => n !== positiveNode && n !== negativeNode);
    const unknownIndex = new Map(unknownNodes.map((n, i) => [n, i]));

    const solvePotentials = (sourceVoltage: number): Map<string, Complex> | null => {
      const size = unknownNodes.length;
      const matrix: Complex[][] = Array.from({ length: size }, () => Array.from({ length: size }, cZero));
      const rhs: Complex[] = Array.from({ length: size }, cZero);

      for (const edge of conductingEdges) {
        const admittance = cDiv({ re: 1, im: 0 }, edge.impedance);
        const indexA = unknownIndex.get(edge.nodeA!);
        const indexB = unknownIndex.get(edge.nodeB!);

        if (indexA !== undefined) matrix[indexA][indexA] = cAdd(matrix[indexA][indexA], admittance);
        if (indexB !== undefined) matrix[indexB][indexB] = cAdd(matrix[indexB][indexB], admittance);

        if (indexA !== undefined && indexB !== undefined) {
          matrix[indexA][indexB] = cSub(matrix[indexA][indexB], admittance);
          matrix[indexB][indexA] = cSub(matrix[indexB][indexA], admittance);
        } else if (indexA !== undefined && edge.nodeB === positiveNode) {
          rhs[indexA] = cAdd(rhs[indexA], cMul(admittance, { re: sourceVoltage, im: 0 }));
        } else if (indexB !== undefined && edge.nodeA === positiveNode) {
          rhs[indexB] = cAdd(rhs[indexB], cMul(admittance, { re: sourceVoltage, im: 0 }));
        }
      }

      const values = this.solveComplexLinearSystem(matrix, rhs);
      if (!values) return null;
      const potentials = new Map<string, Complex>([
        [positiveNode, { re: sourceVoltage, im: 0 }],
        [negativeNode, cZero()],
      ]);
      unknownNodes.forEach((node, index) => potentials.set(node, values[index]));
      return potentials;
    };

    const potentials = solvePotentials(voltage);
    const unitPotentials = solvePotentials(1);

    if (!potentials || !unitPotentials) {
      result.warnings.push('solver_error');
      return result;
    }

    const sourceCurrent = (values: Map<string, Complex>, sourceVoltage: number): Complex =>
      conductingEdges
        .filter((edge) => edge.nodeA === positiveNode || edge.nodeB === positiveNode)
        .reduce((sum, edge) => {
          const otherNode = edge.nodeA === positiveNode ? edge.nodeB! : edge.nodeA!;
          const posVal = values.get(positiveNode) || { re: sourceVoltage, im: 0 };
          const otherVal = values.get(otherNode) || cZero();
          const branchVoltage = cSub(posVal, otherVal);
          const branchCurrent = cDiv(branchVoltage, edge.impedance);
          return cAdd(sum, branchCurrent);
        }, cZero());

    const unitCurrent = sourceCurrent(unitPotentials, 1);
    if (!(cMag(unitCurrent) > 0) || !Number.isFinite(cMag(unitCurrent))) {
      result.warnings.push('solver_error');
      return result;
    }

    const equivalentImpedance = cDiv({ re: 1, im: 0 }, unitCurrent);
    result.totalResistance = cMag(equivalentImpedance);
    const totalCurrentPhasor = sourceCurrent(potentials, voltage);
    result.current = cMag(totalCurrentPhasor);
    result.apparentPower = voltage * result.current;
    result.power = 0;

    for (const edge of conductingEdges) {
      const vA = potentials.get(edge.nodeA!) || cZero();
      const vB = potentials.get(edge.nodeB!) || cZero();
      const voltageDrop = cSub(vA, vB);
      const currentPhasor = cDiv(voltageDrop, edge.impedance);
      const voltageMagnitude = cMag(voltageDrop);
      const currentMagnitude = cMag(currentPhasor);
      const complexPower = cMul(voltageDrop, cConj(currentPhasor));
      const realPower = Math.max(0, complexPower.re);
      result.power += realPower;
      result.componentResults.set(edge.component.id, {
        voltage: voltageMagnitude,
        current: currentMagnitude,
        power: realPower,
        powerFactor:
          voltageMagnitude * currentMagnitude > 0
            ? realPower / (voltageMagnitude * currentMagnitude)
            : 1,
      });
    }

    result.powerFactor = result.apparentPower > 0 ? result.power / result.apparentPower : 1;
    const apparent = result.apparentPower;
    const real = result.power;
    result.reactivePower = Math.sqrt(Math.max(0, apparent * apparent - real * real));
    result.valid = true;

    const flowingEdges = conductingEdges.filter(
      (edge) =>
        cMag(cSub(potentials.get(edge.nodeA!) || cZero(), potentials.get(edge.nodeB!) || cZero())) > 1e-12
    );

    result.topology = this.classifyTopology(
      flowingEdges.length ? flowingEdges : conductingEdges,
      positiveNode,
      negativeNode
    );

    result.paths = this.findAllPaths(
      this.model.buildGraph(false),
      positiveTerminal.id,
      negativeTerminal.id
    );
    result.path = result.paths[0] || null;
    return result;
  }

  resolveSource(batteries: CircuitComponent[]):
    | { voltage: number; positiveTerminal: Terminal; negativeTerminal: Terminal }
    | { error: 'invalid_voltage' | 'invalid_battery' | 'incompatible_sources' | 'unsupported_source_topology' } {
    const sources: {
      battery: CircuitComponent;
      voltage: number;
      positiveTerminal: Terminal;
      negativeTerminal: Terminal;
    }[] = [];

    for (const battery of batteries) {
      const voltage = parseFloat(String(battery.properties.voltage ?? 9));
      const positiveTerminal = battery.terminals?.find((t) => t.type === 'positive');
      const negativeTerminal = battery.terminals?.find((t) => t.type === 'negative');
      if (!Number.isFinite(voltage)) return { error: 'invalid_voltage' };
      if (!positiveTerminal || !negativeTerminal) return { error: 'invalid_battery' };
      sources.push({ battery, voltage, positiveTerminal, negativeTerminal });
    }

    if (sources.length === 1) {
      return {
        voltage: sources[0].voltage,
        positiveTerminal: sources[0].positiveTerminal,
        negativeTerminal: sources[0].negativeTerminal,
      };
    }

    const parent = new Map<string, string>();
    const findRoot = (id: string): string => {
      if (!parent.has(id)) parent.set(id, id);
      let root = id;
      while (parent.get(root) !== root) root = parent.get(root)!;
      let curr = id;
      while (parent.get(curr) !== curr) {
        const next = parent.get(curr)!;
        parent.set(curr, root);
        curr = next;
      }
      return root;
    };

    const union = (a: string, b: string) => {
      const rootA = findRoot(a);
      const rootB = findRoot(b);
      if (rootA !== rootB) parent.set(rootB, rootA);
    };

    for (const comp of this.model.components.values()) {
      for (const t of comp.terminals) findRoot(t.id);
    }
    for (const wire of this.model.wires) union(wire.from, wire.to);

    for (const comp of this.model.components.values()) {
      if (comp.type === 'switch' && comp.properties.closed) {
        const [a, b] = comp.terminals;
        if (a && b) union(a.id, b.id);
      }
    }

    const sourceEdges = sources.map((s) => ({
      positive: findRoot(s.positiveTerminal.id),
      negative: findRoot(s.negativeTerminal.id),
      voltage: s.voltage,
    }));

    const adjacency = new Map<string, { edge: (typeof sourceEdges)[0]; next: string; direction: number }[]>();
    for (const edge of sourceEdges) {
      if (edge.positive === edge.negative && Math.abs(edge.voltage) > 1e-9) {
        return { error: 'incompatible_sources' };
      }
      if (!adjacency.has(edge.positive)) adjacency.set(edge.positive, []);
      if (!adjacency.has(edge.negative)) adjacency.set(edge.negative, []);
      adjacency.get(edge.positive)!.push({ edge, next: edge.negative, direction: 1 });
      adjacency.get(edge.negative)!.push({ edge, next: edge.positive, direction: -1 });
    }

    const first = sourceEdges[0];
    const offsets = new Map<string, number>([[first.positive, 0]]);
    const queue = [first.positive];

    while (queue.length > 0) {
      const node = queue.shift()!;
      for (const link of adjacency.get(node) || []) {
        const expected = offsets.get(node)! - link.direction * link.edge.voltage;
        if (!offsets.has(link.next)) {
          offsets.set(link.next, expected);
          queue.push(link.next);
        } else if (Math.abs(offsets.get(link.next)! - expected) > 1e-9) {
          return { error: 'incompatible_sources' };
        }
      }
    }

    if (offsets.size !== adjacency.size) return { error: 'unsupported_source_topology' };

    const sourceNodes = Array.from(adjacency.keys());
    let endpoints: string[];
    if (sourceNodes.length === 2) {
      endpoints = sourceNodes;
    } else {
      const degree = sourceNodes.map((node) => [node, (adjacency.get(node) || []).length] as [string, number]);
      endpoints = degree.filter(([, v]) => v === 1).map(([n]) => n);
      const isSeriesChain =
        endpoints.length === 2 &&
        sourceEdges.length === sourceNodes.length - 1 &&
        degree.every(([, v]) => v === 1 || v === 2);
      if (!isSeriesChain) return { error: 'unsupported_source_topology' };
    }

    const highNode = (offsets.get(endpoints[0]) || 0) >= (offsets.get(endpoints[1]) || 0) ? endpoints[0] : endpoints[1];
    const lowNode = highNode === endpoints[0] ? endpoints[1] : endpoints[0];

    const terminalFor = (node: string, type: string) =>
      sources
        .flatMap((s) => [s.positiveTerminal, s.negativeTerminal])
        .find((t) => findRoot(t.id) === node && t.type === type);

    const positiveTerminal = terminalFor(highNode, 'positive') || terminalFor(highNode, 'negative');
    const negativeTerminal = terminalFor(lowNode, 'negative') || terminalFor(lowNode, 'positive');

    if (!positiveTerminal || !negativeTerminal) return { error: 'invalid_battery' };

    return {
      voltage: Math.abs((offsets.get(highNode) || 0) - (offsets.get(lowNode) || 0)),
      positiveTerminal,
      negativeTerminal,
    };
  }

  solveLinearSystem(matrix: number[][], rhs: number[]): number[] | null {
    const size = rhs.length;
    if (size === 0) return [];
    const rows = matrix.map((row, index) => [...row, rhs[index]]);

    for (let col = 0; col < size; col++) {
      let pivot = col;
      for (let row = col + 1; row < size; row++) {
        if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
      }
      if (Math.abs(rows[pivot][col]) < 1e-15) return null;

      [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
      const divisor = rows[col][col];
      for (let j = col; j <= size; j++) rows[col][j] /= divisor;

      for (let row = 0; row < size; row++) {
        if (row === col) continue;
        const factor = rows[row][col];
        for (let j = col; j <= size; j++) {
          rows[row][j] -= factor * rows[col][j];
        }
      }
    }
    return rows.map((row) => row[size]);
  }

  solveComplexLinearSystem(matrix: Complex[][], rhs: Complex[]): Complex[] | null {
    const size = rhs.length;
    if (size === 0) return [];
    const rows = matrix.map((row, index) => [...row, { ...rhs[index] }]);

    for (let col = 0; col < size; col++) {
      let pivot = col;
      for (let row = col + 1; row < size; row++) {
        if (cMag(rows[row][col]) > cMag(rows[pivot][col])) pivot = row;
      }
      if (cMag(rows[pivot][col]) < 1e-15) return null;

      [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
      const divisor = rows[col][col];
      for (let j = col; j <= size; j++) rows[col][j] = cDiv(rows[col][j], divisor);

      for (let row = 0; row < size; row++) {
        if (row === col) continue;
        const factor = rows[row][col];
        for (let j = col; j <= size; j++) {
          rows[row][j] = cSub(rows[row][j], cMul(factor, rows[col][j]));
        }
      }
    }
    return rows.map((row) => row[size]);
  }

  classifyTopology(edges: { nodeA?: string; nodeB?: string }[], posNode: string, negNode: string): 'series' | 'parallel' | 'complex' | 'single' {
    if (edges.length === 0) return 'series';
    if (edges.length === 1) return 'single';

    const degree = new Map<string, number>();
    for (const edge of edges) {
      if (!edge.nodeA || !edge.nodeB) continue;
      degree.set(edge.nodeA, (degree.get(edge.nodeA) || 0) + 1);
      degree.set(edge.nodeB, (degree.get(edge.nodeB) || 0) + 1);
    }

    const isAllEndpoints = edges.every(
      (edge) =>
        (edge.nodeA === posNode && edge.nodeB === negNode) ||
        (edge.nodeA === negNode && edge.nodeB === posNode)
    );
    if (isAllEndpoints) return 'parallel';

    // In a pure series loop, every internal node has degree 2, and endpoints have degree 1
    const internalNodes = Array.from(degree.keys()).filter((n) => n !== posNode && n !== negNode);
    const isPureSeries =
      (degree.get(posNode) || 0) === 1 &&
      (degree.get(negNode) || 0) === 1 &&
      internalNodes.every((n) => degree.get(n) === 2);

    if (isPureSeries) return 'series';
    return 'complex';
  }

  findPath(graph: Map<string, string[]>, start: string, end: string): string[] | null {
    const queue: string[][] = [[start]];
    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];
      if (node === end) return path;

      for (const neighbor of graph.get(node) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }

  findAllPaths(graph: Map<string, string[]>, start: string, end: string, maxPaths: number = 8): string[][] {
    const allPaths: string[][] = [];
    const queue: string[][] = [[start]];

    while (queue.length > 0 && allPaths.length < maxPaths) {
      const path = queue.shift()!;
      const node = path[path.length - 1];
      if (node === end) {
        allPaths.push(path);
        continue;
      }
      for (const neighbor of graph.get(node) || []) {
        if (!path.includes(neighbor)) {
          queue.push([...path, neighbor]);
        }
      }
    }
    return allPaths;
  }

  getComponentsInPath(path: string[]): CircuitComponent[] {
    const components: CircuitComponent[] = [];
    const seen = new Set<string>();

    for (const terminalId of path) {
      for (const comp of this.model.components.values()) {
        if (comp.terminals.some((t) => t.id === terminalId) && !seen.has(comp.id)) {
          seen.add(comp.id);
          components.push(comp);
        }
      }
    }
    return components;
  }
}
