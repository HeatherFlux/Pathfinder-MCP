/**
 * PATHFINDER 2E TREASURE GENERATION RULES
 * 
 * This file contains utilities for generating appropriate treasure
 * for Pathfinder 2nd Edition adventures based on official rules.
 * 
 * ===============================================================
 * TREASURE DISTRIBUTION PHILOSOPHY
 * ===============================================================
 * 
 * Treasure in Pathfinder 2e follows these key principles:
 * 
 * 1. LEVEL-BASED ALLOCATION
 *    - Treasure is allocated based on character level, not per encounter
 *    - Each level has a specific treasure budget detailed in Table 10-9
 *    - Treasure should be spread throughout adventures rather than in single hoards
 * 
 * 2. TREASURE COMPOSITION
 *    - Permanent items: Equipment kept and used long-term (weapons, armor, etc.)
 *    - Consumable items: Single-use items (potions, scrolls, etc.)
 *    - Currency: Coins, gems, art objects, and other valuables
 * 
 * 3. POWER PROGRESSION
 *    - Items found on adventures are typically 1 level higher than what PCs can craft
 *    - PCs should get items that let them temporarily outpace monsters/challenges
 *    - Challenge difficulty gradually catches up before next treasure
 * 
 * 4. CORE vs. UNUSUAL ITEMS
 *    - "Core items" directly enhance a PC's main abilities
 *    - "Unusual items" provide situational or specialized powers
 *    - Balance depends on campaign's access to item purchasing/crafting
 * 
 * ===============================================================
 * PARTY TREASURE BY LEVEL (TABLE 10-9)
 * ===============================================================
 * 
 * Level | Total Value | Permanent Items (By Item Level) | Consumables (By Item Level) | Party Currency | Currency per Add'l PC
 * -----|-------------|--------------------------------|---------------------------|---------------|---------------------
 * 1    | 175 gp      | 2nd: 2, 1st: 2                | 2nd: 2, 1st: 3            | 40 gp         | 10 gp
 * 2    | 300 gp      | 3rd: 2, 2nd: 2                | 3rd: 2, 2nd: 2, 1st: 2    | 70 gp         | 18 gp
 * 3    | 500 gp      | 4th: 2, 3rd: 2                | 4th: 2, 3rd: 2, 2nd: 2    | 120 gp        | 30 gp
 * 4    | 850 gp      | 5th: 2, 4th: 2                | 5th: 2, 4th: 2, 3rd: 2    | 200 gp        | 50 gp
 * 5    | 1,350 gp    | 6th: 2, 5th: 2                | 6th: 2, 5th: 2, 4th: 2    | 320 gp        | 80 gp
 * 6    | 2,000 gp    | 7th: 2, 6th: 2                | 7th: 2, 6th: 2, 5th: 2    | 500 gp        | 125 gp
 * 7    | 2,900 gp    | 8th: 2, 7th: 2                | 8th: 2, 7th: 2, 6th: 2    | 720 gp        | 180 gp
 * 8    | 4,000 gp    | 9th: 2, 8th: 2                | 9th: 2, 8th: 2, 7th: 2    | 1,000 gp      | 250 gp
 * 9    | 5,700 gp    | 10th: 2, 9th: 2               | 10th: 2, 9th: 2, 8th: 2   | 1,400 gp      | 350 gp
 * 10   | 8,000 gp    | 11th: 2, 10th: 2              | 11th: 2, 10th: 2, 9th: 2  | 2,000 gp      | 500 gp
 * 11   | 11,500 gp   | 12th: 2, 11th: 2              | 12th: 2, 11th: 2, 10th: 2 | 2,800 gp      | 700 gp
 * 12   | 16,500 gp   | 13th: 2, 12th: 2              | 13th: 2, 12th: 2, 11th: 2 | 4,000 gp      | 1,000 gp
 * 13   | 25,000 gp   | 14th: 2, 13th: 2              | 14th: 2, 13th: 2, 12th: 2 | 6,000 gp      | 1,500 gp
 * 14   | 36,500 gp   | 15th: 2, 14th: 2              | 15th: 2, 14th: 2, 13th: 2 | 9,000 gp      | 2,250 gp
 * 15   | 54,500 gp   | 16th: 2, 15th: 2              | 16th: 2, 15th: 2, 14th: 2 | 13,000 gp     | 3,250 gp
 * 16   | 82,500 gp   | 17th: 2, 16th: 2              | 17th: 2, 16th: 2, 15th: 2 | 20,000 gp     | 5,000 gp
 * 17   | 128,000 gp  | 18th: 2, 17th: 2              | 18th: 2, 17th: 2, 16th: 2 | 30,000 gp     | 7,500 gp
 * 18   | 208,000 gp  | 19th: 2, 18th: 2              | 19th: 2, 18th: 2, 17th: 2 | 48,000 gp     | 12,000 gp
 * 19   | 355,000 gp  | 20th: 2, 19th: 2              | 20th: 2, 19th: 2, 18th: 2 | 80,000 gp     | 20,000 gp
 * 20   | 490,000 gp  | 20th: 4                       | 20th: 4, 19th: 2          | 140,000 gp    | 35,000 gp
 * 
 * ===============================================================
 * ADJUSTING FOR DIFFERENT PARTY SIZES
 * ===============================================================
 * 
 * - The table assumes a party of 4 PCs
 * - For larger parties, add the "Currency per Additional PC" amount for each PC beyond 4
 * - For smaller parties, subtract the same amount for each PC fewer than 4
 * - Consider adjusting the number of permanent/consumable items as well
 * 
 * ===============================================================
 * TREASURE BY ENCOUNTER (ALTERNATIVE APPROACH)
 * ===============================================================
 * 
 * For sandbox games or megadungeons where treasure is assigned per encounter:
 * 
 * - Use "Treasure by Encounter" guidelines from Treasure Vault (pg. 171)
 * - Divides treasure budget based on encounter threat level (Low/Moderate/Severe/Extreme)
 * - Increase overall treasure when using this method (as parties may miss some encounters)
 * - Add treasure as if there were one additional PC in the party
 * 
 * ===============================================================
 * SPECIAL CAMPAIGN CONSIDERATIONS
 * ===============================================================
 * 
 * 1. LIMITED ITEM ACCESS:
 *    - If item shops/purchasing is limited, increase core items to 75% of permanent items
 *    - If no item shops exist, all permanent items should be core items
 *    - Consider Automatic Bonus Progression rules for no-magic-shop campaigns
 * 
 * 2. MEGADUNGEONS & SANDBOXES:
 *    - Increase treasure as if there were one additional PC in the party
 *    - Further increase for especially loose structures
 * 
 * 3. ADVENTURES FAR FROM CIVILIZATION:
 *    - If party can't purchase/craft items for long periods, add more useful equipment
 *    - Include NPCs willing to trade with the party
 * 
 * ===============================================================
 * CORE ITEMS VS. UNUSUAL ITEMS
 * ===============================================================
 * 
 * CORE ITEMS directly enhance a PC's main abilities:
 * - Weapons with fundamental runes (+1 striking, etc.)
 * - Armor with fundamental runes (+1 resilient, etc.)
 * - Items that enhance key skills or class features
 * 
 * UNUSUAL ITEMS provide situational or specialized powers:
 * - Weapons with property runes (flaming, etc.)
 * - Armor with property runes (energy-resistant, etc.)
 * - Wondrous items with specific powers
 * 
 * BALANCE OF CORE TO UNUSUAL ITEMS:
 * - If item shops are readily available: 50% core items
 * - If item shops are limited: 75% core items
 * - If no item shops: 100% core items
 * 
 * ===============================================================
 * RANDOM TREASURE GENERATION
 * ===============================================================
 * 
 * When generating random treasure:
 * 1. Determine total treasure value based on party level
 * 2. Allocate appropriate permanent items, consumables, and currency
 * 3. Select items appropriate to party composition (useful to at least one PC)
 * 4. Balance core and unusual items based on campaign access to item shops
 * 5. Distribute treasure across multiple encounters rather than single hoards
 */

import { AonCategory } from '../config/config.js';
import { AonItem } from '../config/types.js';

/**
 * Interface representing treasure budget for a specific level
 */
export interface TreasureBudget {
  level: number;
  totalValue: number;
  permanentItems: { level: number; quantity: number }[];
  consumables: { level: number; quantity: number }[];
  partyCurrency: number;
  currencyPerAdditionalPC: number;
}

/**
 * Treasure budgets by character level for a party of 4 PCs
 * Based on Table 10-9: Party Treasure by Level from the Core Rulebook
 */
export const TREASURE_BY_LEVEL: TreasureBudget[] = [
  {
    level: 1,
    totalValue: 175,
    permanentItems: [
      { level: 2, quantity: 2 },
      { level: 1, quantity: 2 }
    ],
    consumables: [
      { level: 2, quantity: 2 },
      { level: 1, quantity: 3 }
    ],
    partyCurrency: 40,
    currencyPerAdditionalPC: 10
  },
  {
    level: 2,
    totalValue: 300,
    permanentItems: [
      { level: 3, quantity: 2 },
      { level: 2, quantity: 2 }
    ],
    consumables: [
      { level: 3, quantity: 2 },
      { level: 2, quantity: 2 },
      { level: 1, quantity: 2 }
    ],
    partyCurrency: 70,
    currencyPerAdditionalPC: 18
  },
  // Add remaining levels as needed
];

/**
 * Calculate treasure budget for a party
 * @param partyLevel The level of the party
 * @param partySize The number of players in the party
 * @param isSandbox Whether this is a sandbox campaign (adds extra treasure)
 * @returns The adjusted treasure budget for the party
 */
export function calculateTreasureBudget(
  partyLevel: number,
  partySize: number = 4,
  isSandbox: boolean = false
): TreasureBudget | null {
  // Find the base treasure budget for the party level
  const baseBudget = TREASURE_BY_LEVEL.find(budget => budget.level === partyLevel);
  
  if (!baseBudget) {
    return null;
  }
  
  // Adjust for party size
  const sizeAdjustment = partySize - 4;
  const adjustedCurrency = 
    baseBudget.partyCurrency + (sizeAdjustment * baseBudget.currencyPerAdditionalPC);
  
  // Adjust for sandbox/megadungeon if applicable
  const effectivePartySize = isSandbox ? partySize + 1 : partySize;
  const sandboxAdjustment = isSandbox ? baseBudget.currencyPerAdditionalPC : 0;
  
  // Return the adjusted budget
  return {
    ...baseBudget,
    partyCurrency: adjustedCurrency + sandboxAdjustment,
  };
}

/**
 * Types of treasure that can be generated
 */
export enum TreasureType {
  PERMANENT_ITEM = 'permanent',
  CONSUMABLE = 'consumable',
  CURRENCY = 'currency'
}

/**
 * Function stub for generating random treasure
 * This would be expanded in a full implementation
 */
export function generateRandomTreasure(
  partyLevel: number,
  partySize: number = 4,
  isSandbox: boolean = false
): string {
  // Actual implementation would use the treasure generation rules
  // and return appropriate items, consumables, and currency
  return `Random treasure for level ${partyLevel} party of ${partySize} characters`;
}

/**
 * Utility class that would hold the actual treasure generation logic
 * in a full implementation
 */
export class TreasureGenerator {
  /**
   * Generates appropriate treasure for an adventure
   * @param partyLevel The level of the party
   * @param partySize The number of players in the party
   * @param isSandbox Whether this is a sandbox campaign
   * @returns A description of the generated treasure
   */
  static generateAdventureTreasure(
    partyLevel: number,
    partySize: number = 4,
    isSandbox: boolean = false
  ): string {
    // This would contain the actual implementation
    return `Adventure treasure for level ${partyLevel} party of ${partySize} characters`;
  }
}

export default TreasureGenerator; 