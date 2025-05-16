/**
 * Reference data for the Pathfinder 2e crafting calculator
 */

/**
 * Interface for income earned per day based on level and proficiency
 */
export interface IncomeData {
  level: number;
  dc: number;
  trained: number;
  expert: number;
  master: number;
  legendary: number;
}

/**
 * Table of DCs by level
 * Based on Table 10–5: DCs by Level from the Core Rulebook
 */
export const DCS_BY_LEVEL: { [key: number]: number } = {
  0: 14,
  1: 15,
  2: 16,
  3: 18,
  4: 19,
  5: 20,
  6: 22,
  7: 23,
  8: 24,
  9: 26,
  10: 27,
  11: 28,
  12: 30,
  13: 31,
  14: 32,
  15: 34,
  16: 35,
  17: 36,
  18: 38,
  19: 39,
  20: 40,
};

/**
 * DC adjustments for rarity
 * Based on Table 10–6: DC Adjustments from the Core Rulebook
 */
export const RARITY_DC_ADJUSTMENTS: { [key: string]: number } = {
  common: 0,
  uncommon: 2,
  rare: 5,
  unique: 10,
};

/**
 * Income earned per day based on level and proficiency
 * Used to calculate the cost reduction per day when crafting
 * Based on Table 4–2: Income Earned from the Core Rulebook
 */
export const INCOME_EARNED: IncomeData[] = [
  { level: 0, dc: 14, trained: 5, expert: 5, master: 5, legendary: 5 },          // All in copper
  { level: 1, dc: 15, trained: 20, expert: 20, master: 20, legendary: 20 },      // All in silver
  { level: 2, dc: 16, trained: 30, expert: 30, master: 30, legendary: 30 },      // All in silver
  { level: 3, dc: 18, trained: 50, expert: 50, master: 50, legendary: 50 },      // All in silver
  { level: 4, dc: 19, trained: 70, expert: 80, master: 80, legendary: 80 },      // All in silver
  { level: 5, dc: 20, trained: 90, expert: 100, master: 100, legendary: 100 },   // Silver/Gold
  { level: 6, dc: 22, trained: 150, expert: 200, master: 200, legendary: 200 },  // All in silver/gold
  { level: 7, dc: 23, trained: 200, expert: 250, master: 250, legendary: 250 },  // All in silver/gold
  { level: 8, dc: 24, trained: 250, expert: 300, master: 300, legendary: 300 },  // All in silver/gold
  { level: 9, dc: 26, trained: 300, expert: 400, master: 400, legendary: 400 },  // All in silver/gold
  { level: 10, dc: 27, trained: 400, expert: 500, master: 600, legendary: 600 }, // All in silver/gold
  { level: 11, dc: 28, trained: 500, expert: 600, master: 800, legendary: 800 }, // All in silver/gold
  { level: 12, dc: 30, trained: 600, expert: 800, master: 1000, legendary: 1000 }, // All in silver/gold
  { level: 13, dc: 31, trained: 700, expert: 1000, master: 1500, legendary: 1500 }, // All in silver/gold
  { level: 14, dc: 32, trained: 800, expert: 1500, master: 2000, legendary: 2000 }, // All in silver/gold
  { level: 15, dc: 34, trained: 1000, expert: 2000, master: 2800, legendary: 2800 }, // All in silver/gold
  { level: 16, dc: 35, trained: 1300, expert: 2500, master: 3600, legendary: 4000 }, // All in silver/gold
  { level: 17, dc: 36, trained: 1500, expert: 3000, master: 4500, legendary: 5500 }, // All in silver/gold
  { level: 18, dc: 38, trained: 2000, expert: 4500, master: 7000, legendary: 9000 }, // All in silver/gold
  { level: 19, dc: 39, trained: 3000, expert: 6000, master: 10000, legendary: 13000 }, // All in silver/gold
  { level: 20, dc: 40, trained: 4000, expert: 7500, master: 15000, legendary: 20000 }, // All in silver/gold
  // Critical success values for level 20
  { level: 20.5, dc: 40, trained: 5000, expert: 9000, master: 17500, legendary: 30000 }, // All in silver/gold
];

/**
 * Required feats for crafting different categories of items
 */
export const CRAFTING_FEAT_REQUIREMENTS: { [key: string]: string[] } = {
  // Magical items
  armor: ["Magical Crafting"],
  equipment: ["Magical Crafting"],
  shield: ["Magical Crafting"],
  weapon: ["Magical Crafting"],
  wand: ["Magical Crafting"],
  staff: ["Magical Crafting"],
  ring: ["Magical Crafting"],
  "worn-item": ["Magical Crafting"],
  rune: ["Magical Crafting"],
  // Alchemical items
  alchemical: ["Alchemical Crafting"],
  elixir: ["Alchemical Crafting"],
  bomb: ["Alchemical Crafting"],
  mutagen: ["Alchemical Crafting"],
  poison: ["Alchemical Crafting"],
  // Snares
  snare: ["Snare Crafting"],
  trap: ["Snare Crafting"],
  // Special categories
  scroll: ["Scroll Crafting", "Magical Crafting"],
  "magic-tattoo": ["Magical Tattoo", "Magical Crafting"],
};

/**
 * Minimum proficiency requirements for crafting items of certain levels
 */
export const PROFICIENCY_REQUIREMENTS: { [key: string]: number } = {
  untrained: 0,
  trained: 8,
  expert: 15,
  master: 20,  // Core rules specify level 9+, but this simplifies the logic
  legendary: 100, // Set very high to handle exceptional cases
};

/**
 * Setup time in days for complex crafting based on item level relative to character level
 */
export const COMPLEX_CRAFTING_SETUP_TIME: { [key: string]: { consumable: number; permanent: number } } = {
  equal: { consumable: 4, permanent: 6 },
  "1-2below": { consumable: 3, permanent: 5 },
  "3+below": { consumable: 2, permanent: 4 },
};

/**
 * Rush time reductions allowed based on proficiency
 */
export const RUSH_REDUCTIONS: { [key: string]: { days: number; dcIncrease: number } } = {
  trained: { days: 0, dcIncrease: 0 },
  expert: { days: 1, dcIncrease: 5 },
  master: { days: 2, dcIncrease: 10 },
  legendary: { days: 3, dcIncrease: 15 },
}; 