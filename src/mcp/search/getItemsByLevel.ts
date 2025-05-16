import { AonClient } from "../../clients/aon-client.js";
import { AonCategory } from "../../types/config.js";

/**
 * Retrieve all items of a specific level for treasure generation purposes
 * 
 * @param {object} params - The function parameters
 * @param {number} params.level - The item level to search for (0-25)
 * @param {string[]} [params.categories] - Optional categories to include in the search
 * @returns {Promise<object>} A response object with formatted content
 */
export default async function getItemsByLevel(
  params: {
    level: number;
    categories?: string[];
  }
): Promise<{content: Array<{type: string, text: string}>}> {
  // Extract parameters
  const { level, categories } = params;
  
  try {
    // Fetch items by level
    const client = new AonClient();
    const items = await client.getItemsByLevel(level, categories as AonCategory[]);
    
    if (items.length === 0) {
      return {
        content: [{ 
          type: "text", 
          text: `No items found at level ${level}.` 
        }]
      };
    }
    
    // Group items by category for better organization
    const itemsByCategory: Record<string, string[]> = {};
    
    items.forEach(item => {
      const category = item.category || 'unknown';
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item.name);
    });
    
    // Format the results
    let result = `# Level ${level} Items (${items.length} total)\n\n`;
    
    for (const [category, names] of Object.entries(itemsByCategory)) {
      result += `## ${category.charAt(0).toUpperCase() + category.slice(1)} (${names.length})\n`;
      result += names.join(', ') + '\n\n';
    }
    
    return {
      content: [{ 
        type: "text", 
        text: result 
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ 
        type: "text", 
        text: `Error retrieving items of level ${level}: ${errorMessage}` 
      }]
    };
  }
} 