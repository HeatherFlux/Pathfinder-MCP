/**
 * Handlers for crafting-related MCP tools
 */
import CraftingCalculator from '../utils/crafting-calculator.js';

/**
 * Get crafting requirements for a specific Pathfinder item
 * @param {Object} params - The parameters from the MCP tool
 * @param {string} params.category - The category of the item (e.g., 'equipment', 'weapon', 'armor')
 * @param {string} params.name - The name of the item to get crafting requirements for
 * @param {number} params.characterLevel - The level of the character doing the crafting (1-20)
 * @param {string} params.proficiency - The proficiency level in Crafting (untrained, trained, expert, master, legendary)
 * @param {string[]} params.feats - Array of crafting-related feats the character has
 * @param {boolean} params.useComplexCrafting - Whether to use complex crafting rules from supplements
 * @param {number} params.rushDays - Number of days to rush crafting (increases DC)
 * @returns {Object} The crafting requirements and details
 */
export async function getPathfinderCraftingRequirements(params) {
  try {
    // Extract parameters with defaults
    const {
      category,
      name,
      characterLevel = 1,
      proficiency = "trained",
      feats = [],
      useComplexCrafting = false,
      rushDays = 0
    } = params;
    
    // Validate required parameters
    if (!category || !name) {
      return {
        success: false,
        error: "Missing required parameters: category and name must be provided"
      };
    }
    
    // Fetch the item details from the Archives of Nethys
    const item = await fetchItemFromArchives(category, name);
    
    if (!item) {
      return {
        success: false,
        error: `Could not find item "${name}" in category "${category}"`
      };
    }
    
    // Calculate crafting requirements
    const options = {
      characterLevel,
      proficiency,
      feats,
      useComplexCrafting,
      rushDays
    };
    
    const craftingRequirements = CraftingCalculator.calculateRequirements(item, options);
    
    // Format the response
    return {
      success: true,
      item: {
        name: item.name,
        level: craftingRequirements.item.level,
        price: formatPrice(craftingRequirements.item.price),
        rarity: craftingRequirements.item.rarity,
        traits: craftingRequirements.item.traits,
      },
      requirements: {
        dc: craftingRequirements.crafting.dc,
        time: formatTime(craftingRequirements.crafting.time),
        materials: formatMaterials(craftingRequirements.crafting.materials),
        canCraft: craftingRequirements.crafting.canCraft,
        specialRequirements: craftingRequirements.crafting.specialRequirements,
        successChances: craftingRequirements.crafting.successChances
      }
    };
  } catch (error) {
    console.error("Error calculating crafting requirements:", error);
    return {
      success: false,
      error: "Failed to calculate crafting requirements: " + error.message
    };
  }
}

/**
 * Fetch an item from the Archives of Nethys (or other data source)
 * @private
 */
async function fetchItemFromArchives(category, name) {
  try {
    // First check if we have a direct match in our database
    let item = await getExactItemMatch(category, name);
    
    // If no direct match, try a search
    if (!item) {
      const searchResults = await searchItems(category, name);
      if (searchResults && searchResults.length > 0) {
        // Use the first result as the closest match
        item = searchResults[0];
      }
    }
    
    return item;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw new Error("Failed to fetch item data: " + error.message);
  }
}

/**
 * Get exact match for an item by name and category
 * @private
 */
async function getExactItemMatch(category, name) {
  // Implement according to your data source
  // This is a stub that would be replaced with actual implementation
  // Typically, this would query your database or API
  
  // For demonstration purposes:
  try {
    return null; // This would be replaced with actual code
  } catch (error) {
    console.error("Error getting exact item match:", error);
    return null;
  }
}

/**
 * Search for items by category and name
 * @private
 */
async function searchItems(category, name) {
  // Implement according to your data source
  // This is a stub that would be replaced with actual implementation
  
  // For demonstration purposes:
  try {
    return null; // This would be replaced with actual code
  } catch (error) {
    console.error("Error searching items:", error);
    return null;
  }
}

/**
 * Format price for display
 * @private
 */
function formatPrice(price) {
  if (!price) return "0 gp";
  
  const { value, currency } = price;
  return `${value} ${currency}`;
}

/**
 * Format time for display
 * @private
 */
function formatTime(time) {
  if (!time) return "Unknown";
  
  const { days } = time;
  return days === 1 ? "1 day" : `${days} days`;
}

/**
 * Format materials for display
 * @private
 */
function formatMaterials(materials) {
  if (!materials) return { cost: "Unknown" };
  
  const { baseCost, currency, additionalMaterials } = materials;
  
  return {
    cost: `${baseCost} ${currency}`,
    additionalMaterials: additionalMaterials || []
  };
}

/**
 * Format success chances for display
 * @private
 */
function formatSuccessChances(chances) {
  if (!chances) return {};
  
  return {
    criticalFailure: `${chances.criticalFailure}%`,
    failure: `${chances.failure}%`,
    success: `${chances.success}%`,
    criticalSuccess: `${chances.criticalSuccess}%`
  };
} 