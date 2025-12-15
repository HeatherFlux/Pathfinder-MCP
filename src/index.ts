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
import calculateEncounterXPImpl from './mcp/encounter/calculateEncounterXP.js';

// Creature tools
import searchCreaturesByLevelImpl from './mcp/creatures/searchCreaturesByLevel.js';
import searchCreaturesByTraitImpl from './mcp/creatures/searchCreaturesByTrait.js';
import getCreatureFamilyImpl from './mcp/creatures/getCreatureFamily.js';

// Hazard tools
import searchHazardsImpl from './mcp/hazards/searchHazards.js';
import getHazardsByLevelImpl from './mcp/hazards/getHazardsByLevel.js';

// Lore tools
import getDeityInfoImpl from './mcp/lore/getDeityInfo.js';

// Story tools
import generateSecretsImpl from './mcp/story/generateSecrets.js';
import generateSceneIdeasImpl from './mcp/story/generateSceneIdeas.js';

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

server.tool(
  'calculateEncounterXP',
  'Calculate total XP and difficulty for a custom encounter with specific creatures and hazards.',
  {
    partyLevel: z.number().min(1).max(20).describe('The level of the party'),
    partySize: z.number().min(1).max(8).optional().describe('Number of players (default: 4)'),
    threats: z.array(z.object({
      name: z.string().describe('Name of the creature or hazard'),
      level: z.number().describe('Level of the threat'),
      count: z.number().describe('How many of this threat'),
      type: z.enum(['creature', 'simple_hazard', 'complex_hazard']).describe('Type of threat')
    })).describe('List of creatures and hazards in the encounter')
  },
  async (args) => {
    const result = await calculateEncounterXPImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

// Creature search tools
server.tool(
  'searchCreaturesByLevel',
  'Find creatures within a level range. Great for building encounters at specific difficulty.',
  {
    minLevel: z.number().min(-1).max(25).describe('Minimum creature level'),
    maxLevel: z.number().min(-1).max(25).describe('Maximum creature level'),
    traits: z.array(z.string()).optional().describe('Filter by traits (e.g., ["undead", "evil"])'),
    creatureType: z.string().optional().describe('Filter by creature type (e.g., "dragon", "humanoid")'),
    limit: z.number().optional().describe('Max results (default: 20)')
  },
  async (args) => {
    const result = await searchCreaturesByLevelImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'searchCreaturesByTrait',
  'Find creatures by their traits (undead, dragon, elemental, etc.). Useful for themed encounters.',
  {
    traits: z.array(z.string()).describe('Traits to search for (e.g., ["undead"], ["fire", "elemental"])'),
    minLevel: z.number().optional().describe('Minimum level filter'),
    maxLevel: z.number().optional().describe('Maximum level filter'),
    limit: z.number().optional().describe('Max results (default: 30)')
  },
  async (args) => {
    const result = await searchCreaturesByTraitImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'getCreatureFamily',
  'Get all creatures in a family (goblin, dragon, demon, etc.). Perfect for themed dungeons with escalating threats.',
  {
    familyName: z.string().describe('Creature family name (e.g., "goblin", "dragon", "skeleton")'),
    minLevel: z.number().optional().describe('Minimum level filter'),
    maxLevel: z.number().optional().describe('Maximum level filter')
  },
  async (args) => {
    const result = await getCreatureFamilyImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

// Hazard tools
server.tool(
  'searchHazards',
  'Search for traps, environmental hazards, and haunts. Filter by type and complexity.',
  {
    query: z.string().optional().describe('Search query (e.g., "pit", "fire", "poison")'),
    minLevel: z.number().optional().describe('Minimum hazard level'),
    maxLevel: z.number().optional().describe('Maximum hazard level'),
    hazardType: z.enum(['trap', 'environmental', 'haunt', 'all']).optional().describe('Type of hazard'),
    complexity: z.enum(['simple', 'complex', 'all']).optional().describe('Simple (one-time) or complex (multi-round)'),
    limit: z.number().optional().describe('Max results (default: 25)')
  },
  async (args) => {
    const result = await searchHazardsImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'getHazardsByLevel',
  'Get all hazards appropriate for a party level. Shows XP values for encounter building.',
  {
    level: z.number().min(0).max(25).describe('Party level to find hazards for'),
    includeAdjacent: z.boolean().optional().describe('Include levels ±2 from target (default: true)')
  },
  async (args) => {
    const result = await getHazardsByLevelImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

// Lore tools
server.tool(
  'getDeityInfo',
  'Get deity information for temple encounters, divine casters, or cultist motivations.',
  {
    name: z.string().optional().describe('Deity name to look up'),
    domain: z.string().optional().describe('Search by domain (death, war, magic, etc.)'),
    alignment: z.string().optional().describe('Filter by alignment (good, evil, lawful, chaotic)')
  },
  async (args) => {
    const result = await getDeityInfoImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

// Story generation tools
server.tool(
  'generateSecrets',
  'Generate Lazy DM style secrets and clues. Location-agnostic mysteries that can be discovered anywhere.',
  {
    theme: z.enum(['betrayal', 'conspiracy', 'treasure', 'monster', 'history', 'npc', 'random']).describe('Theme for the secrets'),
    count: z.number().min(1).max(10).optional().describe('Number of secrets to generate (default: 5)'),
    dangerLevel: z.enum(['low', 'medium', 'high']).optional().describe('How dangerous are the implications')
  },
  async (args) => {
    const result = await generateSecretsImpl(args);
    return {
      content: result.content.map(c => ({
        ...c,
        type: "text" as const
      }))
    };
  }
);

server.tool(
  'generateSceneIdeas',
  'Generate scene ideas for adventures. Combat, exploration, social, puzzle, chase, or heist scenes.',
  {
    sceneType: z.enum(['combat', 'exploration', 'social', 'puzzle', 'chase', 'heist', 'random']).describe('Type of scene'),
    environment: z.string().optional().describe('Setting for the scene (forest, dungeon, city, sky, etc.)'),
    tension: z.enum(['low', 'medium', 'high', 'climax']).optional().describe('Tension level (default: medium)'),
    count: z.number().min(1).max(6).optional().describe('Number of scene ideas (default: 3)')
  },
  async (args) => {
    const result = await generateSceneIdeasImpl(args);
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
