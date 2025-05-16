import CraftingCalculator, { CraftingRequirements } from '../utils/crafting-calculator.js';
import { AonItem } from '../config/types.js';

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
  } catch (error: any) {
    console.error('Error calculating crafting requirements:', error);
    return {
      success: false,
      error: 'Failed to calculate crafting requirements',
      message: error.message
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
async function fetchItemData(category: string, name: string): Promise<AonItem | null> {
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
    const response = await (globalThis as any).mcp.mcp_pathfinder_mcp_getPathfinderItem({
      category: aonCategory,
      name: name
    });
    if (response && response.data) {
      // Ensure all required properties for AonItem are present
      return {
        name: response.data.name,
        category: aonCategory,
        description: response.data.description || '',
        text: response.data.text || '',
        url: response.data.url || '',
        formatted_url: response.data.formatted_url || '',
        price: response.data.price || '0 gp',
        traits: response.data.traits || [],
        bulk: response.data.bulk || '0',
        similar_items: response.data.similar_items || [],
        ...response.data // spread any additional properties
      };
    }
    return null;
  } catch (error) {
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
    // Use the existing MCP tool to search for similar items
    const response = await (globalThis as any).mcp.mcp_pathfinder_mcp_searchPathfinder({
      category: category,
      query: name
    });
    
    if (response && response.data && Array.isArray(response.data)) {
      // Return the top 5 similar items
      return response.data.slice(0, 5).map((item: any) => ({
        name: item.name,
        level: item.level || '0',
        category: item.category || category
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error finding similar items:', error);
    return [];
  }
}

/**
 * Generate helpful crafting tips based on the requirements
 * @private
 * @param {object} requirements - The calculated crafting requirements
 * @param options.proficiency
 * @param options.feats
 * @param options.itemRarity
 * @param {object} options - Character options and item details
 * @returns {Array<string>} List of helpful tips
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
 *
 * @param price
 */
function formatPrice(price: string | { value: number; currency: string }): string {
  if (!price) return '0 gp';
  if (typeof price === 'string') return price;
  const { value, currency } = price;
  return `${value} ${currency}`;
}

/**
 *
 * @param time
 */
function formatTime(time: CraftingTime): string {
  if (!time) return 'Unknown';
  const { days } = time;
  return days === 1 ? '1 day' : `${days} days`;
}

/**
 *
 * @param materials
 */
function formatMaterials(materials: CraftingMaterials): { cost: string; additionalMaterials?: string[] } {
  if (!materials) return { cost: 'Unknown' };
  const { baseCost, currency, additionalMaterials } = materials;
  return {
    cost: `${baseCost} ${currency}`,
    additionalMaterials: additionalMaterials || []
  };
} 