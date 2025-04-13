// File will be created

import { TREASURE_BY_LEVEL, TreasureBudget } from './treasure-by-level.js';

/**
 * Class for generating Pathfinder 2e treasure based on party level and size
 */
export default class TreasureGenerator {
  /**
   * Parse a natural language prompt to extract party level, size, and campaign type
   * @param {string} prompt - A natural language description of the party and context
   * @returns {object} Extracted parameters for treasure generation
   */
  private static parsePrompt(prompt: string): {
    partyLevel: number;
    partySize: number;
    isSandbox: boolean;
  } {
    const promptLower = prompt.toLowerCase();
    
    // Extract party level
    let partyLevel = 1;
    const levelMatch = promptLower.match(/level\s+(\d+)/i) || 
                      promptLower.match(/lvl\s+(\d+)/i) ||
                      promptLower.match(/(\d+)(st|nd|rd|th)\s+level/i);
    
    if (levelMatch) {
      partyLevel = parseInt(levelMatch[1], 10);
      // Ensure level is within valid range
      partyLevel = Math.max(1, Math.min(20, partyLevel));
    }
    
    // Extract party size
    let partySize = 4; // Default party size
    const sizeMatch = promptLower.match(/party\s+of\s+(\d+)/i) ||
                     promptLower.match(/(\d+)\s+players/i) ||
                     promptLower.match(/(\d+)\s+characters/i) ||
                     promptLower.match(/(\d+)\s+pc/i);
                     
    if (sizeMatch) {
      partySize = parseInt(sizeMatch[1], 10);
      // Ensure reasonable party size
      partySize = Math.max(1, Math.min(8, partySize));
    }
    
    // Determine if this is a sandbox campaign
    const isSandbox = promptLower.includes('sandbox') ||
                     promptLower.includes('megadungeon') ||
                     promptLower.includes('open world');
    
    return { partyLevel, partySize, isSandbox };
  }
  
  /**
   * Calculate treasure budget for a party
   * @param {number} partyLevel - The level of the party
   * @param {number} partySize - The number of players in the party
   * @param {boolean} isSandbox - Whether this is a sandbox campaign (adds extra treasure)
   * @returns {TreasureBudget|null} The adjusted treasure budget for the party
   */
  public static calculateTreasureBudget(
    partyLevel: number,
    partySize: number = 4,
    isSandbox: boolean = false
  ): TreasureBudget | null {
    // Find the base treasure budget for the party level
    const baseBudget = TREASURE_BY_LEVEL.find((budget: TreasureBudget) => budget.level === partyLevel);
    
    if (!baseBudget) {
      return null;
    }
    
    // Adjust for party size
    const sizeAdjustment = partySize - 4;
    const adjustedCurrency = 
      baseBudget.partyCurrency + (sizeAdjustment * baseBudget.currencyPerAdditionalPC);
    
    // Adjust for sandbox/megadungeon if applicable (add treasure as if one additional player)
    const sandboxAdjustment = isSandbox ? baseBudget.currencyPerAdditionalPC : 0;
    
    // Adjust permanent and consumable items based on party size
    let adjustedPermanentItems = [...baseBudget.permanentItems];
    let adjustedConsumables = [...baseBudget.consumables];
    
    // For parties different from the standard 4-player party
    if (partySize !== 4) {
      // Calculate the scaling factor based on party size ratio
      const scalingFactor = partySize / 4;
      
      // Only adjust quantities for significant party size differences
      if (scalingFactor <= 0.75 || scalingFactor >= 1.25) {
        // Adjust permanent items
        adjustedPermanentItems = adjustedPermanentItems.map(item => {
          // Calculate new quantity based on scaling factor, ensuring minimum of 1
          const newQuantity = Math.max(1, Math.round(item.quantity * scalingFactor));
          return { ...item, quantity: newQuantity };
        });
        
        // Adjust consumable items
        adjustedConsumables = adjustedConsumables.map(item => {
          // Calculate new quantity based on scaling factor, ensuring minimum of 1
          const newQuantity = Math.max(1, Math.round(item.quantity * scalingFactor));
          return { ...item, quantity: newQuantity };
        });
      }
    }
    
    // For sandbox games, add more items as needed
    if (isSandbox) {
      // For sandbox games, increase key consumables by 1
      adjustedConsumables = adjustedConsumables.map((item, index) => {
        // Add extra consumables primarily for higher level items (first entries in the array)
        if (index < 2) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    }
    
    // Return the adjusted budget
    return {
      ...baseBudget,
      permanentItems: adjustedPermanentItems,
      consumables: adjustedConsumables,
      partyCurrency: adjustedCurrency + sandboxAdjustment,
    };
  }
  
  /**
   * Format the treasure budget into a readable string
   * @param {TreasureBudget} budget - The treasure budget to format
   * @param {object} context - Additional context about the prompt
   * @param {number} context.partyLevel - The level of the party
   * @param {number} context.partySize - The number of players in the party
   * @param {boolean} context.isSandbox - Whether this is a sandbox campaign
   * @returns {string} A formatted string describing the treasure
   */
  public static formatTreasureBudget(budget: TreasureBudget, context: {
    partyLevel: number;
    partySize: number;
    isSandbox: boolean;
  }): string {
    if (!budget) {
      return "Could not generate a treasure budget for the specified parameters.";
    }
    
    // Format permanent items
    const permanentItemsText = budget.permanentItems.map(item => 
      `${item.quantity}× level ${item.level} items`
    ).join(', ');
    
    // Format consumable items
    const consumablesText = budget.consumables.map(item => 
      `${item.quantity}× level ${item.level} items`
    ).join(', ');
    
    // Create a formatted response
    let response = `# Treasure Budget for Level ${context.partyLevel} Party (${context.partySize} Players)

## Total Value
${budget.totalValue} gold pieces${context.isSandbox ? ' (increased for sandbox campaign)' : ''}

## Permanent Items
${permanentItemsText}

## Consumable Items
${consumablesText}

## Currency
${budget.partyCurrency} gold pieces

## Distribution Guidelines
- This treasure should be distributed throughout a level's worth of adventures
- Approximately 50% of permanent items should be "core items" that enhance main abilities
- The remaining 50% should be "unusual items" with more situational powers
- For campaigns with limited access to item shops, increase core items to 75%
- For campaigns with no access to item shops, all items should be core items

## Item Types to Consider
**Permanent Items**: Weapons, armor, wands, staves, worn items with permanent bonuses
**Consumables**: Potions, scrolls, talismans, wands with limited charges`;

    return response;
  }
  
  /**
   * Generate a treasure budget based on a natural language prompt
   * @param {string} prompt - A description of the party and situation
   * @returns {string} A formatted treasure budget
   */
  public static generateTreasureBudget(prompt: string): string {
    // Extract parameters from the prompt
    const params = this.parsePrompt(prompt);
    
    // Calculate the treasure budget
    const budget = this.calculateTreasureBudget(
      params.partyLevel,
      params.partySize,
      params.isSandbox
    );
    
    if (!budget) {
      return `Could not generate a treasure budget for a level ${params.partyLevel} party. Please ensure the level is between 1 and 20.`;
    }
    
    // Format the budget into a readable response
    return this.formatTreasureBudget(budget, params);
  }
}
