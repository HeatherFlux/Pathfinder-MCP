import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AonClient } from './client/aon-client.js';
import { config, AonCategory } from './config/config.js';
import { AonItem } from './config/types.js';

// Create an MCP server instance
const server = new McpServer({
  name: "Pathfinder AON MCP Server",
  version: "1.0.0"
});

// Initialize Elasticsearch client
const aonClient = new AonClient();

/**
 * Format an AonItem into readable text
 * @param {AonItem} item - The Pathfinder item to format
 * @returns {string} Formatted text representation of the item
 */
function formatItem(item: AonItem): string {
  let text = `# ${item.name}`;
  if (item.category) text += ` (${item.category})`;
  if (item.description) text += `\n\n${item.description}`;
  if (item.text) text += `\n\n${item.text}`;
  return text;
}

// Search by category and query
server.tool('getPathfinderItem', 'Get detailed information about a specific Pathfinder item by name and category', {
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
    
    return {
      content: [{ type: "text", text: formatItem(item) }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: "text", text: `Error retrieving item: ${errorMessage}` }]
    };
  }
});

// Search for items by category and query
server.tool('searchPathfinder', 'Search the Pathfinder Archives of Nethys for information about a specific category', {
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
    
    const formattedResults = results.map(formatItem).join("\n\n---\n\n");
    
    return {
      content: [{ 
        type: "text", 
        text: formattedResults 
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: "text", text: `Error during search: ${errorMessage}` }]
    };
  }
});

// Get all items in a category
server.tool('getAllPathfinderItems', 'Get all items from a specific category in the Pathfinder Archives of Nethys', {
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
    
    // Create a summary list for better UX with many items
    const summary = items.map(item => `- ${item.name}`).join('\n');
    
    return {
      content: [{ 
        type: "text", 
        text: `# ${category.charAt(0).toUpperCase() + category.slice(1)} Items (${offset}-${offset + items.length})\n\n${summary}` 
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: "text", text: `Error retrieving items: ${errorMessage}` }]
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
\`\`\`
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
