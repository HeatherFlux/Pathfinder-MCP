import { AonClient } from "../../client/aon-client.js";
import { AonCategory } from "../../config/config.js";

/**
 * Get all items from a specific category in the Pathfinder Archives of Nethys
 * 
 * @param {object} params - The function parameters
 * @param {string} params.category - The category to get items from
 * @param {number} [params.limit=20] - Maximum number of items to return
 * @param {number} [params.offset=0] - Offset for pagination
 * @returns {Promise<object>} A response object with formatted content
 */
export default async function getAllPathfinderItems(
  params: {
    category: string;
    limit?: number;
    offset?: number;
  }
): Promise<{content: Array<{type: string, text: string}>}> {
  // Extract parameters with defaults
  const { 
    category, 
    limit = 20, 
    offset = 0 
  } = params;

  try {
    // Fetch all items in the category
    const client = new AonClient();
    const items = await client.getAllInCategory(category as AonCategory, { from: offset, size: limit });
    
    if (items.length === 0) {
      return {
        content: [{ type: "text", text: `No items found in category "${category}".` }]
      };
    }
    
    // Create a simple comma-separated list for better conciseness
    const names = items.map(item => item.name).join(', ');
    
    return {
      content: [{ 
        type: "text", 
        text: `${category.charAt(0).toUpperCase() + category.slice(1)} (${items.length}): ${names}` 
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: "text", text: `Error retrieving items: ${errorMessage}` }]
    };
  }
} 