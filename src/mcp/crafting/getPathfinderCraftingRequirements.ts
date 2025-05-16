import { AonClient } from "../../clients/aon-client.js";
import CraftingCalculator, { CraftingOptions } from "../../services/crafting-calculator.js";
import { formatCraftingRequirements } from "../../services/crafting-formatter.js";
import { AonCategory } from "../../types/config.js";

/**
 * Get crafting requirements for a Pathfinder 2e item
 * 
 * @param {object} params - The function parameters
 * @param {string} params.category - The category of the item (e.g., "equipment", "weapon")
 * @param {string} params.name - The name of the item to get crafting requirements for
 * @param {number} [params.characterLevel=1] - The character's level (for determining time and prerequisites)
 * @param {string} [params.proficiency="trained"] - The character's proficiency in Crafting ("trained", "expert", "master", "legendary")
 * @param {string[]} [params.feats=[]] - The character's relevant feats for crafting
 * @param {boolean} [params.useComplexCrafting=false] - Whether to use complex crafting rules from Treasure Vault
 * @param {number} [params.rushDays=0] - Number of days to rush crafting by (increases DC)
 * @returns {Promise<string>} A formatted string with crafting requirements
 */
export default async function getPathfinderCraftingRequirements(
  params: {
    category: string;
    name: string;
    characterLevel?: number;
    proficiency?: string;
    feats?: string[];
    useComplexCrafting?: boolean;
    rushDays?: number;
  }
): Promise<string> {
  try {
    // Extract and validate parameters
    const {
      category,
      name,
      characterLevel = 1,
      proficiency = "trained",
      feats = [],
      useComplexCrafting = false,
      rushDays = 0
    } = params;
    
    if (!category || !name) {
      return "Error: Both category and name are required parameters.";
    }
    
    // Connect to Archives of Nethys and get the item
    const client = new AonClient();
    const item = await client.getItem(category as AonCategory, name);
    
    if (!item) {
      return `Error: Could not find item "${name}" in category "${category}".`;
    }
    
    // Set up options for the crafting calculator
    const options: CraftingOptions = {
      characterLevel,
      proficiency,
      feats,
      useComplexCrafting,
      rushDays
    };
    
    // Calculate crafting requirements
    const requirements = CraftingCalculator.calculateRequirements(item, options);
    
    // Format the requirements into readable text
    return formatCraftingRequirements(requirements);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error calculating crafting requirements: ${errorMessage}`;
  }
} 