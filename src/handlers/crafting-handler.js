import { CraftingCalculator } from '../utils/crafting-calculator.js';

/**
 * Get the crafting requirements for a Pathfinder 2e item
 * @param {Object} params - The parameters from the MCP tool call
 * @returns {Object} Crafting requirements and success chances
 */
export async function getPathfinderCraftingRequirements(params) {
  const { category, name, characterLevel, proficiency, feats, useComplexCrafting, rushDays } = params;
  
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
      message: error.message
    };
  }
}

/**
 * Fetch item data from the Archives of Nethys
 * @private
 * @param {string} category - The item category
 * @param {string} name - The item name
 * @returns {Promise<Object>} The item data
 */
async function fetchItemData(category, name) {
  // This would normally make an API call to the Archives of Nethys or use a database
  // For now, we'll simulate it with some basic item data
  
  // Map category from our simplified list to the AoN categories
  const categoryMap = {
    'weapon': 'weapon',
    'armor': 'armor',
    'equipment': 'equipment',
    'shield': 'shield',
    'alchemical': 'equipment',
    'magical': 'equipment'
  };
  
  const aonCategory = categoryMap[category] || 'equipment';
  
  // Use the existing MCP tool to get the item data
  try {
    const response = await global.mcp.mcp_pathfinder_mcp_getPathfinderItem({
      category: aonCategory,
      name: name
    });
    
    if (response && response.data) {
      // Transform the AoN data into our format
      return {
        name: response.data.name,
        level: response.data.level || 0,
        price: response.data.price || '0 gp',
        rarity: response.data.rarity || 'common',
        traits: response.data.traits || [],
        bulk: response.data.bulk || '0',
        description: response.data.description || ''
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
async function findSimilarItems(category, name) {
  try {
    // Use the existing MCP tool to search for similar items
    const response = await global.mcp.mcp_pathfinder_mcp_searchPathfinder({
      category: category,
      query: name
    });
    
    if (response && response.data && Array.isArray(response.data)) {
      // Return the top 5 similar items
      return response.data.slice(0, 5).map(item => ({
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
 * @param {Object} requirements - The calculated crafting requirements
 * @param {Object} options - Character options and item details
 * @returns {Array<string>} List of helpful tips
 */
function generateCraftingTips(requirements, options) {
  const { proficiency, feats, itemRarity } = options;
  const tips = [];
  
  // Check success chances
  const successChance = parseInt(requirements.successChances.success, 10);
  if (successChance < 50) {
    tips.push(`Your success chance is low. Consider increasing your crafting proficiency or Intelligence.`);
  }
  
  // Check if they have useful feats
  if (!feats.includes('Specialty Crafting')) {
    tips.push(`The Specialty Crafting feat could improve your chances of success.`);
  }
  
  if (requirements.materials.specialRequirements.length > 0 && !feats.includes('Magical Crafting')) {
    tips.push(`The Magical Crafting feat would help with crafting this magical item.`);
  }
  
  // Rarity tips
  if (itemRarity === 'uncommon' && proficiency === 'trained') {
    tips.push(`Uncommon items are easier to craft with Expert proficiency.`);
  } else if (itemRarity === 'rare' && proficiency !== 'master') {
    tips.push(`Rare items are much easier to craft with Master proficiency.`);
  }
  
  // Rush crafting tip
  if (requirements.time.isRushed) {
    tips.push(`Rushing increases the DC by 5 per day saved. Consider taking more time if possible.`);
  }
  
  return tips;
} 