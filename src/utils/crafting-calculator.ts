import { AonItem } from "../config/types.js";
import { 
  DCS_BY_LEVEL, 
  RARITY_DC_ADJUSTMENTS, 
  INCOME_EARNED, 
  CRAFTING_FEAT_REQUIREMENTS,
  COMPLEX_CRAFTING_SETUP_TIME,
  RUSH_REDUCTIONS
} from './crafting-data.js';

/**
 * Interface for crafting options
 */
export interface CraftingOptions {
  characterLevel: number;
  proficiency: string;
  feats: string[];
  useComplexCrafting: boolean;
  rushDays: number;
}

/**
 * Interface for crafting requirements result
 */
export interface CraftingRequirements {
  item: {
    name: string;
    level: number;
    price: number;
    rarity: string;
    category: string;
    isConsumable: boolean;
    url?: string;
  };
  prerequisites: {
    meetsLevelRequirement: boolean;
    meetsProficiencyRequirement: boolean;
    requiredFeats: string[];
    hasRequiredFeats: boolean;
    missingFeats: string[];
  };
  crafting: {
    initialDays: number;
    materialCost: number;
    dc: number;
    dailyReduction: number;
    criticalDailyReduction: number;
    daysToFree: number;
    criticalDaysToFree: number;
    rushPenalty: number;
  };
  success: {
    critical: string;
    success: string;
    failure: string;
    criticalFailure: string;
  };
}

/**
 * Class for calculating Pathfinder 2e crafting requirements
 */
export default class CraftingCalculator {
  /**
   * Calculate crafting requirements for an item
   * @param {AonItem} item - The item to be crafted
   * @param {CraftingOptions} options - Crafting options
   * @returns {CraftingRequirements} Complete crafting requirements
   * @throws {Error} If item is null or undefined
   */
  public static calculateRequirements(
    item: AonItem,
    options: CraftingOptions
  ): CraftingRequirements {
    if (!item) {
      throw new Error("Item is required for calculation");
    }
    
    // Extract item data with proper typing
    const itemLevel: number = typeof item.level === 'number' ? item.level : 0;
    const itemPrice: number = this.parsePrice(item.price);
    const itemRarity: string = this.determineRarity(item);
    const isConsumable: boolean = this.isConsumable(item);
    const category: string = typeof item.category === 'string' ? item.category : "equipment";
    
    // Check prerequisites
    const characterLevel: number = options.characterLevel;
    const meetsLevelRequirement: boolean = characterLevel >= itemLevel;
    const meetsProficiencyRequirement: boolean = this.checkProficiencyRequirement(itemLevel, options.proficiency);
    const requiredFeats: string[] = this.determineRequiredFeats(category);
    const hasRequiredFeats: boolean = this.checkFeats(requiredFeats, options.feats);
    
    // Calculate crafting time
    const initialDays: number = this.calculateCraftingTime(
      itemLevel, 
      characterLevel,
      options.useComplexCrafting,
      isConsumable,
      options.rushDays,
      options.proficiency
    );
    
    // Calculate DC and adjustments
    const baseDC: number = this.calculateDC(itemLevel, itemRarity);
    const adjustedDC: number = this.adjustDC(baseDC, options.rushDays, options.proficiency);
    
    // Calculate materials and costs
    const materialCost: number = itemPrice / 2;
    
    // Calculate daily cost reduction by proficiency and level
    const dailyReduction: number = this.calculateDailyReduction(characterLevel, options.proficiency);
    const criticalDailyReduction: number = this.calculateDailyReduction(characterLevel + 1, options.proficiency);
    
    // Days to craft for free calculation
    const daysToFree: number = materialCost > 0 ? Math.ceil(materialCost / dailyReduction) : 0;
    const criticalDaysToFree: number = materialCost > 0 ? Math.ceil(materialCost / criticalDailyReduction) : 0;
    
    return {
      item: {
        name: item.name || "Unknown Item",
        level: itemLevel,
        price: itemPrice,
        rarity: itemRarity,
        category: category,
        isConsumable: isConsumable,
        url: item.url
      },
      prerequisites: {
        meetsLevelRequirement,
        meetsProficiencyRequirement,
        requiredFeats,
        hasRequiredFeats,
        missingFeats: requiredFeats.filter(feat => !options.feats.includes(feat))
      },
      crafting: {
        initialDays,
        materialCost,
        dc: adjustedDC,
        dailyReduction,
        criticalDailyReduction,
        daysToFree,
        criticalDaysToFree,
        rushPenalty: options.rushDays > 0 ? this.getRushPenalty(options.proficiency, options.rushDays) : 0
      },
      success: {
        critical: `Complete with ${materialCost} gp of materials, plus additional ${criticalDaysToFree} days to finish for free`,
        success: `Complete with ${materialCost} gp of materials, plus additional ${daysToFree} days to finish for free`,
        failure: `Fail to complete, but can recover all materials`,
        criticalFailure: `Fail to complete and lose ${Math.ceil(materialCost * 0.1)} gp worth of materials`
      }
    };
  }

  /**
   * Parse the price string or number to a numeric value in gold pieces
   * @param {string|number} price - The price to parse
   * @returns {number} The price in gold pieces
   */
  private static parsePrice(price: string | number | undefined): number {
    if (price === undefined) return 0;
    
    if (typeof price === 'number') {
      return price;
    }
    
    // Handle price strings like "12 gp" or "3 sp"
    const match = price.toString().match(/(\d+(\.\d+)?)\s*(cp|sp|gp)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[3].toLowerCase();
      
      if (unit === 'cp') return value / 100;
      if (unit === 'sp') return value / 10;
      return value; // gp
    }
    
    // Try to just parse any numeric part
    const numericMatch = price.toString().match(/(\d+(\.\d+)?)/);
    if (numericMatch) {
      return parseFloat(numericMatch[1]);
    }
    
    return 0;
  }

  /**
   * Determine if an item is consumable
   * @param {AonItem} item - The item to check
   * @returns {boolean} Whether the item is consumable
   */
  private static isConsumable(item: AonItem): boolean {
    if (!item) return false;
    
    // Check traits array if it exists
    if (item.traits && Array.isArray(item.traits)) {
      return item.traits.includes('consumable');
    }
    
    // Check based on category
    const consumableCategories = [
      'potion', 'scroll', 'talisman', 'oil', 'elixir', 
      'bomb', 'ammunition', 'snare', 'poison', 'consumable'
    ];
    
    const category = typeof item.category === 'string' ? item.category.toLowerCase() : '';
    return consumableCategories.includes(category);
  }

  /**
   * Determine the rarity of an item
   * @param {AonItem} item - The item to check
   * @returns {string} The rarity of the item
   */
  private static determineRarity(item: AonItem): string {
    if (!item) return 'common';
    
    // Check traits array if it exists
    if (item.traits && Array.isArray(item.traits)) {
      if (item.traits.includes('rare')) return 'rare';
      if (item.traits.includes('uncommon')) return 'uncommon';
      if (item.traits.includes('unique')) return 'unique';
    }
    
    return 'common';
  }

  /**
   * Check if the proficiency is sufficient for crafting an item of the given level
   * @param {number} itemLevel - The level of the item
   * @param {string} proficiency - The crafter's proficiency level
   * @returns {boolean} Whether the proficiency is sufficient
   */
  private static checkProficiencyRequirement(itemLevel: number, proficiency: string): boolean {
    if (itemLevel >= 16 && proficiency !== 'legendary') return false;
    if (itemLevel >= 9 && !['master', 'legendary'].includes(proficiency)) return false;
    return true;
  }

  /**
   * Determine the feats required to craft an item of the given category
   * @param {string} category - The category of the item
   * @returns {string[]} The required feats
   */
  private static determineRequiredFeats(category: string): string[] {
    if (!category) return [];
    
    const lowerCategory = category.toLowerCase();
    
    // Check for direct category match
    if (CRAFTING_FEAT_REQUIREMENTS[lowerCategory]) {
      return CRAFTING_FEAT_REQUIREMENTS[lowerCategory];
    }
    
    // Check for partial category matches
    for (const [categoryKey, feats] of Object.entries(CRAFTING_FEAT_REQUIREMENTS)) {
      if (lowerCategory.includes(categoryKey)) {
        return feats;
      }
    }
    
    // Default to magical crafting for most items
    return ["Magical Crafting"];
  }

  /**
   * Check if the crafter has all required feats
   * @param {string[]} requiredFeats - The feats required for crafting
   * @param {string[]} characterFeats - The feats the character has
   * @returns {boolean} Whether the character has all required feats
   */
  private static checkFeats(requiredFeats: string[], characterFeats: string[]): boolean {
    if (requiredFeats.length === 0) return true;
    return requiredFeats.every(feat => characterFeats.includes(feat));
  }

  /**
   * Calculate the time needed to craft an item
   * @param {number} itemLevel - The level of the item
   * @param {number} characterLevel - The level of the character
   * @param {boolean} useComplexCrafting - Whether to use complex crafting rules
   * @param {boolean} isConsumable - Whether the item is consumable
   * @param {number} rushDays - The number of days to rush
   * @param {string} proficiency - The crafter's proficiency level
   * @returns {number} The number of days needed for the initial crafting
   */
  private static calculateCraftingTime(
    itemLevel: number,
    characterLevel: number,
    useComplexCrafting: boolean,
    isConsumable: boolean,
    rushDays: number,
    proficiency: string
  ): number {
    // Base crafting time is 4 days in standard rules
    if (!useComplexCrafting) return Math.max(1, 4 - rushDays);
    
    // For complex crafting, determine time based on level difference
    let levelDiffKey: string;
    if (itemLevel >= characterLevel) {
      levelDiffKey = 'equal';
    } else if (characterLevel - itemLevel <= 2) {
      levelDiffKey = '1-2below';
    } else {
      levelDiffKey = '3+below';
    }
    
    const baseTime = isConsumable 
      ? COMPLEX_CRAFTING_SETUP_TIME[levelDiffKey].consumable 
      : COMPLEX_CRAFTING_SETUP_TIME[levelDiffKey].permanent;
    
    // Apply rush reduction if applicable
    let reducedTime = baseTime;
    if (rushDays > 0) {
      const maxReduction = RUSH_REDUCTIONS[proficiency]?.days || 0;
      reducedTime = baseTime - Math.min(rushDays, maxReduction);
      
      // Special case: if rushing would reduce a consumable to 0 days or less, it takes 4 hours instead
      if (isConsumable && reducedTime <= 0) {
        return 0.5; // Represent 4 hours as half a day
      }
    }
    
    return reducedTime;
  }

  /**
   * Calculate the DC for crafting an item
   * @param {number} itemLevel - The level of the item
   * @param {string} rarity - The rarity of the item
   * @returns {number} The DC for the crafting check
   */
  private static calculateDC(itemLevel: number, rarity: string): number {
    const baseDC = DCS_BY_LEVEL[itemLevel] || 14;
    const rarityAdjustment = RARITY_DC_ADJUSTMENTS[rarity.toLowerCase()] || 0;
    return baseDC + rarityAdjustment;
  }

  /**
   * Adjust the DC based on rush days and proficiency
   * @param {number} baseDC - The base DC
   * @param {number} rushDays - The number of days to rush
   * @param {string} proficiency - The crafter's proficiency level
   * @returns {number} The adjusted DC
   */
  private static adjustDC(baseDC: number, rushDays: number, proficiency: string): number {
    if (rushDays <= 0) return baseDC;
    
    const rushPenalty = this.getRushPenalty(proficiency, rushDays);
    return baseDC + rushPenalty;
  }

  /**
   * Get the DC penalty for rushing based on proficiency
   * @param {string} proficiency - The crafter's proficiency level
   * @param {number} rushDays - The number of days to rush
   * @returns {number} The DC penalty
   */
  private static getRushPenalty(proficiency: string, rushDays: number): number {
    const maxDaysAllowed = RUSH_REDUCTIONS[proficiency]?.days || 0;
    const dcPerDay = RUSH_REDUCTIONS[proficiency]?.dcIncrease || 0;
    
    // Can't rush more days than allowed for proficiency
    const actualRushDays = Math.min(rushDays, maxDaysAllowed);
    
    return actualRushDays * dcPerDay;
  }

  /**
   * Calculate the daily cost reduction when continuing to craft
   * @param {number} characterLevel - The level of the character
   * @param {string} proficiency - The crafter's proficiency level
   * @returns {number} The daily cost reduction in gold pieces
   */
  private static calculateDailyReduction(characterLevel: number, proficiency: string): number {
    // Bound character level to valid range
    const boundedLevel = Math.min(20, Math.max(0, characterLevel));
    
    // Find matching income row
    const incomeRow = INCOME_EARNED.find(row => row.level === boundedLevel);
    if (!incomeRow) return 1; // Default to 1 gp if no match
    
    // Get value based on proficiency, fallback to trained
    let copperValue = 0;
    switch (proficiency) {
      case 'legendary':
        copperValue = incomeRow.legendary;
        break;
      case 'master':
        copperValue = incomeRow.master;
        break;
      case 'expert':
        copperValue = incomeRow.expert;
        break;
      default:
        copperValue = incomeRow.trained;
    }
    
    // Convert copper to gold (100 cp = 1 gp)
    return copperValue / 100;
  }
} 