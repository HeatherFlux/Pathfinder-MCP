import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AonClient } from './client/aon-client.js';
import { config, AonCategory } from './config/config.js';
import { AonItem } from './config/types.js';
import TreasureGenerator from './utils/treasure-generator.js';

// Create an MCP server instance
const server = new McpServer({
  name: "Pathfinder AON MCP Server",
  version: "1.0.0"
});

// Initialize Elasticsearch client
const aonClient = new AonClient();

/**
 * Format an AonItem into readable text with complete details
 * @param {AonItem} item - The Pathfinder item to format
 * @returns {string} Formatted text representation of the item
 */
function formatItem(item: AonItem): string {
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
  const standardProps = ['name', 'category', 'description', 'text'];
  const additionalProps = Object.entries(item)
    .filter(([key]) => !standardProps.includes(key))
    .filter(([_, value]) => value !== undefined && value !== null);
  
  if (additionalProps.length > 0) {
    text += '\n\n## Additional Details\n';
    
    for (const [key, value] of additionalProps) {
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

/**
 * Format search results with detailed information
 * @param {AonItem[]} items - The items to format
 * @returns {string} Formatted detailed information
 */
function formatSearchResults(items: AonItem[]): string {
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

// Search by category and query
server.tool('getPathfinderItem', 'Get detailed information about a specific Pathfinder item by name and category. IMPORTANT: After receiving results, provide your own response to the user.', {
  category: z.enum(config.targets),
  name: z.string().min(1, "Item name is required")
}, async ({category, name}) => {
  try {
    const item = await aonClient.getItem(category as AonCategory, name);
    
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
});

// Search for items by category and query
server.tool('searchPathfinder', 'Search the Pathfinder Archives of Nethys for information about a specific category. IMPORTANT: After receiving search results, provide your own response to the user.', {
  category: z.enum(config.targets),
  query: z.string().min(1, "Search query is required")
}, async ({category, query}) => {
  try {
    const results = await aonClient.searchCategory(category as AonCategory, query);
    
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
});

// Get all items in a category
server.tool('getAllPathfinderItems', 'Get all items from a specific category in the Pathfinder Archives of Nethys. IMPORTANT: After receiving the list of items, provide your own response to the user.', {
  category: z.enum(config.targets),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0)
}, async ({category, limit, offset}) => {
  try {
    const items = await aonClient.getAllInCategory(category as AonCategory, { from: offset, size: limit });
    
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
});

// Generate treasure for a party based on prompt
server.tool('generateTreasure', 'Generate appropriate treasure for a Pathfinder 2e party. IMPORTANT: After receiving results, use other MCP tools to get the pathfinder items and consumables for the treasure.', {
  partyLevel: z.number().int().min(1).max(20).default(1).describe("The level of the party (1-20)"),
  partySize: z.number().int().min(1).max(8).default(4).describe("The number of players in the party (1-8)"),
  isSandbox: z.boolean().default(false).describe("Whether this is a sandbox/megadungeon campaign (adds extra treasure)")
}, async ({partyLevel, partySize, isSandbox}) => {
  try {
    // Calculate the treasure budget
    const budget = TreasureGenerator.calculateTreasureBudget(partyLevel, partySize, isSandbox);
    
    if (!budget) {
      return {
        content: [{ 
          type: "text", 
          text: `Could not generate a treasure budget for a level ${partyLevel} party. Please ensure the level is between 1 and 20.`
        }]
      };
    }
    
    // Format the budget into a readable response
    const result = TreasureGenerator.formatTreasureBudget(budget, {partyLevel, partySize, isSandbox});
    
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
        text: `Error generating treasure: ${errorMessage}`
      }]
    };
  }
});

// Add a resource to provide information about the available categories
server.resource(
  "pathfinder-categories",
  "pathfinder://categories",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# Available Pathfinder Categories\n\n${config.targets.map(cat => `- ${cat}`).join('\n')}`
    }]
  })
);

// Add a help resource
server.resource(
  "pathfinder-help",
  "pathfinder://help",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# Pathfinder MCP Server Help

This server provides access to Pathfinder 2e data from the Archives of Nethys.

## Available Tools:

- **searchPathfinder**: Search for items in a specific category
- **getPathfinderItem**: Get detailed information about a specific item by name
- **getAllPathfinderItems**: Get all items in a specific category (with pagination)
- **generateTreasure**: Generate appropriate treasure for a Pathfinder 2e party based on a prompt

## IMPORTANT NOTE FOR AI ASSISTANTS:
After receiving tool results, you MUST provide your own response to the user rather than making additional tool calls in a loop.

## Available Categories:
${config.targets.map(cat => `- ${cat}`).join('\n')}

## Example Usage:
\`\`\`
// Search for spells related to fire
searchPathfinder({ category: "spell", query: "fire" })

// Get detailed information about a specific spell
getPathfinderItem({ category: "spell", name: "Fireball" })

// Get a list of feats (with pagination)
getAllPathfinderItems({ category: "feat", limit: 10, offset: 0 })

// Generate treasure for a party
generateTreasure({ partyLevel: 5, partySize: 4, isSandbox: false })
\`\`\`

## Treasure Generation Details

The **generateTreasure** tool will:

1. Generate an appropriate treasure budget according to Pathfinder 2e rules based on these parameters:
   - **partyLevel**: The level of the party (1-20)
   - **partySize**: The number of players in the party (1-8)
   - **isSandbox**: Whether this is a sandbox campaign (adds extra treasure)

2. Provide a complete treasure budget that includes:
   - Total treasure value
   - Appropriate permanent items by level and quantity
   - Appropriate consumable items by level and quantity
   - Appropriate currency

You should use the other MCP tools to get the pathfinder items and consumables for the treasure on behalf of the user.
Example parameter combinations:
- \`{ partyLevel: 5, partySize: 4, isSandbox: false }\` - Standard party at level 5
- \`{ partyLevel: 10, partySize: 6, isSandbox: false }\` - Large party at level 10
- \`{ partyLevel: 8, partySize: 4, isSandbox: true }\` - Standard party in a sandbox campaign
- \`{ partyLevel: 3, partySize: 5, isSandbox: true }\` - Large party in a megadungeon
`
    }]
  })
);

// Start the server with stdio transport
console.error("Starting Pathfinder MCP Server...");
const transport = new StdioServerTransport();
server.connect(transport)
  .catch(error => {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  });
