import { AonItem } from "../config/types.js";
import { formatItem } from "./items.js";

/**
 * Format search results with detailed information
 * @param {AonItem[]} items - The items to format
 * @returns {string} Formatted detailed information
 */
export function formatSearchResults(items: AonItem[]): string {
    // Limit the number of results shown to avoid excessively large responses
    const maxDetailedResults = 5;
    const displayItems = items.slice(0, maxDetailedResults);
    const remainingCount = items.length - displayItems.length;
    
    // Format each item with detailed information
    let output = displayItems.map(item => formatItem(item)).join('\n\n---\n\n');
    
    // Add a note about additional results if some were omitted
    if (remainingCount > 0) {
      output += `\n\n+${remainingCount} more results. Please refine your search for more specific results or use getPathfinderItem for complete details.`;
    }
    
    return output;
  }