/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentType } from '../types/circuit';
import { Language } from './i18n';

export interface ComponentPresetValue {
  label: string;
  description: string;
  properties: Record<string, number | boolean>;
}

export interface ComponentInfoData {
  type: ComponentType;
  title: Record<Language, string>;
  category: Record<Language, string>;
  symbolDesc: Record<Language, string>;
  description: Record<Language, string>;
  dcBehavior: Record<Language, string>;
  acBehavior: Record<Language, string>;
  keyFormula: string;
  realWorldApplications: Record<Language, string>;
  presets: ComponentPresetValue[];
}

export const COMPONENT_INFO_REGISTRY: Record<ComponentType, ComponentInfoData> = {
  battery: {
    type: 'battery',
    title: {
      en: 'DC Battery (Voltage Source)',
      ceb: 'Baterya (DC Voltage Source)',
    },
    category: {
      en: 'Energy Source (DC)',
      ceb: 'Tinubdan sa Enerhiya (DC)',
    },
    symbolDesc: {
      en: 'Long positive line (+) and short thicker negative line (−).',
      ceb: 'Taas nga positibo linya (+) ug mugbo nga negatibo linya (−).',
    },
    description: {
      en: 'Electrochemical device that maintains a steady direct-current (DC) electric potential difference between its terminals, causing electrons to flow unidirectionally through the load.',
      ceb: 'Gamit nga naghatag og kanunay nga direct-current (DC) boltahe taliwala sa mga terminal niini, nagduso sa kuryente sa usa ka direksyon latas sa load.',
    },
    dcBehavior: {
      en: 'Supplies constant nominal voltage. In closed loops, charges flow out of the positive (+) terminal through external loads and return to negative (−).',
      ceb: 'Naghatag og kanunay nga boltahe. Ang kuryente mogawas sa positibo (+) nga terminal ug mobalik sa negatibo (−).',
    },
    acBehavior: {
      en: 'Cannot generate sinusoidal AC. Must not be connected with opposing polarities in parallel loops.',
      ceb: 'Dili makahatag og AC nga kuryente. Dili angay isumpay nga magkasumpaki ang polaridad sa parallel.',
    },
    keyFormula: 'V = \\text{constant}, \\quad P = V \\times I = I^2 R',
    realWorldApplications: {
      en: 'AA/AAA alkaline batteries (1.5V), smartphone Lithium-Ion cells (3.7V), automobile lead-acid batteries (12V), solar battery banks (24V/48V).',
      ceb: 'Baterya sa flashlight (1.5V), baterya sa cellphone (3.7V), baterya sa sakyanan (12V), solar battery bank (24V).',
    },
    presets: [
      { label: '1.5 V (AA / AAA)', description: 'Standard Alkaline Cell', properties: { voltage: 1.5 } },
      { label: '3.7 V (Li-Ion)', description: 'Rechargeable Cell', properties: { voltage: 3.7 } },
      { label: '9.0 V (Transistor)', description: '9V Smoke Alarm / Lab', properties: { voltage: 9.0 } },
      { label: '12.0 V (Car / UPS)', description: 'Automotive Battery', properties: { voltage: 12.0 } },
      { label: '24.0 V (Industrial)', description: 'PLC / Automation Bus', properties: { voltage: 24.0 } },
    ],
  },

  acSource: {
    type: 'acSource',
    title: {
      en: 'Sinusoidal AC Source (Grid Mains)',
      ceb: 'Sinusoidal AC Source (Linya sa Kuryente)',
    },
    category: {
      en: 'Energy Source (AC)',
      ceb: 'Tinubdan sa AC nga Enerhiya',
    },
    symbolDesc: {
      en: 'Circle enclosing a continuous alternating sine wave symbol (~ / ∿).',
      ceb: 'Lingin nga may balod sa sine wave sa sulod (∿).',
    },
    description: {
      en: 'Generates an alternating electromotive force whose magnitude and polarity reverse cyclically with time. Specified by its Root Mean Square (RMS) voltage and frequency.',
      ceb: 'Naghatag og alternating current (AC) diin ang boltahe ug direksyon sa kuryente magbalik-balik sa pagbalit-ad subay sa gitakdang frequency kada segundo.',
    },
    dcBehavior: {
      en: 'Average DC value is zero over a full cycle (pure AC oscillation).',
      ceb: 'Ang average DC value zero sa usa ka tibuok cycle.',
    },
    acBehavior: {
      en: 'Alternates voltage polarity at grid frequency (e.g., 60 Hz reverses 120 times/sec). Enables transformers, reactive power, and high-efficiency long-distance transmission.',
      ceb: 'Nagbag-o-bag-o sa polaridad sa gitakdang frequency (60 Hz nagpasabot og 120 ka balit-ad kada segundo).',
    },
    keyFormula: 'v(t) = \\sqrt{2} V_{\\text{RMS}} \\sin(2\\pi f t), \\quad S = V_{\\text{RMS}} I_{\\text{RMS}}',
    realWorldApplications: {
      en: 'Household wall outlets (120V 60Hz in US/PH, 230V 50Hz in Europe), diesel generator sets, hydro/thermal power stations.',
      ceb: 'Sakyit sa balay (120V/220V 60Hz), mga generator sa kuryente, planta sa kuryente.',
    },
    presets: [
      { label: '12 V RMS (60 Hz)', description: 'Low-Voltage Landscape / Doorbell', properties: { voltageRms: 12, frequency: 60 } },
      { label: '110 V RMS (60 Hz)', description: 'Standard US/JP Line', properties: { voltageRms: 110, frequency: 60 } },
      { label: '120 V RMS (60 Hz)', description: 'Modern Residential Mains', properties: { voltageRms: 120, frequency: 60 } },
      { label: '220 V RMS (60 Hz)', description: 'Philippine Standard Mains', properties: { voltageRms: 220, frequency: 60 } },
      { label: '230 V RMS (50 Hz)', description: 'European Standard Mains', properties: { voltageRms: 230, frequency: 50 } },
    ],
  },

  resistor: {
    type: 'resistor',
    title: {
      en: 'Linear Resistor',
      ceb: 'Resistor (Pagsukol sa Current)',
    },
    category: {
      en: 'Passive Load (Pure Resistance)',
      ceb: 'Passive nga Pagsukol',
    },
    symbolDesc: {
      en: 'Zigzag pointed path representing resistance to electron flow.',
      ceb: 'Zigzag nga linya nga naghulagway sa pagsukol sa kuryente.',
    },
    description: {
      en: 'Two-terminal electrical passive component implementing electrical resistance. Limits current flow and creates predictable voltage drops via Ohm’s law.',
      ceb: 'Komponent nga naglimite o nagpugong sa pag-agas sa kuryente ug nagpatunghag pagkunhod sa boltahe subay sa Batas ni Ohm.',
    },
    dcBehavior: {
      en: 'Pure resistive dissipation. Converts electrical energy into thermal heat energy according to Joule’s law (P = I²R).',
      ceb: 'Mokuha og kuryente ug mohimo niini og kainit subay sa $P = I^2 R$.',
    },
    acBehavior: {
      en: 'In-phase response: voltage and current waveforms peak simultaneously (phase angle θ = 0°, Power Factor = 1.0). Impedance Z = R + j0.',
      ceb: 'Dungan ang peak sa boltahe ug current (zero phase shift, Power Factor = 1.0).',
    },
    keyFormula: 'I = \\frac{V}{R}, \\quad P = V \\times I = I^2 R = \\frac{V^2}{R}',
    realWorldApplications: {
      en: 'LED current-limiting resistors, voltage dividers for sensors, audio volume pots, electric space heaters, toaster heating elements.',
      ceb: 'Proteksyon sa LED suga, voltage divider sa sensor, pampainit sa tubig o toaster.',
    },
    presets: [
      { label: '5 Ω', description: 'Low Resistance Load', properties: { resistance: 5 } },
      { label: '10 Ω', description: 'Standard Test Resistor', properties: { resistance: 10 } },
      { label: '100 Ω', description: 'Medium Load', properties: { resistance: 100 } },
      { label: '220 Ω', description: 'Typical LED Limiter', properties: { resistance: 220 } },
      { label: '1.0 kΩ', description: 'Signal Biasing Resistor', properties: { resistance: 1000 } },
      { label: '10 kΩ', description: 'Microcontroller Pull-up', properties: { resistance: 10000 } },
    ],
  },

  capacitor: {
    type: 'capacitor',
    title: {
      en: 'Electrostatic Capacitor',
      ceb: 'Capacitor (Tigtipig sa Electric Field)',
    },
    category: {
      en: 'Reactive Energy Storage',
      ceb: 'Reactive nga Tigtipig og Enerhiya',
    },
    symbolDesc: {
      en: 'Two parallel conductive plates separated by an insulating gap.',
      ceb: 'Duha ka magkatupad nga plato nga gibulag og dielectric gap.',
    },
    description: {
      en: 'Stores electrical energy in an electrostatic field between conductive plates separated by a dielectric insulator. Measured in Farads (usually microfarads µF).',
      ceb: 'Nagtipig og electrical potential energy sa electrostatic field sa tunga sa duha ka conductive plates.',
    },
    dcBehavior: {
      en: 'Blocks DC current in steady-state (acts as an open circuit, Xc = ∞). Charges up to source voltage, then current drops to 0.',
      ceb: 'Mobabag sa DC current sa steady-state (molihok sama sa bukas nga sirkito).',
    },
    acBehavior: {
      en: 'Passes AC current readily! Current leads voltage by 90°. Reactance decreases as frequency increases: Xc = 1 / (2π f C).',
      ceb: 'Makapaagi sa AC nga kuryente. Ang reactance mous-os kon motaas ang frequency: $X_C = 1 / (2\\pi f C)$.',
    },
    keyFormula: 'X_C = \\frac{1}{2\\pi f C}, \\quad Z_C = -j \\frac{1}{\\omega C}, \\quad E = \\frac{1}{2} C V^2',
    realWorldApplications: {
      en: 'Power supply DC smoothing filter, audio bass/treble tone filters, camera flash strobe discharge, motor run/start phase-shift.',
      ceb: 'Filter sa power supply aron hapsay ang DC, audio crossover sa speaker, flash sa camera.',
    },
    presets: [
      { label: '1.0 µF', description: 'Audio Coupling Filter', properties: { value: 0.000001 } },
      { label: '10 µF', description: 'Decoupling Capacitor', properties: { value: 0.00001 } },
      { label: '40 µF', description: 'AC Phase Shift / Filter', properties: { value: 0.00004 } },
      { label: '100 µF', description: 'Power Rail Smoother', properties: { value: 0.0001 } },
      { label: '470 µF', description: 'Heavy Bulk Smoothing', properties: { value: 0.00047 } },
    ],
  },

  inductor: {
    type: 'inductor',
    title: {
      en: 'Magnetic Inductor (Coil / Choke)',
      ceb: 'Inductor (Magnetic Coil / Choke)',
    },
    category: {
      en: 'Reactive Energy Storage',
      ceb: 'Reactive nga Tigtipig og Enerhiya',
    },
    symbolDesc: {
      en: 'Series of coiled magnetic loops.',
      ceb: 'Sunod-sunod nga nalukot nga alambre (coil).',
    },
    description: {
      en: 'Passive two-terminal electrical component that stores energy in a magnetic field when electric current flows through it. Opposes rapid changes in current.',
      ceb: 'Nagtigum og enerhiya sa magnetic field kung moagi ang kuryente. Mosukol sa kalit nga pag-usab sa agas sa kuryente.',
    },
    dcBehavior: {
      en: 'Acts as a direct SHORT circuit in steady-state DC (XL = 0 Ω, zero voltage drop across ideal inductor).',
      ceb: 'Sa steady-state DC, molihok sama sa mubo nga alambre o short circuit ($X_L = 0$).',
    },
    acBehavior: {
      en: 'Resists AC current! Current lags voltage by 90°. Reactance increases proportionally with frequency: XL = 2π f L.',
      ceb: 'Mosukol sa AC nga kuryente. Ang reactance motaas samtang motaas ang frequency: $X_L = 2\\pi f L$.',
    },
    keyFormula: 'X_L = 2\\pi f L, \\quad Z_L = +j \\omega L, \\quad E = \\frac{1}{2} L I^2',
    realWorldApplications: {
      en: 'Switch-mode buck/boost converters, radio RF tuners, fluorescent tube ballast chokes, motor windings, transformer coils.',
      ceb: 'Ballast sa fluorescent tube, coil sa transformer ug motor, filter sa kuryente batok sa spike.',
    },
    presets: [
      { label: '1.0 mH', description: 'High-Frequency RF Choke', properties: { value: 0.001 } },
      { label: '10 mH', description: 'Audio / Power Inductor', properties: { value: 0.01 } },
      { label: '50 mH', description: 'Medium Filter Inductor', properties: { value: 0.05 } },
      { label: '100 mH', description: 'Heavy Line Choke', properties: { value: 0.1 } },
      { label: '1.0 H', description: 'Iron-Core Power Reactor', properties: { value: 1.0 } },
    ],
  },

  switch: {
    type: 'switch',
    title: {
      en: 'Knife Switch (Circuit Breaker)',
      ceb: 'Switch sa Kuryente (Breaker)',
    },
    category: {
      en: 'Circuit Control Element',
      ceb: 'Gamit sa Pagkontrolar',
    },
    symbolDesc: {
      en: 'Hinged conductive knife blade lever connecting or disconnecting terminal contacts.',
      ceb: 'Alambre nga blade nga moabli o mosira taliwala sa duha ka terminal.',
    },
    description: {
      en: 'Mechanical switching mechanism that makes (closes) or breaks (opens) an electrical conducting loop, controlling current safely without altering wiring.',
      ceb: 'Mekanikal nga switch nga moabli o mosira sa sirkito aron makontrolar ang dagan sa kuryente nga luwas.',
    },
    dcBehavior: {
      en: 'Closed: ideal zero-resistance conductor (R = 0 Ω). Open: air gap with infinite resistance (R = ∞, I = 0 A).',
      ceb: 'Sirado: walay pagsukol (0 Ω). Bukas: walay kuryente nga makaagi ($R = \\infty, I = 0\\text{ A}$).',
    },
    acBehavior: {
      en: 'Same as DC. Safely interrupts AC sinusoidal cycle at contact separation.',
      ceb: 'Sama sa DC. Luwas nga moputol sa AC nga agianan.',
    },
    keyFormula: '\\text{Closed: } R = 0\\,\\Omega \\implies I = \\frac{V}{R_{\\text{load}}}, \\quad \\text{Open: } R = \\infty \\implies I = 0\\,\\text{A}',
    realWorldApplications: {
      en: 'Wall light switches, circuit breakers in distribution panels, emergency stop buttons, relays, toggle switches.',
      ceb: 'Switch sa suga sa balay, main circuit breaker sa panel, safety switch sa makina.',
    },
    presets: [
      { label: 'Closed (Conducting)', description: 'Allow current flow', properties: { closed: true } },
      { label: 'Open (Disconnected)', description: 'Interrupt circuit loop', properties: { closed: false } },
    ],
  },

  bulb: {
    type: 'bulb',
    title: {
      en: 'Incandescent Light Bulb',
      ceb: 'Bombilya (Incandescent Light Bulb)',
    },
    category: {
      en: 'Optical & Thermal Load',
      ceb: 'Karga sa Kahayag ug Kainit',
    },
    symbolDesc: {
      en: 'Glass envelope circle containing a glowing filament cross.',
      ceb: 'Lingin nga baso nga may nagsiga nga filament sa sulod.',
    },
    description: {
      en: 'Resistive electrical light source. Electric current heats a high-resistance tungsten filament to incandescence, producing warm visible light and heat.',
      ceb: 'Karga sa suga diin ang kuryente nagpainit sa tungsten filament hangtod nga kini mosiga ug mohatag og kahayag.',
    },
    dcBehavior: {
      en: 'Pure resistance (Z = R). Bulb filament glows brightly when sufficient current flows (> 5 mA).',
      ceb: 'Pulos resistance. Mosiga ang filament kung aduna nay igo nga kuryente nga moagi.',
    },
    acBehavior: {
      en: 'Operates identically on RMS AC voltage. Emits continuous light due to thermal inertia of the filament.',
      ceb: 'Parehas nga molihok sa RMS AC boltahe. Padayon ang siga tungod sa kainit sa filament.',
    },
    keyFormula: 'P = I^2 R = \\frac{V^2}{R}, \\quad \\text{Filament Glow} \\propto P',
    realWorldApplications: {
      en: 'Flashlight bulbs, room chandelier lighting, indicator lamps, incubator heaters.',
      ceb: 'Suga sa flashlight, suga sa kwarto o sala, indicator lamp sa kuryente.',
    },
    presets: [
      { label: '5.0 Ω (Flashlight)', description: 'Low voltage mini bulb', properties: { resistance: 5 } },
      { label: '15 Ω (Indicator)', description: 'Equipment pilot light', properties: { resistance: 15 } },
      { label: '60 Ω (40W Bulb)', description: 'Standard 40W equivalent', properties: { resistance: 60 } },
      { label: '120 Ω (60W Bulb)', description: 'Standard 60W residential bulb', properties: { resistance: 120 } },
      { label: '240 Ω (100W Bulb)', description: 'High brightness 100W bulb', properties: { resistance: 240 } },
    ],
  },

  appliance: {
    type: 'appliance',
    title: {
      en: 'AC Appliance Load (Motor / Device)',
      ceb: 'Karga sa Gamit sa Balay (Appliance)',
    },
    category: {
      en: 'Complex AC Load (Active + Reactive)',
      ceb: 'Kombinasyon nga AC Load',
    },
    symbolDesc: {
      en: 'Equipment chassis rectangle representing appliances with motors or transformers.',
      ceb: 'Kwadradong kagamitan nga naghulagway sa appliances nga may motor o transformer.',
    },
    description: {
      en: 'Models real-world domestic and commercial AC electrical loads (e.g. electric motors, compressors, power supplies) configured by rated wattage and power factor (cos θ).',
      ceb: 'Nagsundog sa mga gamit sa balay sama sa refrigerator, aircon, o bentilador base sa ilang rated wattage ug power factor.',
    },
    dcBehavior: {
      en: 'Not compatible with DC. Real motor appliances require AC sinusoidal voltage for alternating magnetic fields.',
      ceb: 'Dili compatible sa DC baterya. Nagkinahanglan og AC sinusoidal boltahe.',
    },
    acBehavior: {
      en: 'Consumes real active power (P = S cos θ) for mechanical work, and draws reactive power (Q) to magnetize coils.',
      ceb: 'Mokuha og tinuod nga power (P) para sa trabaho ug reactive power (Q) para sa magnetic field sa motor.',
    },
    keyFormula: 'S = \\frac{P}{\\cos\\theta}, \\quad Q = \\sqrt{S^2 - P^2}, \\quad |Z| = \\frac{V_{\\text{rated}}^2}{S}',
    realWorldApplications: {
      en: 'Desk fans (40W, PF 0.85), refrigerators (150W, PF 0.90), air conditioners (1200W, PF 0.95), washing machines, vacuum cleaners.',
      ceb: 'Bentilador (40W), refrigerator (150W), aircon (1200W), washing machine, vacuum.',
    },
    presets: [
      { label: '40 W Desk Fan (PF 0.85)', description: 'Small inductive fan motor', properties: { ratedVoltage: 120, ratedPower: 40, powerFactor: 0.85 } },
      { label: '100 W Refrigerator (PF 0.90)', description: 'Small compressor unit', properties: { ratedVoltage: 120, ratedPower: 100, powerFactor: 0.90 } },
      { label: '350 W Kitchen Blender (PF 0.80)', description: 'Universal electric motor', properties: { ratedVoltage: 120, ratedPower: 350, powerFactor: 0.80 } },
      { label: '800 W Microwave Oven (PF 0.95)', description: 'High-power magnetron load', properties: { ratedVoltage: 120, ratedPower: 800, powerFactor: 0.95 } },
      { label: '1500 W Air Conditioner (PF 0.98)', description: 'High efficiency inverter AC', properties: { ratedVoltage: 120, ratedPower: 1500, powerFactor: 0.98 } },
    ],
  },

  utilityBox: {
    type: 'utilityBox',
    title: {
      en: 'Utility Junction Box (Busbar)',
      ceb: 'Utility Junction Box (Busbar)',
    },
    category: {
      en: 'Distribution Element',
      ceb: 'Tig-apod-apod sa Linya',
    },
    symbolDesc: {
      en: 'Square junction enclosure with four shared connection terminal ports.',
      ceb: 'Kwadradong enclosure nga may upat ka terminal ports.',
    },
    description: {
      en: 'Electrical distribution junction enclosure containing common internal busbars. Joins multiple wires to create parallel branch connections neatly without cluttered overlapping.',
      ceb: 'Kahon sa kuryente nga nagsumpay sa daghang alambre aron hapsay ang paghimo og parallel nga mga sanga sa kuryente.',
    },
    dcBehavior: {
      en: 'Conducts seamlessly with zero internal resistance. Top terminals tie together; bottom terminals tie together.',
      ceb: 'Walay internal resistance. Ang ibabawng terminals nakakonektar; ang ubos nakakonektar usab.',
    },
    acBehavior: {
      en: 'Operates as an ideal low-impedance distribution node for AC hot and neutral conductors.',
      ceb: 'Nagsumpay sa linya sa hot ug neutral sa AC.',
    },
    keyFormula: 'V_{t1} = V_{t2}, \\quad V_{t3} = V_{t4}, \\quad \\sum I_{\\text{in}} = \\sum I_{\\text{out}}',
    realWorldApplications: {
      en: 'Ceiling electrical junction boxes, home breaker panel distribution bus, terminal strip blocks.',
      ceb: 'Junction box sa kisame, distribution busbar sa breaker panel sa balay.',
    },
    presets: [
      { label: 'Standard 4-Terminal Bus', description: 'Dual positive & negative terminals', properties: {} },
    ],
  },

  ground: {
    type: 'ground',
    title: {
      en: 'Earth Ground Reference',
      ceb: 'Ground (Yuta / 0V Reference)',
    },
    category: {
      en: 'Voltage Reference Node',
      ceb: 'Basehan sa Boltahe',
    },
    symbolDesc: {
      en: 'Vertical conductor descending into progressively shorter horizontal bars.',
      ceb: 'Patindog nga linya padulong sa nagkagamay nga mga pinahigda nga linya.',
    },
    description: {
      en: 'Designates the physical earth or zero-potential reference point (0.00 V) in electrical circuit diagrams, providing safety bonding and a common measurement baseline.',
      ceb: 'Nagtimaan sa zero-potential reference point (0.00 V) sa sirkito alang sa luwas nga pagsukod ug safety grounding.',
    },
    dcBehavior: {
      en: 'Defines 0V potential. Does not produce energy or force current flow on its own.',
      ceb: 'Nagtakda og 0V. Dili makahatag og kaugalingong kuryente.',
    },
    acBehavior: {
      en: 'Acts as safety earth ground and neutral grounding point at service entrances.',
      ceb: 'Nagsilbing safety ground sa electrical installations.',
    },
    keyFormula: 'V_{\\text{GND}} = 0.000\\,\\text{V}',
    realWorldApplications: {
      en: 'Grounding rods driven into earth, 3-prong electrical outlet safety pins, metal chassis shielding.',
      ceb: 'Grounding rod nga gilubong sa yuta, 3rd pin sa saksakan, metal chassis sa appliances.',
    },
    presets: [
      { label: '0V Earth Ground', description: 'System reference potential', properties: {} },
    ],
  },
};
