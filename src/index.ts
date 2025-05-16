import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config, AonCategory } from './config/config.js';

// Import the refactored MCP functions
import searchPathfinderImpl from './mcp/pf2e/searchPathfinder.js';
import getPathfinderItemImpl from './mcp/pf2e/getPathfinderItem.js';
import getAllPathfinderItemsImpl from './mcp/pf2e/getAllPathfinderItems.js';
import generateTreasureImpl from './mcp/pf2e/generateTreasure.js';
import getItemsByLevelImpl from './mcp/pf2e/getItemsByLevel.js';

// Import crafting implementations
import CraftingCalculator from './utils/crafting-calculator.js';
import { formatCraftingRequirements } from './utils/crafting-formatter.js';
import { AonClient } from './client/aon-client.js';

// Create an MCP server instance
const server = new McpServer({
  name: "Pathfinder AON MCP Server",
  version: "1.0.0"
});

// Initialize Elasticsearch client
const aonClient = new AonClient();

// Search by category and query
server.tool('getPathfinderItem', 'Get detailed information about a specific Pathfinder item by name and category with a few results. IMPORTANT: After receiving results, provide your own response to the user.', {
  category: z.enum(config.targets),
  name: z.string().min(1, "Item name is required")
}, async (params, _extra) => {
  const result = await getPathfinderItemImpl(params);
  return {
    content: result.content.map(item => ({
      ...item,
      type: item.type as "text"
    }))
  };
});

// Search for items by category and query
server.tool('searchPathfinder', 'Search the Pathfinder Archives of Nethys for information about a specific category. IMPORTANT: After receiving search results, provide your own response to the user.', {
  category: z.enum(config.targets),
  query: z.string().min(1, "Search query is required")
}, async (params, _extra) => {
  const result = await searchPathfinderImpl(params);
  return {
    content: result.content.map(item => ({
      ...item,
      type: item.type as "text"
    }))
  };
});

// Get all items in a category
server.tool('getAllPathfinderItems', 'Get all items from a specific category in the Pathfinder Archives of Nethys with all the results available good for generating treasure. IMPORTANT: After receiving the list of items, provide your own response to the user.', {
  category: z.enum(config.targets),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0)
}, async (params, _extra) => {
  const result = await getAllPathfinderItemsImpl(params);
  return {
    content: result.content.map(item => ({
      ...item,
      type: item.type as "text"
    }))
  };
});

// Generate treasure for a party based on prompt
server.tool('generateTreasure', 'Generate appropriate treasure for a Pathfinder 2e party. IMPORTANT: After receiving results, use other MCP tools to get the pathfinder items and consumables for the treasure.', {
  partyLevel: z.number().int().min(1).max(20).default(1).describe("The level of the party (1-20)"),
  partySize: z.number().int().min(1).max(8).default(4).describe("The number of players in the party (1-8)"),
  isSandbox: z.boolean().default(false).describe("Whether this is a sandbox/megadungeon campaign (adds extra treasure)")
}, async (params, _extra) => {
  const result = await generateTreasureImpl(params);
  return {
    content: result.content.map(item => ({
      ...item,
      type: item.type as "text"
    }))
  };
});

// Get all items by level (for treasure generation)
server.tool('getItemsByLevel', 'Retrieve all items of a specific level for treasure generation purposes. IMPORTANT: After receiving items, provide your own response to the user.', {
  level: z.number().int().min(0).max(25).describe("The item level to search for (0-25)"),
  categories: z.array(z.enum(config.targets)).optional().describe("Optional categories to include in the search")
}, async (params, _extra) => {
  const result = await getItemsByLevelImpl(params);
  return {
    content: result.content.map(item => ({
      ...item,
      type: item.type as "text"
    }))
  };
});

// Crafting requirements calculator
server.tool('getPathfinderCraftingRequirements', 'Get crafting requirements for a Pathfinder 2e item with details on materials, time, and DC. IMPORTANT: After receiving results, provide your own response to the user.', {
  category: z.enum(config.targets),
  name: z.string().min(1, "Item name is required"),
  characterLevel: z.number().int().min(1).max(20).default(1).describe("The level of the character crafting the item (1-20)"),
  proficiency: z.enum(["untrained", "trained", "expert", "master", "legendary"]).default("trained").describe("The character's proficiency in Crafting"),
  feats: z.array(z.string()).default([]).describe("The character's crafting-related feats"),
  useComplexCrafting: z.boolean().default(false).describe("Whether to use complex crafting rules from Treasure Vault"),
  rushDays: z.number().int().min(0).max(3).default(0).describe("Number of days to rush crafting by (increases DC)")
}, async ({category, name, characterLevel, proficiency, feats, useComplexCrafting, rushDays}, _extra) => {
  try {
    // Get the item first
    const item = await aonClient.getItem(category as AonCategory, name);
    
    if (!item) {
      return {
        content: [{ 
          type: "text" as const, 
          text: `Could not find item "${name}" in category "${category}".` 
        }]
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
    
    const requirements = CraftingCalculator.calculateRequirements(item, options);
    
    // Format the requirements
    const formattedRequirements = formatCraftingRequirements(requirements);
    
    return {
      content: [{ 
        type: "text" as const, 
        text: formattedRequirements 
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ 
        type: "text" as const, 
        text: `Error calculating crafting requirements: ${errorMessage}` 
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

- **searchPathfinder**: Search for items in a specific category with a few results
- **getPathfinderItem**: Get detailed information about a specific item by name
- **getAllPathfinderItems**: Get all items in a specific category (with pagination) useful when generating treasure
- **generateTreasure**: Generate appropriate treasure for a Pathfinder 2e party based on a prompt
- **getItemsByLevel**: Retrieve all items of a specific level for treasure generation purposes
- **getPathfinderCraftingRequirements**: Calculate crafting requirements for an item including DC, time, and materials

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

// Get all items of level 5 for treasure generation
getItemsByLevel({ level: 5 })

// Get equipment items of level 5 for treasure generation
getItemsByLevel({ level: 5, categories: ["equipment", "armor", "weapon", "shield"] })

// Calculate crafting requirements for a longsword
getPathfinderCraftingRequirements({ 
  category: "weapon", 
  name: "Longsword", 
  characterLevel: 5, 
  proficiency: "expert", 
  feats: ["Magical Crafting"] 
})
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

## Item Retrieval by Level

The **getItemsByLevel** tool is designed specifically for treasure generation and will:

1. Retrieve all items of a specific level (0-25) with these parameters:
   - **level**: The item level to search for
   - **categories**: (Optional) Specific categories to include in the search avoid this unles directly asked for treasure generation

This tool works well with generateTreasure to find specific items to include in treasure hoards also always returns urls and prices.

## Crafting Calculator Details

The **getPathfinderCraftingRequirements** tool helps calculate the requirements for crafting items in Pathfinder 2e:

1. Calculate crafting requirements based on these parameters:
   - **category**: The category of the item (e.g., "weapon", "armor", "equipment")
   - **name**: The name of the item to craft
   - **characterLevel**: The level of the character crafting the item (1-20)
   - **proficiency**: The character's proficiency in Crafting ("trained", "expert", "master", "legendary")
   - **feats**: Array of crafting-related feats the character has
   - **useComplexCrafting**: Whether to use complex crafting rules (defaults to false)
   - **rushDays**: Number of days to rush crafting by (increases DC, defaults to 0)

2. Provides detailed crafting information including:
   - Crafting DC and material costs
   - Time required for crafting
   - Success and failure outcomes
   - Prerequisites and requirements
   - Tips for improving success chances

Example parameter combinations:
- \`{ category: "weapon", name: "Longsword", characterLevel: 3, proficiency: "trained" }\` - Basic crafting
- \`{ category: "armor", name: "Full Plate", characterLevel: 8, proficiency: "expert", feats: ["Magical Crafting"] }\` - Advanced crafting
- \`{ category: "equipment", name: "Bag of Holding", characterLevel: 10, proficiency: "master", useComplexCrafting: true }\` - Complex crafting
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
