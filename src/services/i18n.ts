/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'ceb';

export interface Translations {
  [key: string]: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    'app-title': 'Volt-Flow Circuit Simulator',
    'app-subtitle': 'Interactive Electrical Circuit Lab & Analysis',
    'lang-english': 'English',
    'lang-bisaya': 'Bisaya (Cebuano)',

    // Header buttons
    'new-circuit-btn': 'New Circuit',
    'save-btn': 'Save',
    'load-btn': 'Load',
    'export-btn': 'Export JSON',
    'import-btn': 'Import JSON',
    'presets-btn': 'Presets',
    'qa-report-btn': 'Inspection & QA',
    'clear-all': 'Clear Workspace',
    'confirm-new': 'Are you sure you want to clear the circuit workspace? Any unsaved changes will be lost.',

    // Tools
    'tool-select': 'Select / Move',
    'tool-pan': 'Hand Tool (Drag Canvas)',
    'tool-wire': 'Draw Wire',
    'tool-battery': 'Battery (DC)',
    'tool-acSource': 'AC Source',
    'tool-resistor': 'Resistor',
    'tool-capacitor': 'Capacitor',
    'tool-inductor': 'Inductor',
    'tool-switch': 'Switch',
    'tool-bulb': 'Light Bulb',
    'tool-appliance': 'Appliance Load',
    'tool-utilityBox': 'Utility Box',
    'tool-ground': 'Ground',
    'tool-delete': 'Delete Element',

    // Canvas Zoom & Pan
    'zoom-in': 'Zoom In',
    'zoom-out': 'Zoom Out',
    'zoom-reset': 'Reset Zoom (100%)',
    'zoom-fit': 'Fit to View',
    'zoom-pan-hint': 'Manual Drag: Use Hand Tool ✋ or hold Spacebar',
    'pan-up': 'Pan Up',
    'pan-down': 'Pan Down',
    'pan-left': 'Pan Left',
    'pan-right': 'Pan Right',

    // Component labels
    'component-type-battery': 'Battery (DC Source)',
    'component-type-acSource': 'Sinusoidal AC Source',
    'component-type-resistor': 'Resistor',
    'component-type-capacitor': 'Capacitor',
    'component-type-inductor': 'Inductor',
    'component-type-switch': 'Knife Switch',
    'component-type-bulb': 'Incandescent Light Bulb',
    'component-type-appliance': 'AC Appliance Load',
    'component-type-utilityBox': 'Utility Junction Box',
    'component-type-ground': 'Ground Reference',
    'component-type-wire': 'Electrical Wire',

    // Component Properties
    'properties-title': 'Component Inspector',
    'no-selection': 'Select a component or wire to inspect and edit its electrical properties.',
    'voltage-property': 'Voltage (V)',
    'rms-voltage-property': 'AC RMS Voltage (V)',
    'frequency-property': 'Frequency (Hz)',
    'resistance-property': 'Resistance (Ω)',
    'capacitance-property': 'Capacitance (µF)',
    'inductance-property': 'Inductance (mH)',
    'rated-voltage-property': 'Rated Voltage (V)',
    'rated-power-property': 'Rated Power (W)',
    'power-factor-property': 'Power Factor (0–1)',
    'switch-state': 'Switch State',
    'switch-open': 'Open (Disconnected)',
    'switch-closed': 'Closed (Conducting)',
    'toggle-switch': 'Toggle Switch',
    'delete-component': 'Delete Component',
    'delete-wire': 'Delete Wire',
    'wire-connected-between': 'Connected between',

    // Component Info & Functions Tabs & Actions
    'component-info-tab': 'Info & Physics',
    'component-params-tab': 'Controls & Presets',
    'component-functions-title': 'Component Functions & Actions',
    'rotate-component': 'Rotate 90°',
    'duplicate-component': 'Duplicate Component',
    'reset-default-btn': 'Reset Defaults',
    'quick-presets-title': 'Quick Values & Ratings',
    'dc-behavior-title': 'DC Circuit Behavior',
    'ac-behavior-title': 'AC Circuit Behavior',
    'key-formula-title': 'Governing Equations',
    'real-world-apps-title': 'Real-World Applications',
    'symbol-desc-title': 'Schematic Symbol',
    'component-category': 'Category',
    'live-probe-title': 'Live Electrical Probe',
    'branch-voltage': 'Branch Voltage Drop',
    'branch-current': 'Branch Current',
    'power-dissipation': 'Power Dissipation',

    // Measurements
    'measurements-title': 'Live Multimeter',
    'voltage-label': 'Voltage',
    'rms-voltage-label': 'RMS Voltage',
    'current-label': 'Total Current',
    'resistance-label': 'Equivalent Resistance',
    'impedance-label': 'Equivalent Impedance |Z|',
    'power-label': 'Active Power (P)',
    'apparent-power-label': 'Apparent Power (S)',
    'reactive-power-label': 'Reactive Power (Q)',
    'power-factor-label': 'Power Factor (cos θ)',
    'frequency-label': 'Grid Frequency',
    'topology-label': 'Circuit Topology',
    'topology-series': 'Single-Loop Series',
    'topology-parallel': 'Parallel Branches',
    'topology-complex': 'Multi-Loop Network',
    'topology-single': 'Single Component',

    // Explanations & Formulas
    'explanation-title': 'Physics & Analysis',
    'default-explanation': 'Connect an active power source (Battery or AC Source) and a closed load loop to view detailed mathematical equations and circuit analysis.',
    'ohms_law_title': "Ohm's Law Analysis",
    'power_formula_title': 'Electric Power Calculation',
    'ac_power_triangle': 'AC Power Triangle',
    'series_analysis_text': 'All components are in a single series loop. The same electrical current flows sequentially through every component.',
    'parallel_analysis_text': 'Components branch into parallel paths across the common voltage nodes. Voltage remains equal across all parallel branches while currents divide.',
    'complex_analysis_text': 'Circuit solved using Kirchhoff\'s Current Law (KCL) and nodal admittance matrix analysis.',
    'switch_open_explanation': 'The switch is currently OPEN. An open switch creates an infinite impedance air gap ($R = \\infty$), preventing current from flowing ($I = 0\\text{ A}$).',
    'open_circuit_explanation': 'Circuit loop is broken or incomplete. Electric charges require a continuous conductive return path from the positive terminal to the negative terminal.',
    'short_circuit_explanation': 'DANGER: Zero-resistance short circuit detected! A direct conductive path exists across the source terminals with no significant load resistance, causing dangerously high current.',

    // Warnings & Diagnostics
    'no_source': 'No power source detected. Add a Battery (DC) or AC Source to energize the circuit.',
    'invalid_battery': 'Invalid battery terminal connections detected.',
    'invalid_voltage': 'Voltage value must be a valid positive number.',
    'invalid_resistance': 'Resistance must be a valid non-negative number.',
    'invalid_ac_source': 'AC source requires valid positive RMS voltage and frequency.',
    'invalid_reactive_value': 'Capacitor / Inductor requires a positive numerical value.',
    'invalid_appliance_rating': 'Appliance requires positive rated voltage, wattage, and a power factor between 0.01 and 1.0.',
    'mixed_source_types_unsupported': 'Unsupported combination: Cannot mix DC Battery and AC Source in the same circuit simultaneously.',
    'multiple_ac_sources_unsupported': 'Multiple AC sources are currently unsupported. Use a single AC source.',
    'appliance_requires_ac': 'AC Appliance loads must be powered by an AC Source (not a DC battery).',
    'incompatible_sources': 'Connected DC batteries have conflicting voltages or polarities in parallel.',
    'unsupported_source_topology': 'Complex multi-battery network topology could not be resolved.',
    'short_circuit': 'Warning: Direct Short Circuit! No load resistance between source terminals.',
    'switch_open': 'Notice: Conducting path is interrupted by an OPEN switch.',
    'open_circuit': 'Notice: Open Circuit. No continuous closed path between source terminals.',
    'solver_error': 'Calculation failed: Matrix singularity or unsolvable floating node.',
    'unsupported_parallel_topology': 'Branching network detected.',
    'multiple_sources': 'Multiple energy sources active in network.',

    // Empty state & canvas
    'empty-state-title': 'Your Workspace is Empty',
    'empty-state-desc': 'Click any component on the left toolbar to place it on the grid. Switch to the Wire tool to connect terminals together.',
    'drag-wire-hint': 'Drag between two gold terminals to create a wire connection.',
    'toggle-switch-hint': 'Click any switch directly on the canvas to toggle it open or closed.',

    // Storage feedback
    'circuit-saved': 'Circuit successfully saved to browser local storage.',
    'circuit-loaded': 'Circuit loaded successfully.',
    'no-saved-circuit': 'No saved circuit found in storage.',
    'storage-error': 'Storage operation failed or data was corrupted.',
    'schema-error': 'Import rejected: Corrupted JSON or invalid circuit schema.',
  },

  ceb: {
    'app-title': 'Volt-Flow Circuit Simulator',
    'app-subtitle': 'Interaktibong Electrical Circuit Lab ug Pagsusi',
    'lang-english': 'English',
    'lang-bisaya': 'Bisaya (Cebuano)',

    // Header buttons
    'new-circuit-btn': 'Bag-ong Circuit',
    'save-btn': 'I-save',
    'load-btn': 'I-load',
    'export-btn': 'I-export ang JSON',
    'import-btn': 'I-import ang JSON',
    'presets-btn': 'Mga Ehemplo (Presets)',
    'qa-report-btn': 'Pagsusi & QA Report',
    'clear-all': 'Limpyohi ang Workspace',
    'confirm-new': 'Sigurado ka ba nga gusto nimong limpyohan ang workspace? Mawala ang tanang wala ma-save nga kausaban.',

    // Tools
    'tool-select': 'Pilia / Ibalhin',
    'tool-pan': 'Kamot Tool (I-drag ang Canvas)',
    'tool-wire': 'Paghimo og Alambre',
    'tool-battery': 'Baterya (DC)',
    'tool-acSource': 'AC Source',
    'tool-resistor': 'Resistor',
    'tool-capacitor': 'Capacitor',
    'tool-inductor': 'Inductor',
    'tool-switch': 'Switch',
    'tool-bulb': 'Bombilya (Bulb)',
    'tool-appliance': 'Karga sa Appliance',
    'tool-utilityBox': 'Utility Junction Box',
    'tool-ground': 'Ground (Yuta)',
    'tool-delete': 'Papasa ang Elemento',

    // Canvas Zoom & Pan
    'zoom-in': 'Padak-a (Zoom In)',
    'zoom-out': 'Pagamya (Zoom Out)',
    'zoom-reset': 'I-reset ang Zoom (100%)',
    'zoom-fit': 'I-fit sa Screen',
    'zoom-pan-hint': 'Manwal nga Drag: Gamita ang Kamot Tool ✋ o Spacebar',
    'pan-up': 'I-pan Paibabaw',
    'pan-down': 'I-pan Paubos',
    'pan-left': 'I-pan Pawala',
    'pan-right': 'I-pan Patuo',

    // Component labels
    'component-type-battery': 'Baterya (DC Source)',
    'component-type-acSource': 'Sinusoidal AC Source',
    'component-type-resistor': 'Resistor',
    'component-type-capacitor': 'Capacitor',
    'component-type-inductor': 'Inductor',
    'component-type-switch': 'Switch sa Kuryente',
    'component-type-bulb': 'Bombilya',
    'component-type-appliance': 'Karga sa Appliance (AC)',
    'component-type-utilityBox': 'Utility Junction Box',
    'component-type-ground': 'Ground Reference',
    'component-type-wire': 'Alambre sa Kuryente',

    // Component Properties
    'properties-title': 'Pagsusi sa Komponent',
    'no-selection': 'Pilia ang usa ka komponent o alambre aron ma-usab ang mga electrical properties niini.',
    'voltage-property': 'Boltahe / Voltage (V)',
    'rms-voltage-property': 'AC RMS Boltahe (V)',
    'frequency-property': 'Frequency (Hz)',
    'resistance-property': 'Pagsukol / Resistance (Ω)',
    'capacitance-property': 'Capacitance (µF)',
    'inductance-property': 'Inductance (mH)',
    'rated-voltage-property': 'Rated Boltahe (V)',
    'rated-power-property': 'Rated Gahum / Power (W)',
    'power-factor-property': 'Power Factor (0–1)',
    'switch-state': 'Kahimtang sa Switch',
    'switch-open': 'Bukas (Walay Agi)',
    'switch-closed': 'Sirado (May Agi)',
    'toggle-switch': 'I-toggle ang Switch',
    'delete-component': 'Papasa ang Komponent',
    'delete-wire': 'Papasa ang Alambre',
    'wire-connected-between': 'Konektado taliwala sa',

    // Component Info & Functions Tabs & Actions
    'component-info-tab': 'Impormasyon & Pisika',
    'component-params-tab': 'Mga Kontrol & Presets',
    'component-functions-title': 'Mga Gamit ug Buhat sa Komponent',
    'rotate-component': 'Ituyok og 90°',
    'duplicate-component': 'Dobleha / Kopyaha',
    'reset-default-btn': 'Ibalik sa Default',
    'quick-presets-title': 'Dali nga Pagpili sa Kantidad',
    'dc-behavior-title': 'Gawi sa DC Sirkito',
    'ac-behavior-title': 'Gawi sa AC Sirkito',
    'key-formula-title': 'Pangulong Pormula',
    'real-world-apps-title': 'Paggamit sa Tinuod nga Kinabuhi',
    'symbol-desc-title': 'Simbolo sa Skematik',
    'component-category': 'Kategoriya',
    'live-probe-title': 'Aktwal nga Pagsukod (Live Probe)',
    'branch-voltage': 'Paghagsa sa Boltahe sa Sanga',
    'branch-current': 'Current nga Moagi sa Sanga',
    'power-dissipation': 'Nagamit nga Gahum (Power)',

    // Measurements
    'measurements-title': 'Direktang Multimeter',
    'voltage-label': 'Boltahe (Voltage)',
    'rms-voltage-label': 'RMS Boltahe',
    'current-label': 'Kabilugang Current',
    'resistance-label': 'Katumbas nga Resistance',
    'impedance-label': 'Katumbas nga Impedance |Z|',
    'power-label': 'Aktibong Gahum (P)',
    'apparent-power-label': 'Apparent Power (S)',
    'reactive-power-label': 'Reactive Power (Q)',
    'power-factor-label': 'Power Factor (cos θ)',
    'frequency-label': 'Frequency sa Grid',
    'topology-label': 'Koneksyon / Topology',
    'topology-series': 'Sunod-sunod (Series)',
    'topology-parallel': 'Tupad-tupad (Parallel)',
    'topology-complex': 'Kombinasyon (Multi-Loop)',
    'topology-single': 'Usa ka Komponent',

    // Explanations & Formulas
    'explanation-title': 'Pagsabot sa Pisika ug Pormula',
    'default-explanation': 'Ikonekta ang gigikanan sa kuryente (Baterya o AC) sa siradong loop aron makita ang kumpletong pormula ug pagsusi sa kuryente.',
    'ohms_law_title': "Pormula sa Batas ni Ohm (Ohm's Law)",
    'power_formula_title': 'Pagkwenta sa Gahum sa Kuryente (Power)',
    'ac_power_triangle': 'Trayanggulo sa Gahum sa AC',
    'series_analysis_text': 'Naka-series ang tanang parte sa usa ka loop. Ang parehas nga current moagi sa matag usa ka komponent.',
    'parallel_analysis_text': 'Naka-parallel ang mga sanga sa kuryente. Ang parehas nga boltahe maangkon sa matag sanga samtang ang current magbahin-bahin.',
    'complex_analysis_text': 'Gisulbad ang sirkito gamit ang Kirchhoff\'s Current Law (KCL) ug matrix nodal admittance.',
    'switch_open_explanation': 'Ang switch karon BUKAS. Kung bukas ang switch, aduna kini walay kinutubang pagsukol ($R = \\infty$), busa walay kuryente nga makaagi ($I = 0\\text{ A}$).',
    'open_circuit_explanation': 'Naputol o dili kompleto ang sirkito. Ang kuryente nagkinahanglan og tibuok nga agianan gikan sa positibo padulong sa negatibong terminal.',
    'short_circuit_explanation': 'PELIGRO: Nakit-an ang Direct Short Circuit! Walay igo nga load taliwala sa mga terminal sa baterya, hinungdan sa peligroso kaayo nga taas nga current.',

    // Warnings & Diagnostics
    'no_source': 'Walay nakitang tinubdan sa kuryente. Pagdugang og Baterya (DC) o AC Source.',
    'invalid_battery': 'Dili husto ang koneksyon sa mga terminal sa baterya.',
    'invalid_voltage': 'Ang boltahe kinahanglan nga positibong numero.',
    'invalid_resistance': 'Ang resistance kinahanglan dili negatibo nga numero.',
    'invalid_ac_source': 'Ang AC source nagkinahanglan og positibong RMS voltage ug frequency.',
    'invalid_reactive_value': 'Ang Capacitor o Inductor nagkinahanglan og positibong kantidad.',
    'invalid_appliance_rating': 'Kinahanglan og positibong rated voltage, wattage, ug power factor tali sa 0.01 ug 1.0.',
    'mixed_source_types_unsupported': 'Dili puwede isagol ang DC Baterya ug AC Source sa parehas nga sirkito.',
    'multiple_ac_sources_unsupported': 'Usa ra ka AC source ang gisuportahan karon.',
    'appliance_requires_ac': 'Ang mga gamit sa balay (Appliance) nagkinahanglan og AC Source, dili DC baterya.',
    'incompatible_sources': 'Ang mga gikonektar nga baterya adunay magkasumpaki nga boltahe o polaridad.',
    'unsupported_source_topology': 'Dili masulbad ang komplikadong koneksyon sa daghang baterya.',
    'short_circuit': 'Pahimangno: Direct Short Circuit! Walay resistance sa tunga sa tinubdan.',
    'switch_open': 'Pahibalo: Naputol ang agianan tungod kay BUKAS ang switch.',
    'open_circuit': 'Pahibalo: Bukas nga Sirkito (Open Circuit). Walay kompleto nga agianan.',
    'solver_error': 'Napakyas ang pagkwenta: Adunay floating node o dili masulbad nga matrix.',
    'unsupported_parallel_topology': 'Nakit-an ang branching network.',
    'multiple_sources': 'Daghan ang aktibong tinubdan sa kuryente.',

    // Empty state & canvas
    'empty-state-title': 'Haw-ang ang Imong Workspace',
    'empty-state-desc': 'I-klik ang bisan unsang komponent sa wala nga toolbar aron ibutang kini sa grid. Gamita ang Alambre (Wire) aron ikonektar ang mga terminal.',
    'drag-wire-hint': 'I-drag taliwala sa duha ka bulawanong terminal aron makahimo og koneksyon.',
    'toggle-switch-hint': 'I-klik ang switch sa canvas aron maabli o masira kini.',

    // Storage feedback
    'circuit-saved': 'Malampusong na-save ang sirkito sa browser local storage.',
    'circuit-loaded': 'Malampusong na-load ang sirkito.',
    'no-saved-circuit': 'Walay nakitang na-save nga sirkito sa storage.',
    'storage-error': 'Napakyas ang storage o nadaot ang data.',
    'schema-error': 'Wala gidawat: Nadaot nga JSON o dili balido nga circuit schema.',
  },
};

export class I18nManager {
  private currentLang: Language = 'en';
  private listeners: (() => void)[] = [];

  constructor() {
    const saved = localStorage.getItem('voltflow_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ceb')) {
      this.currentLang = saved;
    }
  }

  getLanguage(): Language {
    return this.currentLang;
  }

  setLanguage(lang: Language) {
    if (this.currentLang !== lang) {
      this.currentLang = lang;
      localStorage.setItem('voltflow_lang', lang);
      this.notify();
    }
  }

  t(key: string): string {
    const dict = translations[this.currentLang];
    if (dict && dict[key]) return dict[key];
    const enDict = translations.en;
    if (enDict && enDict[key]) return enDict[key];
    return key;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const i18n = new I18nManager();
