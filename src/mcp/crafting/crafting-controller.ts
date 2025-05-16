import { AonItem } from '../../types/types.js';
import CraftingCalculator, { CraftingRequirements } from '../../services/crafting-calculator.js';

export interface CraftingParams {
  category: string;
  name: string;
  characterLevel: number;
  proficiency: string;
  feats?: string[];
  useComplexCrafting?: boolean;
  rushDays?: number;
}

export interface CraftingMaterials {
  baseCost: number;
  currency: string;
  additionalMaterials?: string[];
  specialRequirements?: string[];
}

export interface CraftingTime {
  days: number;
  isRushed?: boolean;
}

export interface CraftingChances {
  criticalFailure: number;
  failure: number;
  success: number;
  criticalSuccess: number;
}

export interface CraftingCalculation {
  item: AonItem;
  crafting: {
    dc: number;
    time: CraftingTime;
    materials: CraftingMaterials;
    canCraft: boolean;
    specialRequirements?: string[];
    successChances: CraftingChances;
  };
}

export interface CraftingResponseSuccess {
  success: true;
  itemName: string;
  itemLevel: number;
  itemPrice: string;
  itemRarity: string;
  dc: number;
  time: string;
  materials: { cost: string; additionalMaterials?: string[] };
  canCraft: boolean;
  specialRequirements?: string[];
  successChances: Record<string, string>;
  tips: string[];
}

export interface CraftingResponseError {
  success: false;
  error: string;
  message?: string;
  suggestions?: SimilarItem[];
}

export type CraftingResponse = CraftingResponseSuccess | CraftingResponseError;

export interface SimilarItem {
  name: string;
  level: number | string;
  category: string;
}

interface ItemData extends AonItem {
  name: string;
  level: number;
  price: string;
  rarity?: string;
  traits: string[];
  bulk: string;
  description: string;
  category: string;
  [key: string]: unknown;
}

// Update global type for MCP access
declare global {
  interface McpItemData {
    name?: string;
    level?: number | string;
    price?: string | number;
    rarity?: string;
    traits?: string[];
    bulk?: string;
    description?: string;
    category?: string;
    [key: string]: unknown;
  }

  interface McpResponse {
    data?: McpItemData;
  }
  
  interface McpSearchResponse {
    data?: McpItemData[];
  }
  
  var globalThis: {
    mcp: {
      mcp_pathfinder_mcp_getPathfinderItem: (params: { category: string; name: string }) => Promise<McpResponse>;
      mcp_pathfinder_mcp_searchPathfinder: (params: { category: string; query: string }) => Promise<McpSearchResponse>;
    };
  };
}

/**
 * Get the crafting requirements for a Pathfinder 2e item
 * @param {object} params - The parameters from the MCP tool call
 * @returns {object} Crafting requirements and success chances
 */
export async function getPathfinderCraftingRequirements(params: CraftingParams): Promise<CraftingResponse> {
  const { category, name, characterLevel, proficiency, feats = [], useComplexCrafting = false, rushDays = 0 } = params;
  
  try {
    // Fetch the item data first from Archives of Nethys
    const itemData = await fetchItemData(category, name);
    
    if (!itemData) {
      return {
        success: false,
        error: `Item not found: ${name} in category ${category}`,
        suggestions: await findSimilarItems(category, name)
      };
    }
    
    // Calculate the crafting requirements
    const craftingRequirements: CraftingRequirements = CraftingCalculator.calculateRequirements(itemData, {
      characterLevel,
      proficiency,
      feats,
      useComplexCrafting,
      rushDays
    });
    
    const crafting = craftingRequirements.crafting;
    const prerequisites = craftingRequirements.prerequisites;
    return {
      success: true,
      itemName: itemData.name,
      itemLevel: typeof itemData.level === 'number' ? itemData.level : 0,
      itemPrice: formatPrice(typeof itemData.price === 'number' ? `${itemData.price} gp` : (itemData.price ?? '0 gp')),
      itemRarity: ('rarity' in itemData && typeof itemData.rarity === 'string') ? itemData.rarity : 'common',
      dc: crafting.dc,
      time: formatTime({ days: crafting.initialDays }),
      materials: formatMaterials({ baseCost: crafting.materialCost, currency: 'gp' }),
      canCraft: prerequisites.meetsLevelRequirement && prerequisites.meetsProficiencyRequirement && prerequisites.hasRequiredFeats,
      specialRequirements: prerequisites.missingFeats,
      successChances: {}, // Not available from calculator, leave as empty object
      tips: generateCraftingTips(craftingRequirements, {
        proficiency,
        feats,
        itemRarity: ('rarity' in itemData && typeof itemData.rarity === 'string') ? itemData.rarity : 'common'
      })
    };
  } catch (error: unknown) {
    console.error('Error calculating crafting requirements:', error);
    return {
      success: false,
      error: 'Failed to calculate crafting requirements',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Fetch item data from the Archives of Nethys
 * @private
 * @param {string} category - The item category
 * @param {string} name - The item name
 * @returns {Promise<object>} The item data
 */
async function fetchItemData(category: string, name: string): Promise<ItemData | null> {
  const categoryMap: Record<string, string> = {
    'weapon': 'weapon',
    'armor': 'armor',
    'equipment': 'equipment',
    'shield': 'shield',
    'alchemical': 'equipment',
    'magical': 'equipment'
  };
  
  const aonCategory = categoryMap[category] || 'equipment';
  try {
    const response = await global.mcp.mcp_pathfinder_mcp_getPathfinderItem({
      category: aonCategory,
      name: name
    });
    
    if (response?.data) {
      const data = response.data;
      return {
        name: String(data.name || name),
        level: Number(data.level || 0),
        price: String(data.price || '0 gp'),
        rarity: String(data.rarity || 'common'),
        traits: Array.isArray(data.traits) ? data.traits : [],
        bulk: String(data.bulk || '0'),
        description: String(data.description || ''),
        category: String(data.category || category)
      };
    }
    return null;
  } catch (error: unknown) {
    console.error('Error fetching item from AoN:', error);
    return null;
  }
}

/**
 * Find similar items for suggestions
 * @private
 * @param {string} category - The item category
 * @param {string} name - The item name
 * @returns {Promise<Array>} List of similar items
 */
async function findSimilarItems(category: string, name: string): Promise<SimilarItem[]> {
  try {
    const response = await global.mcp.mcp_pathfinder_mcp_searchPathfinder({
      category: category,
      query: name
    });
    
    if (response?.data) {
      const items = response.data as McpItemData[];
      return items.slice(0, 5).map(item => ({
        name: String(item.name || ''),
        level: String(item.level || '0'),
        category: String(item.category || category)
      }));
    }
    
    return [];
  } catch (error: unknown) {
    console.error('Error finding similar items:', error);
    return [];
  }
}

/**
 * Generate helpful crafting tips based on the requirements
 * @param {CalculatorRequirements} requirements - The calculated crafting requirements
 * @param {object} options - Character options and item details
 * @param {string} options.proficiency - The character's proficiency level
 * @param {string[]} options.feats - The character's crafting feats
 * @param {string} options.itemRarity - The item's rarity
 * @returns {string[]} List of helpful tips
 */
function generateCraftingTips(requirements: CraftingRequirements, options: { proficiency: string; feats: string[]; itemRarity: string }): string[] {
  const { proficiency, feats, itemRarity } = options;
  const tips: string[] = [];
  // No successChances, so skip that tip
  if (!feats.includes('Specialty Crafting')) {
    tips.push(`The Specialty Crafting feat could improve your chances of success.`);
  }
  if ((requirements.prerequisites.missingFeats?.length ?? 0) > 0 && !feats.includes('Magical Crafting')) {
    tips.push(`The Magical Crafting feat would help with crafting this magical item.`);
  }
  if (itemRarity === 'uncommon' && proficiency === 'trained') {
    tips.push(`Uncommon items are easier to craft with Expert proficiency.`);
  } else if (itemRarity === 'rare' && proficiency !== 'master') {
    tips.push(`Rare items are much easier to craft with Master proficiency.`);
  }
  // Rush crafting tip: if rushPenalty > 0
  if (requirements.crafting.rushPenalty > 0) {
    tips.push(`Rushing increases the DC by 5 per day saved. Consider taking more time if possible.`);
  }
  return tips;
}

/**
 * Format a price value into a string
 * @param {string | { value: number; currency: string }} price - The price to format
 * @returns {string} The formatted price string
 */
function formatPrice(price: string | { value: number; currency: string }): string {
  if (!price) return '0 gp';
  if (typeof price === 'string') return price;
  const { value, currency } = price;
  return `${value} ${currency}`;
}

/**
 * Format a time value into a string
 * @param {CraftingTime} time - The time to format
 * @returns {string} The formatted time string
 */
function formatTime(time: CraftingTime): string {
  if (!time) return 'Unknown';
  const { days } = time;
  return days === 1 ? '1 day' : `${days} days`;
}

/**
 * Format materials into a structured object
 * @param {CraftingMaterials} materials - The materials to format
 * @returns {{ cost: string; additionalMaterials?: string[] }} The formatted materials
 */
function formatMaterials(materials: CraftingMaterials): { cost: string; additionalMaterials?: string[] } {
  if (!materials) return { cost: 'Unknown' };
  const { baseCost, currency, additionalMaterials } = materials;
  return {
    cost: `${baseCost} ${currency}`,
    additionalMaterials: additionalMaterials || []
  };
} 