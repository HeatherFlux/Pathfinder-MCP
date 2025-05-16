import { AonClient } from "../../clients/aon-client.js";
import { formatItem } from "../../services/items.js";
import { AonCategory } from "../../types/config.js";

/**
 * Get detailed information about a specific Pathfinder item by name and category
 * 
 * @param {object} params - The function parameters
 * @param {string} params.category - The category of the item
 * @param {string} params.name - The name of the item to look up
 * @returns {Promise<object>} A response object with formatted content
 */
export default async function getPathfinderItem(
  params: {
    category: string;
    name: string;
  }
): Promise<{content: Array<{type: string, text: string}>}> {
  // Extract parameters
  const { category, name } = params;
  
  try {
    // Fetch the item
    const client = new AonClient();
    const item = await client.getItem(category as AonCategory, name);
    
    if (!item) {
      return {
        content: [{ type: "text", text: `No item found with name "${name}" in category "${category}".` }]
      };
    }
    
    // Log the raw item data for debugging
    console.error(`Retrieved ${category} item "${name}":`, JSON.stringify(item, null, 2));
    
    // Format the item data for display
    const formattedItem = formatItem(item);
    
    return {
      content: [{ type: "text", text: formattedItem }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error retrieving ${category} item "${name}":`, error);
    return {
      content: [{ type: "text", text: `Error retrieving item: ${errorMessage}` }]
    };
  }
} 