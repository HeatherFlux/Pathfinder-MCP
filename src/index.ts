import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from './types/config.js';

// Import MCP tool implementations
import searchPathfinderImpl from './mcp/search/searchPathfinder.js';
import getPathfinderItemImpl from './mcp/search/getPathfinderItem.js';
import getAllPathfinderItemsImpl from './mcp/search/getAllPathfinderItems.js';
import generateTreasureImpl from './mcp/treasure/generateTreasure.js';
import getItemsByLevelImpl from './mcp/search/getItemsByLevel.js';
import getPathfinderCraftingRequirementsImpl from './mcp/crafting/getPathfinderCraftingRequirements.js';
import buildEncounterImpl from './mcp/encounter/buildEncounter.js';

// Create MCP server
const server = new McpServer({
  name: 'pathfinder-mcp',
  version: '1.0.0'
});

// Add tools
server.tool(
  'searchPathfinder',
  'Search the Pathfinder Archives of Nethys for information about a specific category',
  {
    category: z.enum(config.targets),
    query: z.string().min(1)
  },
  async (args) => {
    const result = await searchPathfinderImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'getPathfinderItem',
  'Get detailed information about a specific Pathfinder item by name and category',
  {
    category: z.enum(config.targets),
    name: z.string().min(1)
  },
  async (args) => {
    const result = await getPathfinderItemImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'getAllPathfinderItems',
  'Get all items from a specific category in the Pathfinder Archives of Nethys',
  {
    category: z.enum(config.targets),
    limit: z.number().optional(),
    offset: z.number().optional()
  },
  async (args) => {
    const result = await getAllPathfinderItemsImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'getItemsByLevel',
  'Get all items of a specific level from the Archives of Nethys. Use this to find level-appropriate equipment, especially after determining treasure budget.',
  {
    level: z.number().min(0).max(25),
    categories: z.array(z.enum(config.targets)).optional()
  },
  async (args) => {
    const result = await getItemsByLevelImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'generateTreasure',
  'Generate appropriate treasure for a Pathfinder 2e party use this to determine the treasure budget for a given party level and size. and then use other search and get tools to find specific items within that budget.',
  {
    partyLevel: z.number().min(1).max(20).optional(),
    partySize: z.number().min(1).max(8).optional(),
    isSandbox: z.boolean().optional()
  },
  async (args) => {
    const result = await generateTreasureImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'getPathfinderCraftingRequirements',
  'Calculate crafting requirements for a Pathfinder 2e item',
  {
    category: z.enum(['weapon', 'armor', 'equipment', 'shield', 'alchemical', 'magical']),
    name: z.string().min(1),
    characterLevel: z.number().min(1).max(20).optional(),
    proficiency: z.enum(['untrained', 'trained', 'expert', 'master', 'legendary']).optional(),
    feats: z.array(z.string()).optional(),
    useComplexCrafting: z.boolean().optional(),
    rushDays: z.number().min(0).optional()
  },
  async (args) => {
    const result = await getPathfinderCraftingRequirementsImpl(args);
    return {
      content: [{
        type: "text" as const,
        text: result
      }]
    };
  }
);

server.tool(
  'buildEncounter',
  'Build a balanced PF2e encounter. Suggests creatures from Archives of Nethys based on party level and desired difficulty. Returns multiple encounter options with XP calculations.',
  {
    partyLevel: z.number().min(1).max(20).describe('The level of the party'),
    partySize: z.number().min(1).max(8).optional().describe('Number of players (default: 4)'),
    difficulty: z.enum(['trivial', 'low', 'moderate', 'severe', 'extreme']).describe('Encounter difficulty'),
    creatureTypes: z.array(z.string()).optional().describe('Filter by creature types (e.g., ["undead", "beast"])'),
    environment: z.string().optional().describe('Environment theme (e.g., "forest", "dungeon", "sky")')
  },
  async (args) => {
    const result = await buildEncounterImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

// Connect to transport
const transport = new StdioServerTransport();
await server.connect(transport);
