/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SerializedCircuit } from '../types/circuit';

export interface PresetCircuit {
  id: string;
  name: { en: string; ceb: string };
  description: { en: string; ceb: string };
  data: SerializedCircuit;
}

export const PRESET_CIRCUITS: PresetCircuit[] = [
  {
    id: 'simple-dc',
    name: {
      en: 'Simple DC Series Loop',
      ceb: 'Yano nga DC Series Loop',
    },
    description: {
      en: '9V Battery, closed knife switch, 10 Ω resistor, and glowing light bulb.',
      ceb: '9V nga Baterya, siradong switch, 10 Ω nga resistor, ug nagsiga nga bombilya.',
    },
    data: {
      nextId: 10,
      components: [
        [
          'battery_1',
          {
            id: 'battery_1',
            type: 'battery',
            properties: { voltage: 9 },
            position: { x: 80, y: 140 },
            terminals: [
              { id: 'battery_1_pos', componentId: 'battery_1', type: 'positive', position: { x: 40, y: 0 } },
              { id: 'battery_1_neg', componentId: 'battery_1', type: 'negative', position: { x: 40, y: 80 } },
            ],
          },
        ],
        [
          'switch_2',
          {
            id: 'switch_2',
            type: 'switch',
            properties: { closed: true },
            position: { x: 220, y: 80 },
            terminals: [
              { id: 'switch_2_t1', componentId: 'switch_2', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'switch_2_t2', componentId: 'switch_2', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
        [
          'bulb_3',
          {
            id: 'bulb_3',
            type: 'bulb',
            properties: { resistance: 5 },
            position: { x: 380, y: 80 },
            terminals: [
              { id: 'bulb_3_t1', componentId: 'bulb_3', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'bulb_3_t2', componentId: 'bulb_3', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
        [
          'resistor_4',
          {
            id: 'resistor_4',
            type: 'resistor',
            properties: { resistance: 10 },
            position: { x: 280, y: 260 },
            terminals: [
              { id: 'resistor_4_t1', componentId: 'resistor_4', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'resistor_4_t2', componentId: 'resistor_4', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
      ],
      wires: [
        { id: 'wire_5', from: 'battery_1_pos', to: 'switch_2_t1' },
        { id: 'wire_6', from: 'switch_2_t2', to: 'bulb_3_t1' },
        { id: 'wire_7', from: 'bulb_3_t2', to: 'resistor_4_t2' },
        { id: 'wire_8', from: 'resistor_4_t1', to: 'battery_1_neg' },
      ],
    },
  },
  {
    id: 'parallel-branches',
    name: {
      en: 'Parallel Resistor Branches',
      ceb: 'Parallel nga Sangang Resistors',
    },
    description: {
      en: '12V Battery powering two 20 Ω resistors in parallel (Req = 10 Ω, Total I = 1.20 A).',
      ceb: '12V nga Baterya nagsuplay og duha ka 20 Ω resistors nga naka-parallel.',
    },
    data: {
      nextId: 10,
      components: [
        [
          'battery_1',
          {
            id: 'battery_1',
            type: 'battery',
            properties: { voltage: 12 },
            position: { x: 80, y: 150 },
            terminals: [
              { id: 'battery_1_pos', componentId: 'battery_1', type: 'positive', position: { x: 40, y: 0 } },
              { id: 'battery_1_neg', componentId: 'battery_1', type: 'negative', position: { x: 40, y: 80 } },
            ],
          },
        ],
        [
          'resistor_2',
          {
            id: 'resistor_2',
            type: 'resistor',
            properties: { resistance: 20 },
            position: { x: 260, y: 90 },
            terminals: [
              { id: 'resistor_2_t1', componentId: 'resistor_2', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'resistor_2_t2', componentId: 'resistor_2', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
        [
          'resistor_3',
          {
            id: 'resistor_3',
            type: 'resistor',
            properties: { resistance: 20 },
            position: { x: 260, y: 220 },
            terminals: [
              { id: 'resistor_3_t1', componentId: 'resistor_3', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'resistor_3_t2', componentId: 'resistor_3', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
      ],
      wires: [
        { id: 'wire_4', from: 'battery_1_pos', to: 'resistor_2_t1' },
        { id: 'wire_5', from: 'battery_1_pos', to: 'resistor_3_t1' },
        { id: 'wire_6', from: 'resistor_2_t2', to: 'battery_1_neg' },
        { id: 'wire_7', from: 'resistor_3_t2', to: 'battery_1_neg' },
      ],
    },
  },
  {
    id: 'ac-appliance',
    name: {
      en: 'AC Mains & Household Appliance',
      ceb: 'AC Mains ug Karga sa Gamit sa Balay',
    },
    description: {
      en: '120V AC 60Hz source powering a light bulb and a 150W appliance load.',
      ceb: '120V AC 60Hz nga linya nagpaandar og bombilya ug 150W nga appliance load.',
    },
    data: {
      nextId: 10,
      components: [
        [
          'acSource_1',
          {
            id: 'acSource_1',
            type: 'acSource',
            properties: { voltageRms: 120, frequency: 60 },
            position: { x: 80, y: 150 },
            terminals: [
              { id: 'acSource_1_pos', componentId: 'acSource_1', type: 'positive', position: { x: 40, y: 0 } },
              { id: 'acSource_1_neg', componentId: 'acSource_1', type: 'negative', position: { x: 40, y: 80 } },
            ],
          },
        ],
        [
          'bulb_2',
          {
            id: 'bulb_2',
            type: 'bulb',
            properties: { resistance: 120 },
            position: { x: 280, y: 80 },
            terminals: [
              { id: 'bulb_2_t1', componentId: 'bulb_2', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'bulb_2_t2', componentId: 'bulb_2', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
        [
          'appliance_3',
          {
            id: 'appliance_3',
            type: 'appliance',
            properties: { ratedVoltage: 120, ratedPower: 150, powerFactor: 0.9 },
            position: { x: 280, y: 220 },
            terminals: [
              { id: 'appliance_3_t1', componentId: 'appliance_3', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'appliance_3_t2', componentId: 'appliance_3', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
      ],
      wires: [
        { id: 'wire_4', from: 'acSource_1_pos', to: 'bulb_2_t1' },
        { id: 'wire_5', from: 'acSource_1_pos', to: 'appliance_3_t1' },
        { id: 'wire_6', from: 'bulb_2_t2', to: 'acSource_1_neg' },
        { id: 'wire_7', from: 'appliance_3_t2', to: 'acSource_1_neg' },
      ],
    },
  },
  {
    id: 'ac-rc-filter',
    name: {
      en: 'AC RC Series Circuit',
      ceb: 'AC RC Series nga Sirkito',
    },
    description: {
      en: '120V AC 60Hz source connected in series with a 50 Ω resistor and a 40 µF capacitor.',
      ceb: '120V AC 60Hz nga source gikonektar sa 50 Ω resistor ug 40 µF capacitor.',
    },
    data: {
      nextId: 10,
      components: [
        [
          'acSource_1',
          {
            id: 'acSource_1',
            type: 'acSource',
            properties: { voltageRms: 120, frequency: 60 },
            position: { x: 80, y: 150 },
            terminals: [
              { id: 'acSource_1_pos', componentId: 'acSource_1', type: 'positive', position: { x: 40, y: 0 } },
              { id: 'acSource_1_neg', componentId: 'acSource_1', type: 'negative', position: { x: 40, y: 80 } },
            ],
          },
        ],
        [
          'resistor_2',
          {
            id: 'resistor_2',
            type: 'resistor',
            properties: { resistance: 50 },
            position: { x: 240, y: 80 },
            terminals: [
              { id: 'resistor_2_t1', componentId: 'resistor_2', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'resistor_2_t2', componentId: 'resistor_2', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
        [
          'capacitor_3',
          {
            id: 'capacitor_3',
            type: 'capacitor',
            properties: { value: 0.00004 },
            position: { x: 380, y: 150 },
            terminals: [
              { id: 'capacitor_3_t1', componentId: 'capacitor_3', type: 'terminal1', position: { x: 0, y: 20 } },
              { id: 'capacitor_3_t2', componentId: 'capacitor_3', type: 'terminal2', position: { x: 80, y: 20 } },
            ],
          },
        ],
      ],
      wires: [
        { id: 'wire_4', from: 'acSource_1_pos', to: 'resistor_2_t1' },
        { id: 'wire_5', from: 'resistor_2_t2', to: 'capacitor_3_t1' },
        { id: 'wire_6', from: 'capacitor_3_t2', to: 'acSource_1_neg' },
      ],
    },
  },
];
