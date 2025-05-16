import CraftingCalculator, { CraftingRequirements as CalculatorRequirements } from '../../services/crafting-calculator.js';
import { AonItem } from "../../types/types.js";

// Define interfaces
interface CraftingParams {
  category: string;
  name: string;
  characterLevel: number;
  proficiency: string;
  feats?: string[];
  useComplexCrafting?: boolean;
  rushDays?: number;
}

interface ItemData extends AonItem {
  name: string;
  level: number;
  price: string | number;
  rarity?: string;
  traits?: string[];
  bulk?: string;
  description?: string;
  category: string;
}

interface CraftingResponse {
  error?: string;
  message?: string;
  itemName?: string;
  itemLevel?: number;
  itemPrice?: string | number;
  itemRarity?: string;
  tips?: string[];
  suggestions?: SimilarItem[];
  [key: string]: unknown;
}

interface SimilarItem {
  name: string;
  level: string | number;
  category: string;
}

// Define global type for MCP access
declare global {
  var mcp: {
    mcp_pathfinder_mcp_getPathfinderItem: (params: { category: string; name: string }) => Promise<{data?: Record<string, unknown>}>;
    mcp_pathfinder_mcp_searchPathfinder: (params: { category: string; query: string }) => Promise<{data?: unknown[]}>;
  };
}

/**
 * Get the crafting requirements for a Pathfinder 2e item
 * @param {object} params - The parameters from the MCP tool call
 * @returns {Promise<CraftingResponse>} Crafting requirements and success chances
 */
export async function getPathfinderCraftingRequirements(params: CraftingParams): Promise<CraftingResponse> {
  const { category, name, characterLevel, proficiency, feats = [], useComplexCrafting = false, rushDays = 0 } = params;
  
  try {
    // Fetch the item data first from Archives of Nethys
    const itemData = await fetchItemData(category, name);
    
    if (!itemData) {
      return {
        error: `Item not found: ${name} in category ${category}`,
        suggestions: await findSimilarItems(category, name)
      };
    }
    
    // Calculate the crafting requirements
    const craftingRequirements = CraftingCalculator.calculateRequirements(itemData, {
      characterLevel,
      proficiency,
      feats,
      useComplexCrafting,
      rushDays
    });
    
    return {
      itemName: itemData.name,
      itemLevel: itemData.level,
      itemPrice: itemData.price,
      itemRarity: itemData.rarity || 'common',
      ...craftingRequirements,
      // Additional helpful information for players
      tips: generateCraftingTips(craftingRequirements, {
        proficiency,
        feats,
        itemRarity: itemData.rarity
      })
    };
  } catch (error) {
    console.error('Error calculating crafting requirements:', error);
    return {
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
 * @returns {Promise<ItemData | null>} The item data
 */
async function fetchItemData(category: string, name: string): Promise<ItemData | null> {
  // This would normally make an API call to the Archives of Nethys or use a database
  // For now, we'll simulate it with some basic item data
  
  // Map category from our simplified list to the AoN categories
  const categoryMap: Record<string, string> = {
    'weapon': 'weapon',
    'armor': 'armor',
    'equipment': 'equipment',
    'shield': 'shield',
    'alchemical': 'equipment',
    'magical': 'equipment'
  };
  
  const aonCategory = category in categoryMap ? categoryMap[category] : 'equipment';
  
  // Use the existing MCP tool to get the item data
  try {
    const response = await global.mcp.mcp_pathfinder_mcp_getPathfinderItem({
      category: aonCategory,
      name: name
    });
    
    if (response && response.data) {
      // Transform the AoN data into our format
      return {
        name: String(response.data.name || name),
        level: Number(response.data.level || 0),
        price: String(response.data.price || '0 gp'),
        rarity: String(response.data.rarity || 'common'),
        traits: Array.isArray(response.data.traits) ? response.data.traits : [],
        bulk: String(response.data.bulk || '0'),
        description: String(response.data.description || ''),
        category: String(response.data.category || category)
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
 * @returns {Promise<SimilarItem[]>} List of similar items
 */
async function findSimilarItems(category: string, name: string): Promise<SimilarItem[]> {
  try {
    // Use the existing MCP tool to search for similar items
    const response = await global.mcp.mcp_pathfinder_mcp_searchPathfinder({
      category: category,
      query: name
    });
    
    if (response && response.data && Array.isArray(response.data)) {
      // Return the top 5 similar items
      return response.data.slice(0, 5).map((item: unknown) => {
        const itemObj = item as Record<string, unknown>;
        return {
          name: String(itemObj.name || ''),
          level: itemObj.level ? String(itemObj.level) : '0',
          category: String(itemObj.category || category)
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error finding similar items:', error);
    return [];
  }
}

interface CraftingTips {
  proficiency: string;
  feats?: string[];
  itemRarity?: string;
}

/**
 * Generate helpful crafting tips based on the requirements
 * @private
 * @param {object} requirements - The calculated crafting requirements
 * @param {object} options - Character options and item details
 * @returns {string[]} List of helpful tips
 */
function generateCraftingTips(requirements: CalculatorRequirements, options: CraftingTips): string[] {
  const { proficiency, feats = [], itemRarity } = options;
  const tips: string[] = [];
  
  // Check success chances
  const successChance = requirements.success?.success 
    ? parseInt(requirements.success.success.match(/\d+/) ? requirements.success.success.match(/\d+/)?.[0] || '0' : '0', 10)
    : 0;
    
  if (successChance < 50) {
    tips.push(`Your success chance is low. Consider increasing your crafting proficiency or Intelligence.`);
  }
  
  // Check if they have useful feats
  if (!feats.includes('Specialty Crafting')) {
    tips.push(`The Specialty Crafting feat could improve your chances of success.`);
  }
  
  // Check for magical items
  const hasMagicalRequirements = requirements.prerequisites?.requiredFeats
    ? requirements.prerequisites.requiredFeats.includes('Magical Crafting')
    : false;
    
  if (hasMagicalRequirements && !feats.includes('Magical Crafting')) {
    tips.push(`The Magical Crafting feat would help with crafting this magical item.`);
  }
  
  // Rarity tips
  if (itemRarity === 'uncommon' && proficiency === 'trained') {
    tips.push(`Uncommon items are easier to craft with Expert proficiency.`);
  } else if (itemRarity === 'rare' && proficiency !== 'master') {
    tips.push(`Rare items are much easier to craft with Master proficiency.`);
  }
  
  // Rush crafting tip
  const isRushed = requirements.crafting?.rushPenalty > 0;
  if (isRushed) {
    tips.push(`Rushing increases the DC by 5 per day saved. Consider taking more time if possible.`);
  }
  
  return tips;
}

/**
 * MCP Tool definition for the Pathfinder 2e Crafting Calculator
 */
export const craftingTool = {
  name: 'pathfinder_crafting',
  description: 'Calculate crafting requirements for Pathfinder 2e items including DC, time, materials, and success chances.',
  functions: [
    {
      name: 'calculateCraftingRequirements',
      description: 'Calculate the crafting requirements for a specific item based on character details.',
      parameters: {
        type: 'object',
        required: ['category', 'name', 'characterLevel', 'proficiency'],
        properties: {
          category: {
            type: 'string',
            description: 'The category of item (weapon, armor, equipment, shield, alchemical, magical)',
            enum: ['weapon', 'armor', 'equipment', 'shield', 'alchemical', 'magical']
          },
          name: {
            type: 'string',
            description: 'The name of the item to craft'
          },
          characterLevel: {
            type: 'integer',
            description: 'The character\'s level (1-20)',
            minimum: 1,
            maximum: 20
          },
          proficiency: {
            type: 'string',
            description: 'The character\'s crafting proficiency',
            enum: ['untrained', 'trained', 'expert', 'master', 'legendary']
          },
          feats: {
            type: 'array',
            description: 'List of crafting-related feats the character has',
            items: {
              type: 'string',
              enum: [
                'Alchemical Crafting',
                'Magical Crafting', 
                'Specialty Crafting', 
                'Snare Crafting',
                'Impeccable Crafting',
                'Inventor',
                'Quick Craft',
                'Efficient Crafting'
              ]
            },
            default: []
          },
          useComplexCrafting: {
            type: 'boolean',
            description: 'Whether to use complex crafting rules or simplified ones',
            default: false
          },
          rushDays: {
            type: 'integer',
            description: 'Number of days to rush the crafting by (increases DC)',
            minimum: 0,
            default: 0
          }
        }
      },
      handler: getPathfinderCraftingRequirements
    }
  ]
}; 