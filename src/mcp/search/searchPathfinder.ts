import { AonClient } from "../../clients/aon-client.js";
import { formatSearchResults } from "../../services/search.js";
import { AonCategory } from "../../types/config.js";

/**
 * Search the Pathfinder Archives of Nethys for information about a specific category
 * 
 * @param {object} params - The function parameters
 * @param {string} params.category - The category to search in
 * @param {string} params.query - The search query
 * @returns {Promise<object>} A response object with formatted content
 */
export default async function searchPathfinder(
  params: {
    category: string;
    query: string;
  }
): Promise<{content: Array<{type: string, text: string}>}> {
  // Extract parameters
  const { category, query } = params;
  
  try {
    // Perform the search
    const client = new AonClient();
    const results = await client.searchCategory(category as AonCategory, query);
    
    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `No results found for "${query}" in category "${category}".` }]
      };
    }
    
    // Log the number of results for debugging
    console.error(`Found ${results.length} results for "${query}" in category "${category}"`);
    
    return {
      content: [{ 
        type: "text", 
        text: formatSearchResults(results)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error searching for "${query}" in category "${category}":`, error);
    return {
      content: [{ type: "text", text: `Error during search: ${errorMessage}` }]
    };
  }
} 