import { AonItem } from "../config/types.js";

/**
 * Format an AonItem into readable text with complete details
 * @param {AonItem} item - The Pathfinder item to format
 * @returns {string} Formatted text representation of the item
 */
export function formatItem(item: AonItem): string {
    // Start with the item name as a title
    let text = `# ${item.name}`;
    if (item.category) text += ` (${item.category})`;
    
    // Add full description
    if (item.description) {
      text += `\n\n${item.description}`;
    }
    
    // Add full text content
    if (item.text) {
      text += `\n\n${item.text}`;
    }
    
    // Add any other properties that might be present
    const standardProps = ['name', 'category', 'description', 'text', 'formatted_url'];
    const additionalProps = Object.entries(item)
      .filter(([key]) => !standardProps.includes(key))
      .filter(([_, value]) => value !== undefined && value !== null);
    
    if (additionalProps.length > 0) {
      text += '\n\n## Additional Details\n';
      
      // Display URL first if available
      if (item.formatted_url) {
        text += `\n**URL**: ${item.formatted_url}`;
      } else if (item.url) {
        text += `\n**URL**: [${item.url}](${item.url})`;
      }
      
      for (const [key, value] of additionalProps) {
        // Skip URL since we already handled it
        if (key === 'url') continue;
        
        // Format the key as a readable label
        const label = key
          .replace(/([A-Z])/g, ' $1') // Add space before capital letters
          .replace(/^./, match => match.toUpperCase()); // Capitalize first letter
        
        // Format value appropriately based on type
        let displayValue: string;
        if (typeof value === 'object') {
          displayValue = JSON.stringify(value, null, 2);
        } else {
          displayValue = String(value);
        }
        
        text += `\n**${label}**: ${displayValue}`;
      }
    }
    
    return text;
  }