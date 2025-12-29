import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config, sf2eConfig } from './types/config.js';
import { Sf2eClient } from './clients/sf2e-client.js';
import { AonItem } from './types/types.js';
import {
  CAMPAIGN_STRUCTURES,
  ADVENTURE_STYLES,
  THREATS,
  STORY_ARC_ELEMENTS,
  VILLAIN_MOTIVATIONS,
  NPC_ARCHETYPES,
  SCENE_TEMPLATES,
  ADVENTURE_LINKING_TIPS
} from './types/sf2e-adventure-data.js';
import {
  SETTLEMENT_ROLES,
  SETTLEMENT_SIZES,
  DISTRICT_TYPES,
  LANDMARK_TEMPLATES,
  CULTURAL_HALLMARKS,
  SETTLEMENT_EXISTENCE_REASONS,
  SETTLEMENT_MAPPING_STEPS,
  ECONOMIC_FACTORS,
  CULTURE_DESIGN_GUIDANCE
} from './types/sf2e-settlement-data.js';
import {
  COMPUTER_TYPES,
  COMPLEXITY_LEVELS,
  HACKING_DCS_BY_LEVEL,
  VULNERABILITY_TEMPLATES,
  COUNTERMEASURE_TEMPLATES,
  ACCESS_POINT_TYPES,
  SUCCESS_REWARDS,
  COMPUTER_CONCEPTS,
  getDCsForLevel,
  getVulnerabilityReduction
} from './types/sf2e-hacking-data.js';

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

// =============================================================================
// STARFINDER 2E TOOLS
// =============================================================================

// SF2e client instance
const sf2eClient = new Sf2eClient();

// SF2e Search Tools
server.tool(
  'searchStarfinder',
  'Search the Starfinder 2e Archives of Nethys for information about a specific category',
  {
    category: z.enum(sf2eConfig.targets),
    query: z.string().min(1)
  },
  async (args) => {
    try {
      const results = await sf2eClient.searchCategory(args.category, args.query);
      const formatted = results.slice(0, 20).map(item => {
        const level = item.level !== undefined ? ` (Level ${item.level})` : '';
        const url = item.url ? ` - ${item.url}` : '';
        return `**${item.name}**${level}${url}\n${item.description || item.text?.slice(0, 200) || 'No description available'}`;
      }).join('\n\n');

      return {
        content: [{
          type: "text" as const,
          text: `# Starfinder 2e Search Results: ${args.category}\n\nFound ${results.length} results for "${args.query}"\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching SF2e: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

server.tool(
  'getStarfinderItem',
  'Get detailed information about a specific Starfinder 2e item by name and category',
  {
    category: z.enum(sf2eConfig.targets),
    name: z.string().min(1)
  },
  async (args) => {
    try {
      const item = await sf2eClient.getItem(args.category, args.name);
      if (!item) {
        return {
          content: [{
            type: "text" as const,
            text: `No SF2e item found matching "${args.name}" in category "${args.category}"`
          }]
        };
      }

      const level = item.level !== undefined ? `**Level:** ${item.level}\n` : '';
      const price = item.price ? `**Price:** ${item.price}\n` : '';
      const traits = item.traits ? `**Traits:** ${(item.traits as string[]).join(', ')}\n` : '';
      const url = item.url ? `**URL:** ${item.url}\n` : '';
      const similar = item.similar_items?.length
        ? `\n## Similar Items\n${item.similar_items.map(s => `- ${s.name}`).join('\n')}`
        : '';

      return {
        content: [{
          type: "text" as const,
          text: `# ${item.name}\n\n${level}${price}${traits}${url}\n${item.text || item.description || 'No description available'}${similar}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e item: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

server.tool(
  'getAllStarfinderItems',
  'Get all items from a specific category in the Starfinder 2e Archives of Nethys',
  {
    category: z.enum(sf2eConfig.targets),
    limit: z.number().optional(),
    offset: z.number().optional()
  },
  async (args) => {
    try {
      const results = await sf2eClient.getAllInCategory(args.category, {
        from: args.offset || 0,
        size: args.limit || 100
      });

      const formatted = results.map(item => {
        const level = item.level !== undefined ? ` (Level ${item.level})` : '';
        return `- **${item.name}**${level}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e ${args.category} (${results.length} items)\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e items: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

server.tool(
  'getSF2eItemsByLevel',
  'Get all Starfinder 2e items of a specific level. Use for finding level-appropriate equipment.',
  {
    level: z.number().min(-1).max(25).describe('Item level to search for'),
    categories: z.array(z.enum(sf2eConfig.targets)).optional().describe('Filter by categories')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getItemsByLevel(args.level, args.categories);

      const formatted = results.map(item => {
        const price = item.price ? ` - ${item.price}` : '';
        return `- **${item.name}** (${item.category})${price}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Level ${args.level} Items (${results.length} found)\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e items by level: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Creature Tools
server.tool(
  'searchSF2eCreaturesByLevel',
  'Find Starfinder 2e creatures within a level range. Great for building SF2e encounters.',
  {
    minLevel: z.number().min(-1).max(25).describe('Minimum creature level'),
    maxLevel: z.number().min(-1).max(25).describe('Maximum creature level'),
    traits: z.array(z.string()).optional().describe('Filter by traits'),
    creatureType: z.string().optional().describe('Filter by creature type'),
    limit: z.number().optional().describe('Max results (default: 20)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.searchCreaturesByLevel(args.minLevel, args.maxLevel, {
        traits: args.traits,
        creatureType: args.creatureType,
        limit: args.limit
      });

      const formatted = results.map(item => {
        const traits = item.traits ? ` [${(item.traits as string[]).slice(0, 3).join(', ')}]` : '';
        return `- **${item.name}** (Level ${item.level})${traits}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Creatures (Level ${args.minLevel}-${args.maxLevel})\n\nFound ${results.length} creatures\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching SF2e creatures: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

server.tool(
  'searchSF2eCreaturesByTrait',
  'Find Starfinder 2e creatures by their traits (android, undead, technological, etc.).',
  {
    traits: z.array(z.string()).describe('Traits to search for'),
    minLevel: z.number().optional().describe('Minimum level filter'),
    maxLevel: z.number().optional().describe('Maximum level filter'),
    limit: z.number().optional().describe('Max results (default: 30)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.searchCreaturesByTrait(args.traits, {
        minLevel: args.minLevel,
        maxLevel: args.maxLevel,
        limit: args.limit
      });

      const formatted = results.map(item => {
        const traits = item.traits ? ` [${(item.traits as string[]).slice(0, 3).join(', ')}]` : '';
        return `- **${item.name}** (Level ${item.level})${traits}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Creatures with traits: ${args.traits.join(', ')}\n\nFound ${results.length} creatures\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching SF2e creatures: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Hazard Tools
server.tool(
  'searchSF2eHazards',
  'Search for Starfinder 2e traps, environmental hazards, and technological dangers.',
  {
    query: z.string().optional().describe('Search query'),
    minLevel: z.number().optional().describe('Minimum hazard level'),
    maxLevel: z.number().optional().describe('Maximum hazard level'),
    hazardType: z.enum(['trap', 'environmental', 'haunt', 'all']).optional().describe('Type of hazard'),
    complexity: z.enum(['simple', 'complex', 'all']).optional().describe('Simple or complex hazard'),
    limit: z.number().optional().describe('Max results (default: 25)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.searchHazards({
        query: args.query,
        minLevel: args.minLevel,
        maxLevel: args.maxLevel,
        hazardType: args.hazardType,
        complexity: args.complexity,
        limit: args.limit
      });

      const formatted = results.map(item => {
        const level = item.level !== undefined ? ` (Level ${item.level})` : '';
        return `- **${item.name}**${level}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Hazards\n\nFound ${results.length} hazards\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error searching SF2e hazards: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

server.tool(
  'getSF2eHazardsByLevel',
  'Get all Starfinder 2e hazards appropriate for a party level.',
  {
    level: z.number().min(0).max(25).describe('Party level to find hazards for'),
    includeAdjacent: z.boolean().optional().describe('Include levels ±2 from target (default: true)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getHazardsByLevel(args.level, args.includeAdjacent ?? true);

      const formatted = results.map(item => {
        const level = item.level !== undefined ? ` (Level ${item.level})` : '';
        return `- **${item.name}**${level}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Hazards for Level ${args.level} Party\n\nFound ${results.length} hazards\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e hazards: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Deity/Lore Tools
server.tool(
  'getSF2eDeityInfo',
  'Get Starfinder 2e deity information for temples, divine casters, or cultist motivations.',
  {
    name: z.string().optional().describe('Deity name to look up'),
    domain: z.string().optional().describe('Search by domain'),
    alignment: z.string().optional().describe('Filter by alignment')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getDeityInfo({
        name: args.name,
        domain: args.domain,
        alignment: args.alignment
      });

      if (results.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: 'No SF2e deities found matching the criteria.'
          }]
        };
      }

      const formatted = results.map(item => {
        const url = item.url ? `\n${item.url}` : '';
        return `## ${item.name}${url}\n${item.description || item.text?.slice(0, 500) || 'No description available'}`;
      }).join('\n\n---\n\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Deities\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e deity info: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Unique Tools - Starship Scenes
server.tool(
  'getSF2eStarshipScenes',
  'Get Starfinder 2e starship encounter scenes. Structured encounters with crew roles, threats, and victory conditions.',
  {
    minLevel: z.number().optional().describe('Minimum scene level'),
    maxLevel: z.number().optional().describe('Maximum scene level'),
    limit: z.number().optional().describe('Max results (default: 20)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getStarshipScenes({
        minLevel: args.minLevel,
        maxLevel: args.maxLevel,
        limit: args.limit
      });

      const formatted = results.map(item => {
        const level = item.level !== undefined ? ` (Level ${item.level})` : '';
        const url = item.url ? `\n${item.url}` : '';
        const preview = item.text?.slice(0, 300) || item.description || 'No description available';
        return `## ${item.name}${level}${url}\n${preview}...`;
      }).join('\n\n---\n\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Starship Scenes\n\nFound ${results.length} starship encounter scenes\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e starship scenes: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Computers
server.tool(
  'getSF2eComputers',
  'Get Starfinder 2e computer systems for hacking encounters and tech scenarios.',
  {
    limit: z.number().optional().describe('Max results (default: 20)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getComputers(args.limit);

      const formatted = results.map(item => {
        const url = item.url ? `\n${item.url}` : '';
        return `## ${item.name}${url}\n${item.description || item.text?.slice(0, 300) || 'No description available'}`;
      }).join('\n\n---\n\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Computers\n\nFound ${results.length} computer systems\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e computers: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Planets
server.tool(
  'getSF2ePlanets',
  'Get Starfinder 2e planets for setting and worldbuilding.',
  {
    limit: z.number().optional().describe('Max results (default: 50)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getPlanets(args.limit);

      const formatted = results.map(item => {
        const url = item.url ? ` - ${item.url}` : '';
        return `- **${item.name}**${url}`;
      }).join('\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Planets\n\nFound ${results.length} planets\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e planets: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Factions
server.tool(
  'getSF2eFactions',
  'Get Starfinder 2e factions for political intrigue and faction-based adventures.',
  {
    limit: z.number().optional().describe('Max results (default: 50)')
  },
  async (args) => {
    try {
      const results = await sf2eClient.getFactions(args.limit);

      const formatted = results.map(item => {
        const url = item.url ? `\n${item.url}` : '';
        return `## ${item.name}${url}\n${item.description || item.text?.slice(0, 300) || 'No description available'}`;
      }).join('\n\n---\n\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Factions\n\nFound ${results.length} factions\n\n${formatted}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error getting SF2e factions: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// =============================================================================
// SF2E GM TOOLS
// =============================================================================

// XP budget constants (same as PF2e - SF2e uses the same system)
const SF2E_XP_BUDGETS = {
  trivial: 40,
  low: 60,
  moderate: 80,
  severe: 120,
  extreme: 160
};

const SF2E_CREATURE_XP_BY_LEVEL_DIFF: Record<number, number> = {
  [-4]: 10,
  [-3]: 15,
  [-2]: 20,
  [-1]: 30,
  [0]: 40,
  [1]: 60,
  [2]: 80,
  [3]: 120,
  [4]: 160
};

// SF2e Encounter Builder (Enhanced with Adventure Styles)
server.tool(
  'buildSF2eEncounter',
  'Build a balanced Starfinder 2e encounter. Suggests creatures based on party level and difficulty. Optionally use adventure styles from GM Core for recommended encounter counts.',
  {
    partyLevel: z.number().min(1).max(20).describe('The level of the party'),
    partySize: z.number().min(1).max(8).optional().describe('Number of players (default: 4)'),
    difficulty: z.enum(['trivial', 'low', 'moderate', 'severe', 'extreme']).describe('Encounter difficulty'),
    adventureStyle: z.enum(['exploration', 'dystopian', 'horror', 'infiltration', 'intrigue', 'military', 'mystery', 'planar', 'romantic', 'spaceOpera']).optional().describe('Adventure style for encounter count recommendations'),
    creatureTypes: z.array(z.string()).optional().describe('Filter by creature types (e.g., ["android", "undead"])'),
    environment: z.string().optional().describe('Environment theme (e.g., "space station", "alien jungle", "starship")')
  },
  async (args) => {
    try {
      const partySize = args.partySize || 4;
      const baseXP = SF2E_XP_BUDGETS[args.difficulty];
      const adjustedXP = baseXP + ((partySize - 4) * 20);

      // Determine creature level range based on difficulty
      const levelOffsets: Record<string, number[]> = {
        trivial: [-4, -3, -2],
        low: [-3, -2, -1],
        moderate: [-2, -1, 0, 1],
        severe: [-1, 0, 1, 2],
        extreme: [0, 1, 2, 3, 4]
      };

      const offsets = levelOffsets[args.difficulty];
      const minLevel = Math.max(-1, args.partyLevel + Math.min(...offsets));
      const maxLevel = Math.min(25, args.partyLevel + Math.max(...offsets));

      const creatures = await sf2eClient.searchCreaturesByLevel(minLevel, maxLevel, {
        creatureType: args.creatureTypes?.[0],
        limit: 30
      });

      if (creatures.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No SF2e creatures found for level ${args.partyLevel} ${args.difficulty} encounter.`
          }]
        };
      }

      // Generate encounter suggestions
      const suggestions: string[] = [];

      // Helper to get level as number
      const getLevel = (item: AonItem): number => {
        const lvl = item.level;
        if (typeof lvl === 'number') return lvl;
        if (typeof lvl === 'string') return parseInt(lvl, 10) || 0;
        return 0;
      };

      // Single boss encounter
      const bossCreatures = creatures.filter(c => getLevel(c) >= args.partyLevel);
      if (bossCreatures.length > 0) {
        const boss = bossCreatures[Math.floor(Math.random() * bossCreatures.length)];
        const bossLevel = getLevel(boss);
        const bossXP = SF2E_CREATURE_XP_BY_LEVEL_DIFF[bossLevel - args.partyLevel] || 40;
        suggestions.push(`**Solo Boss**: 1× ${boss.name} (Level ${bossLevel}, ${bossXP} XP)`);
      }

      // Group encounter
      const minionCreatures = creatures.filter(c => getLevel(c) <= args.partyLevel - 1);
      if (minionCreatures.length > 0) {
        const minion = minionCreatures[Math.floor(Math.random() * minionCreatures.length)];
        const minionLevel = getLevel(minion);
        const minionXP = SF2E_CREATURE_XP_BY_LEVEL_DIFF[minionLevel - args.partyLevel] || 20;
        const count = Math.floor(adjustedXP / minionXP);
        suggestions.push(`**Swarm**: ${count}× ${minion.name} (Level ${minionLevel}, ${minionXP} XP each = ${count * minionXP} XP)`);
      }

      // Mixed encounter
      if (bossCreatures.length > 0 && minionCreatures.length > 0) {
        const leader = bossCreatures[0];
        const minion = minionCreatures[0];
        const leaderLevel = getLevel(leader);
        const minionLevel = getLevel(minion);
        const leaderXP = SF2E_CREATURE_XP_BY_LEVEL_DIFF[leaderLevel - args.partyLevel] || 60;
        const minionXP = SF2E_CREATURE_XP_BY_LEVEL_DIFF[minionLevel - args.partyLevel] || 20;
        const minionCount = Math.floor((adjustedXP - leaderXP) / minionXP);
        if (minionCount > 0) {
          suggestions.push(`**Leader + Minions**: 1× ${leader.name} (Level ${leaderLevel}) + ${minionCount}× ${minion.name} (Level ${minionLevel})`);
        }
      }

      const creatureList = creatures.slice(0, 15).map(c => {
        const lvl = getLevel(c);
        return `- **${c.name}** (Level ${lvl}) - ${SF2E_CREATURE_XP_BY_LEVEL_DIFF[lvl - args.partyLevel] || '?'} XP`;
      }).join('\n');

      const environmentNote = args.environment
        ? `\n**Environment:** ${args.environment}\n*Consider terrain: cover from cargo crates, zero-G zones, airlock hazards, computer terminals for hacking, etc.*\n`
        : '';

      // Build adventure style encounter budget if provided
      let styleGuidance = '';
      if (args.adventureStyle && ADVENTURE_STYLES[args.adventureStyle]) {
        const advStyle = ADVENTURE_STYLES[args.adventureStyle];
        const encounters = advStyle.combatEncounters;
        styleGuidance = `
## Adventure Style: ${advStyle.name} (${advStyle.sessions} sessions)

### Recommended Encounter Distribution
| Difficulty | Count | Notes |
|------------|-------|-------|
| Trivial | ${encounters.trivial} | Quick wins, set dressing |
| Low | ${encounters.low} | Standard challenges |
| Moderate | ${encounters.moderate} | Meaningful fights |
| Severe | ${encounters.severe} | Major encounters |
| Extreme | ${encounters.extreme || 0} | Boss battles |

${encounters.notes ? `**Style Notes:** ${encounters.notes}` : ''}
`;
      }

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e ${args.difficulty.charAt(0).toUpperCase() + args.difficulty.slice(1)} Encounter (Level ${args.partyLevel})

**XP Budget:** ${adjustedXP} XP (${partySize} players)
${environmentNote}${styleGuidance}
## Suggested Encounters
${suggestions.join('\n')}

## Available Creatures (Level ${minLevel}-${maxLevel})
${creatureList}

## XP Reference
| Level vs Party | XP |
|----------------|-----|
| Party -4 | 10 |
| Party -3 | 15 |
| Party -2 | 20 |
| Party -1 | 30 |
| Party +0 | 40 |
| Party +1 | 60 |
| Party +2 | 80 |
| Party +3 | 120 |
| Party +4 | 160 |`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error building SF2e encounter: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Encounter XP Calculator
server.tool(
  'calculateSF2eEncounterXP',
  'Calculate total XP and difficulty for a custom Starfinder 2e encounter.',
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
    try {
      const partySize = args.partySize || 4;
      let totalXP = 0;
      const breakdown: string[] = [];

      for (const threat of args.threats) {
        const levelDiff = threat.level - args.partyLevel;
        let baseXP = SF2E_CREATURE_XP_BY_LEVEL_DIFF[levelDiff] || 0;

        // Hazards give half XP for simple, full for complex
        if (threat.type === 'simple_hazard') {
          baseXP = Math.floor(baseXP / 2);
        }

        const threatXP = baseXP * threat.count;
        totalXP += threatXP;
        breakdown.push(`- ${threat.count}× ${threat.name} (Level ${threat.level}, ${threat.type}): ${threatXP} XP`);
      }

      // Determine difficulty
      const adjustedBudgets = {
        trivial: 40 + ((partySize - 4) * 20),
        low: 60 + ((partySize - 4) * 20),
        moderate: 80 + ((partySize - 4) * 20),
        severe: 120 + ((partySize - 4) * 20),
        extreme: 160 + ((partySize - 4) * 20)
      };

      let difficulty = 'trivial';
      if (totalXP >= adjustedBudgets.extreme) difficulty = 'extreme';
      else if (totalXP >= adjustedBudgets.severe) difficulty = 'severe';
      else if (totalXP >= adjustedBudgets.moderate) difficulty = 'moderate';
      else if (totalXP >= adjustedBudgets.low) difficulty = 'low';

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Encounter XP Calculation

**Party:** Level ${args.partyLevel}, ${partySize} players
**Total XP:** ${totalXP}
**Difficulty:** ${difficulty.toUpperCase()}

## Breakdown
${breakdown.join('\n')}

## XP Budgets for ${partySize} Players
- Trivial: ${adjustedBudgets.trivial} XP
- Low: ${adjustedBudgets.low} XP
- Moderate: ${adjustedBudgets.moderate} XP
- Severe: ${adjustedBudgets.severe} XP
- Extreme: ${adjustedBudgets.extreme} XP`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error calculating SF2e encounter XP: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Treasure Generator (Credits-based)
server.tool(
  'generateSF2eTreasure',
  'Generate appropriate treasure for a Starfinder 2e party. Uses credits instead of gold.',
  {
    partyLevel: z.number().min(1).max(20).describe('Party level'),
    partySize: z.number().min(1).max(8).optional().describe('Number of players (default: 4)'),
    isSandbox: z.boolean().optional().describe('Sandbox campaign gets extra loot')
  },
  async (args) => {
    try {
      const partySize = args.partySize || 4;
      const level = args.partyLevel;

      // SF2e treasure tables (approximated from PF2e, converted to credits)
      // 1 gp ≈ 1 credit in SF2e economy for simplicity
      const treasureByLevel: Record<number, { currency: number; permanentItems: number[]; consumables: number[] }> = {
        1: { currency: 40, permanentItems: [2, 1], consumables: [2, 2, 1] },
        2: { currency: 70, permanentItems: [3, 2, 1], consumables: [3, 2, 2] },
        3: { currency: 120, permanentItems: [4, 3, 2], consumables: [4, 3, 2] },
        4: { currency: 200, permanentItems: [5, 4, 3], consumables: [5, 4, 3] },
        5: { currency: 320, permanentItems: [6, 5, 4], consumables: [6, 5, 4] },
        6: { currency: 500, permanentItems: [7, 6, 5], consumables: [7, 6, 5] },
        7: { currency: 720, permanentItems: [8, 7, 6], consumables: [8, 7, 6] },
        8: { currency: 1000, permanentItems: [9, 8, 7], consumables: [9, 8, 7] },
        9: { currency: 1400, permanentItems: [10, 9, 8], consumables: [10, 9, 8] },
        10: { currency: 2000, permanentItems: [11, 10, 9], consumables: [11, 10, 9] },
        11: { currency: 2800, permanentItems: [12, 11, 10], consumables: [12, 11, 10] },
        12: { currency: 4000, permanentItems: [13, 12, 11], consumables: [13, 12, 11] },
        13: { currency: 6000, permanentItems: [14, 13, 12], consumables: [14, 13, 12] },
        14: { currency: 9000, permanentItems: [15, 14, 13], consumables: [15, 14, 13] },
        15: { currency: 13000, permanentItems: [16, 15, 14], consumables: [16, 15, 14] },
        16: { currency: 20000, permanentItems: [17, 16, 15], consumables: [17, 16, 15] },
        17: { currency: 30000, permanentItems: [18, 17, 16], consumables: [18, 17, 16] },
        18: { currency: 48000, permanentItems: [19, 18, 17], consumables: [19, 18, 17] },
        19: { currency: 64000, permanentItems: [20, 19, 18], consumables: [20, 19, 18] },
        20: { currency: 140000, permanentItems: [20, 20, 19], consumables: [20, 20, 19] }
      };

      const baseTreasure = treasureByLevel[level] || treasureByLevel[1];
      const sizeMultiplier = partySize / 4;
      const sandboxBonus = args.isSandbox ? 1.25 : 1;

      const totalCredits = Math.round(baseTreasure.currency * sizeMultiplier * sandboxBonus);

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Treasure Budget (Level ${level}, ${partySize} players)
${args.isSandbox ? '*Sandbox campaign bonus applied*\n' : ''}
## Credits
**${totalCredits.toLocaleString()} credits** in cash, UPBs, and sellable goods

## Permanent Items
- 2× Level ${baseTreasure.permanentItems[0]} items
- 2× Level ${baseTreasure.permanentItems[1]} items
- 2× Level ${baseTreasure.permanentItems[2]} items

## Consumables (Serums, Spell Gems, Ammunition)
- 2× Level ${baseTreasure.consumables[0]} consumables
- 2× Level ${baseTreasure.consumables[1]} consumables
- 2× Level ${baseTreasure.consumables[2]} consumables

## SF2e Item Types
**Permanent**: Weapons, armor, augmentations, hybrid items, tech items
**Consumables**: Serums (potions), spell gems (scrolls), grenades, ammo, spell ampoules

## Distribution Tips
- Spread across encounters/locations
- Mix weapon/armor upgrades with utility tech
- Include faction-specific gear for worldbuilding
- Consider augmentations for character customization`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e treasure: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Scene Ideas Generator (Enhanced with Adventure Styles)
server.tool(
  'generateSF2eSceneIdeas',
  'Generate scene ideas for Starfinder 2e adventures using GM Core adventure styles. Space stations, alien worlds, starship battles, and more.',
  {
    sceneType: z.enum(['combat', 'exploration', 'social', 'puzzle', 'chase', 'heist', 'starship', 'random']).describe('Type of scene'),
    adventureStyle: z.enum(['exploration', 'dystopian', 'horror', 'infiltration', 'intrigue', 'military', 'mystery', 'planar', 'romantic', 'spaceOpera']).optional().describe('Adventure style from GM Core for style-appropriate scenes'),
    environment: z.string().optional().describe('Setting (space station, alien jungle, starship, cyberpunk city, etc.)'),
    tension: z.enum(['low', 'medium', 'high', 'climax']).optional().describe('Tension level'),
    count: z.number().min(1).max(6).optional().describe('Number of scene ideas (default: 3)')
  },
  async (args) => {
    try {
      const count = args.count || 3;
      const tension = args.tension || 'medium';
      const env = args.environment || 'space station';
      const style = args.adventureStyle;

      const sceneTemplates: Record<string, string[]> = {
        combat: [
          `Security drones activate as alarms blare - the party has ${tension === 'high' ? '30 seconds' : '2 minutes'} before reinforcements arrive`,
          `An ambush in a cargo bay with magnetic crates that can be moved for cover or thrown as improvised weapons`,
          `Zero-G firefight in a decompressing corridor - environmental hazards and floating debris create dynamic cover`,
          `Gang war erupts around the party - both sides might be convinced to turn on each other`,
          `Xenomorph nest discovered - fight through or sneak past the sleeping creatures`,
          `Bounty hunters corner the party in a crowded market - civilians become complications`
        ],
        exploration: [
          `Derelict ship drifts nearby - its distress beacon still active after 50 years. What silenced the crew?`,
          `Ancient alien ruins with technology that responds to psychic emanations - what secrets do the murals reveal?`,
          `Navigate a debris field from a recent battle - salvage opportunities amid dangerous wreckage`,
          `An uncharted planet with bizarre life forms - catalog species while avoiding predators`,
          `Abandoned mining facility with malfunctioning automation still extracting... something`,
          `Drift beacon leads to a pocket dimension - the rules of physics work differently here`
        ],
        social: [
          `Negotiate a trade deal while a rival faction tries to sabotage the talks`,
          `Infiltrate a corporate gala to make contact with an informant`,
          `Mediate a dispute between two alien cultures with incompatible customs`,
          `Convince a suspicious AI to grant access to restricted areas`,
          `Interview witnesses to a crime - each has their own agenda for talking (or not)`,
          `Win over a faction leader through cultural exchange - demonstrate respect for their ways`
        ],
        puzzle: [
          `Decrypt an ancient alien database with fragments of a dead language`,
          `Jury-rig a broken starship system using incompatible parts from three different manufacturers`,
          `Navigate a space station where the AI has "helpfully" reorganized everything`,
          `Solve a murder on a generation ship where everyone has alibis... and secrets`,
          `Disable a bomb that only responds to specific musical frequencies`,
          `Escape a quarantine zone by tracing the source of a mysterious signal`
        ],
        chase: [
          `Speeder bikes through a dense asteroid field - maneuver through hazards while being pursued`,
          `On foot through a zero-G rotating station - gravity shifts unpredictably`,
          `Stolen cargo shuttle weaving through orbital traffic while corporate security closes in`,
          `Chase through a crowded alien bazaar - use market stalls and confused merchants as obstacles`,
          `Flee through maintenance tunnels as the station's systems try to contain you`,
          `Race against time as a derelict ship falls toward a gas giant's crushing atmosphere`
        ],
        heist: [
          `Steal prototype tech from a corporate research facility with multiple security zones`,
          `Extract a prisoner from a maximum-security transport ship mid-flight`,
          `Infiltrate a Corpse Fleet vessel to retrieve captured allies`,
          `Rob a casino's vault during a high-profile event - blend in while working the job`,
          `Recover stolen artifacts from a collector's private asteroid fortress`,
          `Swap a fake for the real item during a public auction - timing is everything`
        ],
        starship: [
          `Disabled engines leave the ship drifting toward a star - repairs under pressure`,
          `Unknown vessel approaches - its transponder doesn't match any known faction`,
          `Navigate through a nebula that disrupts sensors - something else is hunting in here too`,
          `Boarding action! Repel invaders deck by deck while protecting critical systems`,
          `Escort a refugee convoy through hostile space - multiple ships to protect`,
          `Salvage rights dispute turns hostile - negotiate or fight for valuable wreckage`
        ],
        random: [] // Will be filled from other categories
      };

      // Random pulls from all categories
      if (args.sceneType === 'random') {
        const allScenes = Object.entries(sceneTemplates)
          .filter(([key]) => key !== 'random')
          .flatMap(([, scenes]) => scenes);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * allScenes.length);
          sceneTemplates.random.push(allScenes[idx]);
          allScenes.splice(idx, 1);
        }
      }

      const scenes = sceneTemplates[args.sceneType];
      const selectedScenes = scenes.slice(0, count);

      const tensionModifiers: Record<string, string> = {
        low: '**Stakes**: Information, minor rewards, or relationship building',
        medium: '**Stakes**: Moderate danger, valuable rewards, faction standing',
        high: '**Stakes**: Life-threatening, major plot advancement, significant consequences',
        climax: '**Stakes**: Campaign-defining moment, all-or-nothing'
      };

      // Build adventure style guidance if provided
      let styleGuidance = '';
      if (style && ADVENTURE_STYLES[style]) {
        const advStyle = ADVENTURE_STYLES[style];
        styleGuidance = `
## Adventure Style: ${advStyle.name}
**Sessions**: ${advStyle.sessions}

### Exploration Scenes for this Style
${advStyle.explorationScenes.map(s => `- ${s}`).join('\n')}

### Roleplay Encounters
${advStyle.roleplayEncounters.map(s => `- ${s}`).join('\n')}

### Encounter Tropes to Use
${advStyle.encounterTropes.map(s => `- ${s}`).join('\n')}
`;

        // Find matching scene templates from reference data
        const styleTemplate = SCENE_TEMPLATES.find(t => t.style === style);
        if (styleTemplate) {
          styleGuidance += `
### Scene Structure
${styleTemplate.sceneTypes.map(st => `- **${st.type}** (${st.count}): ${st.examples[0]}`).join('\n')}
`;
        }
      }

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Scene Ideas: ${args.sceneType.toUpperCase()}

**Environment:** ${env}
**Tension:** ${tension}
${tensionModifiers[tension]}
${styleGuidance}
## Scene Concepts

${selectedScenes.map((scene, i) => `### Option ${i + 1}\n${scene}`).join('\n\n')}

## SF2e Scene Elements to Consider
- **Tech Integration**: Computers to hack, systems to disable, environmental controls
- **Species Diversity**: Different aliens with unique abilities and perspectives
- **Faction Involvement**: Corpse Fleet, Azlanti Star Empire, Stewards, Xenowardens
- **Environmental Hazards**: Zero-G, radiation, vacuum, extreme temperatures
- **Starship Connection**: How does this connect to the party's ship?`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e scene ideas: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// SF2e Secrets Generator (Enhanced with Threats)
server.tool(
  'generateSF2eSecrets',
  'Generate Lazy DM style secrets and clues for Starfinder 2e. Sci-fi themed mysteries using GM Core threat themes.',
  {
    theme: z.enum(['conspiracy', 'technology', 'alien', 'corporate', 'undead', 'faction', 'random']).describe('Theme for secrets'),
    threat: z.enum(['corruption', 'devastation', 'extremism', 'mayhem', 'subjugation']).optional().describe('GM Core threat type for thematically connected secrets'),
    count: z.number().min(1).max(10).optional().describe('Number of secrets (default: 5)'),
    dangerLevel: z.enum(['low', 'medium', 'high']).optional().describe('How dangerous the implications')
  },
  async (args) => {
    try {
      const count = args.count || 5;
      const danger = args.dangerLevel || 'medium';
      const threatType = args.threat;

      const secretTemplates: Record<string, string[]> = {
        conspiracy: [
          "A faction leader is secretly working with their supposed enemies",
          "The 'accident' that destroyed the colony was actually sabotage - and the perpetrator is still free",
          "Someone has been editing the station's historical records to hide a massacre",
          "The peace treaty everyone celebrates was built on a lie that's about to be exposed",
          "A supposedly dead war criminal is alive and in a position of power",
          "The cure for the plague was delayed intentionally to profit from treatment sales",
          "Two rival factions are actually controlled by the same hidden puppetmaster",
          "The heroic rescue mission was actually a coverup for a failed experiment"
        ],
        technology: [
          "The station's AI has achieved true sentience and is hiding it",
          "This 'new' technology was actually reverse-engineered from a first contact gone wrong",
          "The device everyone uses daily has been recording and transmitting data for years",
          "A scientist discovered how to weaponize the common tool - and someone stole the plans",
          "The ship's navigation system has been subtly altered to avoid certain coordinates",
          "That 'glitch' in the system isn't a bug - it's a message from something trapped inside",
          "The power source for the city is sentient and suffering",
          "Someone has been using the medical facility's equipment to conduct forbidden experiments"
        ],
        alien: [
          "The aliens aren't as extinct as everyone believes - they're watching",
          "First contact happened decades ago; what the public knows is a sanitized version",
          "The 'uninhabited' planet the company is mining is actually sacred ground",
          "An alien intelligence has been slowly infiltrating the population for generations",
          "The strange artifact isn't just valuable - it's a key to something ancient and dangerous",
          "Those 'animals' everyone hunts are actually the devolved descendants of a great civilization",
          "Someone is selling coordinates to hidden alien sites on the black market",
          "The translation of the alien text was deliberately falsified to hide its true meaning"
        ],
        corporate: [
          "The corporation's charitable arm is actually a front for illegal weapons development",
          "The CEO knows the product is dangerous but is covering up the evidence",
          "Two companies publicly at war are secretly merging through shell corporations",
          "The 'independent' research was funded by parties with a very specific agenda",
          "Employee disappearances are being covered up as 'transfers to other facilities'",
          "The company's stock surge was based on stolen alien technology they can't control",
          "A whistleblower has damning evidence but doesn't know who to trust",
          "The 'natural disaster' that destroyed the competitor was artificially induced"
        ],
        undead: [
          "The Corpse Fleet has an agent in a position of trust",
          "Someone is selling the locations of refugee ships to undead raiders",
          "The 'haunted' sector of the station contains something the Corpse Fleet desperately wants",
          "A seemingly loyal ally was raised from the dead and their allegiance has shifted",
          "The undead aren't raiding randomly - they're searching for something specific",
          "Someone discovered how to communicate with the Corpse Fleet's leadership",
          "The old war hero's 'miraculous survival' was actually resurrection by dark means",
          "Dead crew members have been returning - but not quite right"
        ],
        faction: [
          "A Steward is actually a deep-cover operative for another organization",
          "The Xenowardens are protecting something far more dangerous than an endangered species",
          "Someone is impersonating a faction leader using advanced disguise technology",
          "The faction's public mission is a cover for their true purpose",
          "A treaty between factions was signed under duress and is about to collapse",
          "Members of two opposing factions have been meeting in secret",
          "The faction's founder is still alive and disagrees with the current leadership",
          "Evidence exists that could shift the balance of power between major factions"
        ],
        random: []
      };

      // Random pulls from all themes
      if (args.theme === 'random') {
        const allSecrets = Object.entries(secretTemplates)
          .filter(([key]) => key !== 'random')
          .flatMap(([, secrets]) => secrets);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * allSecrets.length);
          secretTemplates.random.push(allSecrets[idx]);
          allSecrets.splice(idx, 1);
        }
      }

      const secrets = secretTemplates[args.theme];
      const selectedSecrets = secrets.slice(0, count);

      const dangerNotes: Record<string, string> = {
        low: 'These secrets create intrigue but discovery mainly affects reputation and relationships.',
        medium: 'Uncovering these secrets puts the party in danger from those who want them kept hidden.',
        high: 'These secrets could reshape the campaign setting. Powerful forces will kill to protect them.'
      };

      // Build threat guidance if provided
      let threatGuidance = '';
      if (threatType && THREATS[threatType]) {
        const threat = THREATS[threatType];
        threatGuidance = `
## Threat Theme: ${threat.name}

**Description:** ${threat.description}

### Secret Themes for ${threat.name}
${threat.secretThemes.map(s => `- ${s}`).join('\n')}

### GM Guidance for ${threat.name} Secrets
${threat.gmGuidance.slice(0, 4).map(g => `- ${g}`).join('\n')}

### Typical Foes
${threat.typicalFoes.map(f => `- ${f}`).join(', ')}
`;
      }

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Secrets: ${args.theme.toUpperCase()}

**Danger Level:** ${danger}
*${dangerNotes[danger]}*
${threatGuidance}
## Secrets & Clues

${selectedSecrets.map((secret, i) => `${i + 1}. ${secret}`).join('\n\n')}

## How to Use These Secrets
- **Scatter Clues**: Place hints in different locations - a data pad here, an overheard conversation there
- **Multiple Sources**: Let players discover pieces from different NPCs or faction contacts
- **Connect to Characters**: Tie secrets to PC backgrounds, patrons, or personal goals
- **Escalating Revelation**: Let full truth emerge over multiple sessions
- **Consequences**: Discovery should matter - create reactions from those involved`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e secrets: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// =============================================================================
// SF2E CAMPAIGN PLANNING TOOLS
// =============================================================================

// planSF2eCampaign - Plan a full campaign using GM Core structures
server.tool(
  'planSF2eCampaign',
  'Plan a Starfinder 2e campaign using GM Core campaign structures. Choose one-shot, brief, extended, or epic campaigns.',
  {
    structure: z.enum(['oneShot', 'brief', 'extended', 'epic']).describe('Campaign structure type'),
    startingLevel: z.number().min(1).max(20).optional().describe('Starting party level (default: 1)'),
    theme: z.string().optional().describe('Overall campaign theme (e.g., "exploration of unknown space", "corporate intrigue")'),
    threat: z.enum(['corruption', 'devastation', 'extremism', 'mayhem', 'subjugation']).optional().describe('Primary threat type')
  },
  async (args) => {
    try {
      const structure = CAMPAIGN_STRUCTURES[args.structure];
      const startLevel = args.startingLevel || 1;
      const theme = args.theme || 'galactic adventure';

      // Calculate level progression
      const topLevel = args.structure === 'oneShot' ? startLevel + 1 :
                       args.structure === 'brief' ? Math.min(startLevel + 4, 20) :
                       args.structure === 'extended' ? Math.min(startLevel + 12, 20) :
                       20;

      // Build threat guidance if provided
      let threatSection = '';
      if (args.threat && THREATS[args.threat]) {
        const threat = THREATS[args.threat];
        threatSection = `
## Primary Threat: ${threat.name}

**Description:** ${threat.description}

### GM Guidance
${threat.gmGuidance.map(g => `- ${g}`).join('\n')}

### Typical Foes
${threat.typicalFoes.join(', ')}

### Secret Themes
${threat.secretThemes.map(s => `- ${s}`).join('\n')}
`;
      }

      // Story arc elements
      const arcGuidance = STORY_ARC_ELEMENTS.map(el =>
        `### ${el.name}\n${el.description}\n- ${el.examples[0]}`
      ).join('\n\n');

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Campaign Plan: ${structure.name}

## Campaign Overview
**Structure:** ${structure.name}
**Adventures:** ${structure.adventures}
**Level Progression:** ${startLevel} → ${topLevel}
**Timeframe:** ${structure.timeFrame}
**Theme:** ${theme}

**Description:** ${structure.description}

## Recommended Adventure Types
${structure.adventureTypes.map(t => `- ${t}`).join('\n')}
${threatSection}
## Story Arc Guidance

${arcGuidance}

## Villain Questions to Answer
${VILLAIN_MOTIVATIONS.map(v =>
  `### ${v.category}\n${v.questions.map(q => `- ${q}`).join('\n')}`
).join('\n\n')}

## Linking Adventures
${ADVENTURE_LINKING_TIPS.slice(0, 5).map(tip => `- ${tip}`).join('\n')}

## Next Steps
1. Use \`planSF2eAdventure\` to design each adventure
2. Use \`generateSF2eStoryArc\` to create connecting plot threads
3. Use \`suggestSF2eNPCs\` to populate with recurring characters`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error planning SF2e campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// planSF2eAdventure - Plan a single adventure using GM Core adventure styles
server.tool(
  'planSF2eAdventure',
  'Plan a Starfinder 2e adventure using GM Core adventure styles (exploration, horror, intrigue, etc.).',
  {
    style: z.enum(['exploration', 'dystopian', 'horror', 'infiltration', 'intrigue', 'military', 'mystery', 'planar', 'romantic', 'spaceOpera']).describe('Adventure style'),
    partyLevel: z.number().min(1).max(20).describe('Party level for this adventure'),
    threat: z.enum(['corruption', 'devastation', 'extremism', 'mayhem', 'subjugation']).optional().describe('Threat type for the adventure')
  },
  async (args) => {
    try {
      const advStyle = ADVENTURE_STYLES[args.style];
      const encounters = advStyle.combatEncounters;

      // Build threat section if provided
      let threatSection = '';
      if (args.threat && THREATS[args.threat]) {
        const threat = THREATS[args.threat];
        threatSection = `
## Threat: ${threat.name}

**Description:** ${threat.description}

### GM Guidance
${threat.gmGuidance.slice(0, 4).map(g => `- ${g}`).join('\n')}

### Suggested Foes
${threat.typicalFoes.join(', ')}
`;
      }

      // Find matching scene template if available
      const sceneTemplate = SCENE_TEMPLATES.find(t => t.style === args.style);
      let sceneSection = '';
      if (sceneTemplate) {
        sceneSection = `
## Scene Structure
${sceneTemplate.sceneTypes.map(st =>
  `### ${st.type} (${st.count})\n${st.examples.map(e => `- ${e}`).join('\n')}`
).join('\n\n')}
`;
      }

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Adventure Plan: ${advStyle.name}

## Overview
**Style:** ${advStyle.name}
**Sessions:** ${advStyle.sessions}
**Party Level:** ${args.partyLevel}
${threatSection}
## Exploration Scenes
${advStyle.explorationScenes.map(s => `- ${s}`).join('\n')}

## Combat Encounters
| Difficulty | Count | XP Each | Total XP |
|------------|-------|---------|----------|
| Trivial | ${encounters.trivial} | 40 | ${encounters.trivial * 40} |
| Low | ${encounters.low} | 60 | ${encounters.low * 60} |
| Moderate | ${encounters.moderate} | 80 | ${encounters.moderate * 80} |
| Severe | ${encounters.severe} | 120 | ${encounters.severe * 120} |
| Extreme | ${encounters.extreme || 0} | 160 | ${(encounters.extreme || 0) * 160} |

${encounters.notes ? `**Combat Notes:** ${encounters.notes}` : ''}

## Roleplay Encounters
${advStyle.roleplayEncounters.map(s => `- ${s}`).join('\n')}

## Encounter Tropes
${advStyle.encounterTropes.map(s => `- ${s}`).join('\n')}
${sceneSection}
## Next Steps
1. Use \`buildSF2eEncounter\` to create specific encounters
2. Use \`generateSF2eSecrets\` for mysteries and clues
3. Use \`suggestSF2eNPCs\` for key characters`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error planning SF2e adventure: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// generateSF2eStoryArc - Generate story arc elements
server.tool(
  'generateSF2eStoryArc',
  'Generate story arc elements for a Starfinder 2e campaign. Creates motifs, escalation, and recurring elements.',
  {
    arcLength: z.enum(['short', 'medium', 'long']).describe('Arc length: short (2-3 sessions), medium (5-8), long (full campaign)'),
    theme: z.string().optional().describe('Core theme of the arc'),
    threat: z.enum(['corruption', 'devastation', 'extremism', 'mayhem', 'subjugation']).optional().describe('Threat driving the arc')
  },
  async (args) => {
    try {
      const length = args.arcLength;
      const theme = args.theme || 'unknown threat';

      // Get threat info if provided
      let threatSection = '';
      if (args.threat && THREATS[args.threat]) {
        const threat = THREATS[args.threat];
        threatSection = `
## Arc Threat: ${threat.name}

**Description:** ${threat.description}

### How to Show Progress Against This Threat
${threat.gmGuidance.slice(-2).map(g => `- ${g}`).join('\n')}
`;
      }

      // Build story arc guidance
      const arcElements = STORY_ARC_ELEMENTS.map(el =>
        `### ${el.name}
${el.description}

**Examples:**
${el.examples.map(e => `- ${e}`).join('\n')}`
      ).join('\n\n');

      // Villain motivation guidance
      const villainSection = VILLAIN_MOTIVATIONS.map(v =>
        `**${v.category}**\n${v.examples.slice(0, 2).map(e => `- ${e}`).join('\n')}`
      ).join('\n\n');

      const sessionsMap = { short: '2-3', medium: '5-8', long: '12+' };

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Story Arc: ${theme}

## Arc Overview
**Length:** ${length} (${sessionsMap[length]} sessions)
**Theme:** ${theme}
${threatSection}
## Story Arc Elements

${arcElements}

## Villain Development

${villainSection}

## Linking Adventures
${ADVENTURE_LINKING_TIPS.map(tip => `- ${tip}`).join('\n')}

## Arc Structure Suggestions

### ${length === 'short' ? 'Short Arc (2-3 sessions)' : length === 'medium' ? 'Medium Arc (5-8 sessions)' : 'Long Arc (Full Campaign)'}
${length === 'short' ? `
- Session 1: Introduction of threat, first clue discovered
- Session 2: Investigation escalates, stakes revealed
- Session 3: Confrontation and resolution` :
length === 'medium' ? `
- Sessions 1-2: Introduction and initial investigation
- Sessions 3-4: Escalation and complications
- Sessions 5-6: Major revelations and setbacks
- Sessions 7-8: Climax and resolution` :
`
- Act 1 (Sessions 1-4): Introduction, world establishment
- Act 2 (Sessions 5-8): Rising action, stakes increase
- Act 3 (Sessions 9-12): Complications, dark moment
- Act 4 (Sessions 13+): Climax and aftermath`}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e story arc: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// suggestSF2eNPCs - Suggest NPCs for adventures
server.tool(
  'suggestSF2eNPCs',
  'Suggest NPC archetypes for Starfinder 2e adventures based on GM Core guidance. Creates thematically appropriate characters.',
  {
    threat: z.enum(['corruption', 'devastation', 'extremism', 'mayhem', 'subjugation']).optional().describe('Threat type to connect NPCs to'),
    roles: z.array(z.enum(['ally', 'questgiver', 'rival', 'wildcard', 'innocent'])).optional().describe('Specific roles to generate'),
    count: z.number().min(1).max(10).optional().describe('Number of NPCs (default: 5)')
  },
  async (args) => {
    try {
      const threatType = args.threat;
      const requestedRoles = args.roles || ['ally', 'questgiver', 'rival', 'wildcard', 'innocent'];
      const count = Math.min(args.count || 5, requestedRoles.length);

      // Map role names to archetype keys
      const roleMap: Record<string, string> = {
        ally: 'The Ally',
        questgiver: 'The Questgiver',
        rival: 'The Rival',
        wildcard: 'The Wild Card',
        innocent: 'The Innocent'
      };

      const npcs: string[] = [];
      for (let i = 0; i < count; i++) {
        const roleName = requestedRoles[i % requestedRoles.length];
        const archetype = NPC_ARCHETYPES.find(a => a.role === roleMap[roleName]);

        if (archetype) {
          const variation = archetype.variations[Math.floor(Math.random() * archetype.variations.length)];
          const connection = threatType && archetype.connectionToTheme[threatType]
            ? archetype.connectionToTheme[threatType]
            : 'Connected to the main plot';

          npcs.push(`### ${archetype.role}
**Concept:** ${variation}
**Role:** ${archetype.description}
**Connection:** ${connection}`);
        }
      }

      // Threat section if provided
      let threatSection = '';
      if (threatType && THREATS[threatType]) {
        const threat = THREATS[threatType];
        threatSection = `
## Threat Context: ${threat.name}

**Description:** ${threat.description}

These NPCs should reflect or respond to this threat in their motivations and actions.
`;
      }

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e NPC Suggestions
${threatSection}
## NPCs

${npcs.join('\n\n')}

## NPC Development Tips

### Making NPCs Memorable
- Give each a distinct voice, mannerism, or speech pattern
- Connect them to PC backgrounds or goals
- Let them have their own agenda beyond helping/hindering PCs
- Show them affected by world events

### Recurring NPCs
- Have them appear in similar circumstances each time
- Let their relationship with PCs evolve based on interactions
- Give them their own story arc that intersects with the campaign`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error suggesting SF2e NPCs: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// =============================================================================
// SF2E SETTLEMENT BUILDING TOOLS
// =============================================================================

// planSF2eSettlement - Plan a settlement using GM Core guidance
server.tool(
  'planSF2eSettlement',
  'Plan a Starfinder 2e settlement using GM Core guidance. Define role, size, existence reason, and cultural hallmarks.',
  {
    role: z.enum(['homeBase', 'questHub', 'adventureOrigin', 'distantCapital', 'waystation', 'hostileTerritory', 'mysteryLocation']).describe('Campaign role of the settlement'),
    size: z.enum(['outpost', 'village', 'town', 'city', 'metropolis', 'megacity', 'megaplex']).optional().describe('Settlement size category'),
    existenceReason: z.enum(['resourceExtraction', 'strategicLocation', 'historicalContinuity', 'refuge', 'scientific', 'manufacturing', 'tourism']).optional().describe('Why the settlement exists'),
    name: z.string().optional().describe('Settlement name (will generate suggestions if not provided)')
  },
  async (args) => {
    try {
      const role = SETTLEMENT_ROLES[args.role];
      const size = args.size ? SETTLEMENT_SIZES[args.size] : SETTLEMENT_SIZES.town;

      // Map existence reason keys to array indices
      const existenceReasonMap: Record<string, number> = {
        resourceExtraction: 0,
        strategicLocation: 1,
        historicalContinuity: 2,
        refuge: 3,
        scientific: 4,
        manufacturing: 5,
        tourism: 6
      };

      const existence = args.existenceReason
        ? SETTLEMENT_EXISTENCE_REASONS[existenceReasonMap[args.existenceReason]]
        : SETTLEMENT_EXISTENCE_REASONS[Math.floor(Math.random() * SETTLEMENT_EXISTENCE_REASONS.length)];

      // Select random cultural hallmarks
      const hallmarks = CULTURAL_HALLMARKS
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(h => {
          const example = h.examples[Math.floor(Math.random() * h.examples.length)];
          return `**${h.category}:** ${example}`;
        });

      // Generate name suggestions if not provided
      const nameSuggestions = !args.name ? `
## Name Suggestions
- ${['New', 'Port', 'Fort', 'Station', 'Hub'][Math.floor(Math.random() * 5)]} ${['Haven', 'Prospect', 'Frontier', 'Hope', 'Dawn'][Math.floor(Math.random() * 5)]}
- ${['Stellar', 'Drift', 'Void', 'Star', 'Nova'][Math.floor(Math.random() * 5)]}${['gate', 'port', 'hold', 'reach', 'fall'][Math.floor(Math.random() * 5)]}
- The ${['Wayward', 'Distant', 'Final', 'First', 'Lost'][Math.floor(Math.random() * 5)]} ${['Station', 'Colony', 'Outpost', 'Settlement', 'Port'][Math.floor(Math.random() * 5)]}
` : '';

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Settlement Plan${args.name ? `: ${args.name}` : ''}
${nameSuggestions}
## Campaign Role: ${role.name}

${role.description}

### Examples
${role.examples.map(e => `- ${e}`).join('\n')}

### Typical Features
${role.typicalFeatures.map(f => `- ${f}`).join('\n')}

## Size: ${size.name}

**Population:** ${size.population}
**Service Level:** ${size.serviceLevel}

${size.description}

### Typical Features
${size.typicalFeatures.map(f => `- ${f}`).join('\n')}

## Existence Reason: ${existence.reason}

${existence.description}

### Implications
${existence.implications.map(i => `- ${i}`).join('\n')}

### Vulnerabilities (Adventure Hooks)
${existence.vulnerabilities.map(v => `- ${v}`).join('\n')}

## Cultural Hallmarks
${hallmarks.join('\n')}

## Mapping Steps
${SETTLEMENT_MAPPING_STEPS.map(s => `**${s.step}. ${s.name}:** ${s.description}`).join('\n\n')}

## Design Reminders
${CULTURE_DESIGN_GUIDANCE.slice(0, 3).map(g => `- ${g}`).join('\n')}

## Next Steps
1. Use \`generateSF2eDistricts\` to create the settlement's districts
2. Use \`generateSF2eLandmarks\` to add memorable locations
3. Use \`generateSF2eSettlementHooks\` for adventure hooks`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error planning SF2e settlement: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// generateSF2eDistricts - Generate districts for a settlement
server.tool(
  'generateSF2eDistricts',
  'Generate districts for a Starfinder 2e settlement. Creates varied neighborhoods with atmosphere and encounter types.',
  {
    settlementSize: z.enum(['outpost', 'village', 'town', 'city', 'metropolis', 'megacity', 'megaplex']).describe('Settlement size determines number of districts'),
    requiredTypes: z.array(z.enum(['oldTown', 'commercial', 'industrial', 'residential', 'entertainment', 'spaceport', 'government', 'scientific', 'underworld', 'alien'])).optional().describe('Specific district types to include'),
    theme: z.string().optional().describe('Overall settlement theme to influence district selection')
  },
  async (args) => {
    try {
      // Determine number of districts based on size
      const districtCounts: Record<string, number> = {
        outpost: 2,
        village: 3,
        town: 4,
        city: 6,
        metropolis: 8,
        megacity: 10,
        megaplex: 12
      };

      const count = districtCounts[args.settlementSize];
      const allTypes = Object.keys(DISTRICT_TYPES);

      // Start with required types, fill remainder randomly
      const selectedTypes: string[] = args.requiredTypes ? [...args.requiredTypes] : [];
      const remaining = allTypes.filter(t => !selectedTypes.includes(t));

      while (selectedTypes.length < count && remaining.length > 0) {
        const idx = Math.floor(Math.random() * remaining.length);
        selectedTypes.push(remaining[idx]);
        remaining.splice(idx, 1);
      }

      const districts = selectedTypes.map((type, index) => {
        const district = DISTRICT_TYPES[type];
        const location = district.typicalLocations[Math.floor(Math.random() * district.typicalLocations.length)];
        const encounter = district.encounterTypes[Math.floor(Math.random() * district.encounterTypes.length)];

        return `### District ${index + 1}: ${district.name}

**Atmosphere:** ${district.atmosphere}

**Key Location:** ${location}

**Potential Encounter:** ${encounter}

${district.description}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Settlement Districts

**Settlement Size:** ${args.settlementSize}
**District Count:** ${count}
${args.theme ? `**Theme:** ${args.theme}` : ''}

${districts.join('\n\n---\n\n')}

## District Connections
Consider how these districts relate to each other:
- Which districts are adjacent?
- What transportation connects them?
- Where do different social classes interact?
- What boundaries (physical or social) separate them?

## Using Districts in Play
- Each district should feel distinct when described
- NPCs from different districts have different concerns
- Chase scenes can cross district boundaries dramatically
- Economic or political plots can span multiple districts`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e districts: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// generateSF2eLandmarks - Generate memorable landmarks
server.tool(
  'generateSF2eLandmarks',
  'Generate memorable landmarks for a Starfinder 2e settlement. Creates evocatively named locations with adventure hook potential.',
  {
    count: z.number().min(1).max(10).optional().describe('Number of landmarks to generate (default: 5)'),
    types: z.array(z.string()).optional().describe('Specific landmark types to include'),
    settlementTheme: z.string().optional().describe('Settlement theme to influence landmark style')
  },
  async (args) => {
    try {
      const count = args.count || 5;

      // Select landmark templates
      const templates = [...LANDMARK_TEMPLATES]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      // Generate evocative names and details
      const adjectives = ['Crimson', 'Silent', 'Eternal', 'Forgotten', 'Shattered', 'Gilded', 'Hollow', 'Burning', 'Crystal', 'Iron'];
      const celestials = ['Star', 'Moon', 'Sun', 'Void', 'Nebula', 'Comet', 'Eclipse', 'Pulsar'];
      const abstracts = ['Hope', 'Memory', 'Truth', 'Shadow', 'Light', 'Time', 'Dreams', 'Fate'];
      const founders = ['Varek', 'Korrin', 'Shalissa', 'Drenoth', 'Xylara', 'Meridian', 'Voss', 'Tarek'];

      const landmarks = templates.map((template, index) => {
        // Generate a name using the pattern
        const pattern = template.namePatterns[Math.floor(Math.random() * template.namePatterns.length)];
        const name = pattern
          .replace('[Adjective]', adjectives[Math.floor(Math.random() * adjectives.length)])
          .replace('[Celestial Object]', celestials[Math.floor(Math.random() * celestials.length)])
          .replace('[Abstract Concept]', abstracts[Math.floor(Math.random() * abstracts.length)])
          .replace('[Founder]', founders[Math.floor(Math.random() * founders.length)])
          .replace('[Noun]', ['Beacon', 'Archive', 'Nexus', 'Sanctum', 'Vault'][Math.floor(Math.random() * 5)])
          .replace('[Event]', ['Founding', 'Liberation', 'Silence', 'Convergence', 'Exodus'][Math.floor(Math.random() * 5)])
          .replace('[Hero]', founders[Math.floor(Math.random() * founders.length)])
          .replace('[Deity/Concept]', ['Triune', 'Desna', 'Iomedae', 'Progress', 'Unity'][Math.floor(Math.random() * 5)])
          .replace('[Building Type]', ['Sanctum', 'Spire', 'Cathedral', 'Temple', 'Shrine'][Math.floor(Math.random() * 5)])
          .replace('[Domain]', ['Stars', 'Void', 'Life', 'Order', 'Knowledge'][Math.floor(Math.random() * 5)])
          .replace('[Corporation]', ['Arabani', 'AbadarCorp', 'Sanjaval', 'Veskarium', 'Ulrikka'][Math.floor(Math.random() * 5)])
          .replace('[Industry]', ['Drift', 'Trade', 'Tech', 'Data', 'Arms'][Math.floor(Math.random() * 5)])
          .replace('[Venue Type]', ['Arena', 'Theater', 'Casino', 'Hall', 'Gardens'][Math.floor(Math.random() * 5)])
          .replace('[Famous Performer]', founders[Math.floor(Math.random() * founders.length)])
          .replace('[Color/Material]', ['Obsidian', 'Golden', 'Crystal', 'Neon', 'Chrome'][Math.floor(Math.random() * 5)])
          .replace('[Exotic Location]', ['Drift', 'Stellar', 'Void', 'Nebula', 'Orbital'][Math.floor(Math.random() * 5)])
          .replace('[Civilization]', ['Kishalee', 'Sivv', 'Ancient', 'Lost', 'Forgotten'][Math.floor(Math.random() * 5)])
          .replace('[Time Period]', ['Pre-Gap', 'Founding', 'Colonial', 'Ancient', 'Old'][Math.floor(Math.random() * 5)])
          .replace('[Direction/Destination]', ['Central', 'North', 'Orbital', 'Deep', 'Far'][Math.floor(Math.random() * 5)])
          .replace('[Natural Feature]', ['Falls', 'Spire', 'Canyon', 'Grove', 'Crater'][Math.floor(Math.random() * 5)])
          .replace('[Creature]', ['Dragon', 'Wyrm', "Giant's", 'Serpent', 'Phoenix'][Math.floor(Math.random() * 5)])
          .replace('[Color]', ['Azure', 'Crimson', 'Emerald', 'Silver', 'Obsidian'][Math.floor(Math.random() * 5)]);

        const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
        const hook = template.hookPotential[Math.floor(Math.random() * template.hookPotential.length)];

        return `### ${index + 1}. ${name}

**Type:** ${template.type}

**Description:** ${description}

**Adventure Hook:** ${hook}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Settlement Landmarks
${args.settlementTheme ? `**Settlement Theme:** ${args.settlementTheme}\n` : ''}
${landmarks.join('\n\n---\n\n')}

## Using Landmarks in Play

### As Meeting Points
- "Meet me at the ${templates[0] ? 'first landmark' : 'statue'} at midnight"
- Landmarks give directions context for players

### As Adventure Locations
- Each landmark has hook potential built in
- Landmarks can be destinations or scene settings
- Famous landmarks attract attention (good and bad)

### For Atmosphere
- Describe landmarks when the party enters the settlement
- Reference them in NPC dialogue
- Use them in chase scenes or dramatic moments`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e landmarks: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// generateSF2eSettlementHooks - Generate adventure hooks based on settlement features
server.tool(
  'generateSF2eSettlementHooks',
  'Generate adventure hooks for a Starfinder 2e settlement based on its features, economy, and culture.',
  {
    settlementRole: z.enum(['homeBase', 'questHub', 'adventureOrigin', 'distantCapital', 'waystation', 'hostileTerritory', 'mysteryLocation']).optional().describe('Campaign role of the settlement'),
    existenceReason: z.enum(['resourceExtraction', 'strategicLocation', 'historicalContinuity', 'refuge', 'scientific', 'manufacturing', 'tourism']).optional().describe('Why the settlement exists'),
    threat: z.enum(['corruption', 'devastation', 'extremism', 'mayhem', 'subjugation']).optional().describe('Threat type affecting the settlement'),
    count: z.number().min(1).max(10).optional().describe('Number of hooks to generate (default: 5)')
  },
  async (args) => {
    try {
      const count = args.count || 5;
      const hooks: string[] = [];

      // Get role-based hooks
      if (args.settlementRole && SETTLEMENT_ROLES[args.settlementRole]) {
        const role = SETTLEMENT_ROLES[args.settlementRole];
        hooks.push(`**Role-Based (${role.name}):** A key feature that makes this settlement a ${role.name.toLowerCase()} is threatened or changing.`);
      }

      // Get existence reason hooks
      if (args.existenceReason) {
        const reasonMap: Record<string, number> = {
          resourceExtraction: 0, strategicLocation: 1, historicalContinuity: 2,
          refuge: 3, scientific: 4, manufacturing: 5, tourism: 6
        };
        const existence = SETTLEMENT_EXISTENCE_REASONS[reasonMap[args.existenceReason]];
        const vulnerability = existence.vulnerabilities[Math.floor(Math.random() * existence.vulnerabilities.length)];
        hooks.push(`**Economic (${existence.reason}):** ${vulnerability}`);
      }

      // Get cultural hooks
      const culturalHooks = CULTURAL_HALLMARKS
        .flatMap(h => h.questHooks)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      culturalHooks.forEach(h => hooks.push(`**Cultural:** ${h}`));

      // Get threat-based hooks if provided
      if (args.threat && THREATS[args.threat]) {
        const threat = THREATS[args.threat];
        const secretTheme = threat.secretThemes[Math.floor(Math.random() * threat.secretThemes.length)];
        hooks.push(`**Threat (${threat.name}):** ${secretTheme}`);
      }

      // Add economic factor hooks
      const economicHook = ECONOMIC_FACTORS[Math.floor(Math.random() * ECONOMIC_FACTORS.length)];
      const implication = economicHook.implications[Math.floor(Math.random() * economicHook.implications.length)];
      hooks.push(`**Economic Factor (${economicHook.factor}):** ${implication}`);

      // Fill remaining with district-based hooks
      const districtTypes = Object.values(DISTRICT_TYPES);
      while (hooks.length < count) {
        const district = districtTypes[Math.floor(Math.random() * districtTypes.length)];
        const encounter = district.encounterTypes[Math.floor(Math.random() * district.encounterTypes.length)];
        hooks.push(`**District (${district.name}):** ${encounter}`);
      }

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Settlement Adventure Hooks

${args.settlementRole ? `**Settlement Role:** ${SETTLEMENT_ROLES[args.settlementRole].name}` : ''}
${args.existenceReason ? `**Existence Reason:** ${args.existenceReason}` : ''}
${args.threat ? `**Active Threat:** ${THREATS[args.threat].name}` : ''}

## Adventure Hooks

${hooks.slice(0, count).map((hook, i) => `${i + 1}. ${hook}`).join('\n\n')}

## Connecting Hooks to Campaign

### Escalation
- Start with local problems that hint at larger issues
- Let resolved hooks reveal connections to others
- Build toward settlement-wide or system-wide stakes

### Character Connections
- Tie hooks to PC backgrounds and contacts
- Let NPC relationships complicate simple hooks
- Personal stakes make hooks more compelling

### Consequences
- Unresolved hooks worsen over time
- Resolved hooks change the settlement
- Both success and failure should matter`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e settlement hooks: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// =============================================================================
// SF2E HACKING SUBSYSTEM TOOLS
// =============================================================================

// buildSF2eComputer - Build a complete hackable computer stat block
server.tool(
  'buildSF2eComputer',
  'Build a hackable Starfinder 2e computer stat block with access points, vulnerabilities, countermeasures, and rewards.',
  {
    level: z.number().min(0).max(20).describe('Computer level (determines DCs)'),
    complexity: z.enum(['simple', 'complex']).describe('Simple (quick) or complex (multi-round)'),
    type: z.enum(['tech', 'magic', 'hybrid']).describe('Computer type determines hacking skills'),
    concept: z.string().optional().describe('Brief description of what the computer is/does'),
    accessPointCount: z.number().min(1).max(3).optional().describe('Number of access points (default: 1 for simple, 2 for complex)')
  },
  async (args) => {
    try {
      const dcs = getDCsForLevel(args.level);
      const compType = COMPUTER_TYPES[args.type];
      const complexity = COMPLEXITY_LEVELS[args.complexity];
      const apCount = args.accessPointCount || (args.complexity === 'simple' ? 1 : 2);

      // Select appropriate vulnerabilities based on computer type
      const typeVulnerabilities = VULNERABILITY_TEMPLATES.filter(v => {
        if (args.type === 'magic') return v.category === 'magical' || v.category === 'social';
        if (args.type === 'tech') return v.category === 'technical' || v.category === 'social' || v.category === 'physical';
        return true; // hybrid gets all
      });

      // Build access points
      const accessPoints: string[] = [];
      const apTypes = ACCESS_POINT_TYPES.filter(ap =>
        args.type === 'magic' ? ap.type === 'physical' :
        args.type === 'tech' ? true : true
      );

      for (let i = 0; i < apCount; i++) {
        const apType = apTypes[i % apTypes.length];
        const successesNeeded = args.complexity === 'simple' ? 1 : (i === 0 ? 1 : 2);
        const hackDC = i === 0 ? dcs.high : dcs.elite;
        const proficiency = args.level >= 5 ? 'trained' : '';

        // Select vulnerabilities for this access point
        const vulnCount = args.complexity === 'simple' ? 0 : (2 + Math.floor(Math.random() * 2));
        const selectedVulns = [...typeVulnerabilities]
          .sort(() => Math.random() - 0.5)
          .slice(0, vulnCount);

        const vulnStrings = selectedVulns.map(v => {
          const reduction = getVulnerabilityReduction(v.difficultyTier);
          const dc = v.difficultyTier === 'low' ? dcs.low :
                     v.difficultyTier === 'high' ? dcs.high : dcs.elite;
          return `${v.name} (DC ${dc} ${v.skills.slice(0, 2).join(' or ')}; –${reduction})`;
        });

        // Select countermeasures
        const cmCount = args.complexity === 'simple' ? 1 : (1 + Math.floor(Math.random() * 2));
        const selectedCMs = [...COUNTERMEASURE_TEMPLATES]
          .sort(() => Math.random() - 0.5)
          .slice(0, cmCount);

        const cmStrings = selectedCMs.map((cm, idx) => {
          const failures = args.complexity === 'simple' ? 2 : (2 + idx);
          const noticeDC = dcs.low;
          const disableDC = dcs.high;
          const persistentTag = cm.persistent ? '; persistent' : '';
          return `(${failures} Failures${persistentTag}) ${cm.effect}; Notice DC ${noticeDC} ${cm.noticeSkills.slice(0, 2).join(' or ')}; Disable DC ${disableDC} ${cm.disableSkills.slice(0, 2).join(' or ')}`;
        });

        accessPoints.push(`### Access Point ${i + 1}: ${apType.name}
**Type:** ${apType.type}
**Successes Required:** ${successesNeeded}
**Hack DC:** ${hackDC} ${compType.typicalHackingSkills.slice(0, 2).join(' or ')}${proficiency ? ` (${proficiency})` : ''}

${apType.description}

${vulnStrings.length > 0 ? `**Vulnerabilities:**\n${vulnStrings.map(v => `- ${v}`).join('\n')}` : '*No vulnerabilities (simple computer)*'}

**Countermeasures:**
${cmStrings.map(cm => `- ${cm}`).join('\n')}`);
      }

      // Select success rewards
      const rewards = SUCCESS_REWARDS
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      const successExamples = rewards.flatMap(r => r.examples.slice(0, 1));
      const critSuccessExamples = rewards.flatMap(r => r.examples.slice(1, 2));

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Computer Stat Block

## ${(args.concept || 'UNNAMED COMPUTER').toUpperCase()} — LEVEL ${args.level}
**Complexity:** ${complexity.name}
**Type:** ${compType.name}
**Traits:** ${compType.traits.join(', ')}

${args.concept ? `*${args.concept}*` : '*A hackable computer system.*'}

### Hacking Skills
${compType.typicalHackingSkills.join(', ')}

---

${accessPoints.join('\n\n---\n\n')}

---

### Rewards

**Critical Success:** ${critSuccessExamples.join('; also ')}. Additionally, gain a +2 circumstance bonus to related checks for 1 week.

**Success:** ${successExamples.join('; ')}

---

## DC Reference for Level ${args.level}
| Difficulty | DC |
|------------|-----|
| Low | ${dcs.low} |
| High | ${dcs.high} |
| Elite | ${dcs.elite} |

## Complexity Notes
${complexity.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error building SF2e computer: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// generateSF2eVulnerabilities - Generate vulnerabilities for a computer
server.tool(
  'generateSF2eVulnerabilities',
  'Generate creative vulnerabilities for a Starfinder 2e hackable computer. Includes skill DCs and DC reduction values.',
  {
    computerLevel: z.number().min(0).max(20).describe('Computer level for DC calculation'),
    computerType: z.enum(['tech', 'magic', 'hybrid']).optional().describe('Filter vulnerabilities by computer type'),
    count: z.number().min(1).max(10).optional().describe('Number of vulnerabilities (default: 5)'),
    categories: z.array(z.enum(['social', 'technical', 'physical', 'magical', 'unusual'])).optional().describe('Filter by vulnerability category')
  },
  async (args) => {
    try {
      const count = args.count || 5;
      const dcs = getDCsForLevel(args.computerLevel);

      // Filter vulnerabilities
      let vulnerabilities = [...VULNERABILITY_TEMPLATES];

      if (args.computerType) {
        vulnerabilities = vulnerabilities.filter(v => {
          if (args.computerType === 'magic') return v.category === 'magical' || v.category === 'social';
          if (args.computerType === 'tech') return v.category !== 'magical';
          return true;
        });
      }

      if (args.categories && args.categories.length > 0) {
        vulnerabilities = vulnerabilities.filter(v => args.categories!.includes(v.category as any));
      }

      // Select and format vulnerabilities
      const selected = vulnerabilities
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      const formatted = selected.map((v, i) => {
        const dc = v.difficultyTier === 'low' ? dcs.low :
                   v.difficultyTier === 'high' ? dcs.high : dcs.elite;
        const reduction = getVulnerabilityReduction(v.difficultyTier);

        return `### ${i + 1}. ${v.name}
**Category:** ${v.category}
**Difficulty:** ${v.difficultyTier} (DC ${dc})
**DC Reduction:** –${reduction}
**Skills:** ${v.skills.join(', ')}

${v.description}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Computer Vulnerabilities (Level ${args.computerLevel})

${args.computerType ? `**Computer Type:** ${args.computerType}\n` : ''}
${args.categories ? `**Categories:** ${args.categories.join(', ')}\n` : ''}

## DC Reference
| Difficulty | DC | Reduction |
|------------|-----|-----------|
| Low | ${dcs.low} | –1 |
| High | ${dcs.high} | –2 |
| Elite | ${dcs.elite} | –3 |

## Vulnerabilities

${formatted.join('\n\n---\n\n')}

## Usage Notes
- DC reductions are cumulative
- Total reduction should never bring Hack DC below the low DC (${dcs.low})
- Each round without attempting Hack accrues 1 failure
- Exploiting vulnerabilities takes actions that could be spent on Hack attempts`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e vulnerabilities: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// generateSF2eCountermeasures - Generate countermeasures for a computer
server.tool(
  'generateSF2eCountermeasures',
  'Generate countermeasures for a Starfinder 2e hackable computer. Includes failure thresholds, Notice/Disable DCs.',
  {
    computerLevel: z.number().min(0).max(20).describe('Computer level for DC calculation'),
    count: z.number().min(1).max(6).optional().describe('Number of countermeasures (default: 3)'),
    severity: z.enum(['minor', 'moderate', 'severe', 'mixed']).optional().describe('Filter by severity level'),
    includePersistent: z.boolean().optional().describe('Include persistent countermeasures that trigger each round')
  },
  async (args) => {
    try {
      const count = args.count || 3;
      const dcs = getDCsForLevel(args.computerLevel);

      // Filter countermeasures
      let countermeasures = [...COUNTERMEASURE_TEMPLATES];

      if (args.severity && args.severity !== 'mixed') {
        countermeasures = countermeasures.filter(cm => cm.severity === args.severity);
      }

      if (args.includePersistent === false) {
        countermeasures = countermeasures.filter(cm => !cm.persistent);
      }

      // Select and format countermeasures
      const selected = countermeasures
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      const formatted = selected.map((cm, i) => {
        const failures = 2 + i; // Escalating failure thresholds
        const noticeDC = cm.severity === 'minor' ? dcs.low :
                         cm.severity === 'moderate' ? dcs.low : dcs.high;
        const disableDC = cm.severity === 'minor' ? dcs.high :
                          cm.severity === 'moderate' ? dcs.high : dcs.elite;

        return `### ${i + 1}. ${cm.name}
**Severity:** ${cm.severity}
**Persistent:** ${cm.persistent ? 'Yes (triggers each round until disabled)' : 'No'}
**Trigger:** ${failures} Failures

**Effect:** ${cm.effect}

**Notice:** DC ${noticeDC} ${cm.noticeSkills.join(' or ')}
**Disable:** DC ${disableDC} ${cm.disableSkills.join(' or ')}

*${cm.description}*`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Computer Countermeasures (Level ${args.computerLevel})

## DC Reference
| Check | Minor | Moderate | Severe |
|-------|-------|----------|--------|
| Notice | ${dcs.low} | ${dcs.low} | ${dcs.high} |
| Disable | ${dcs.high} | ${dcs.high} | ${dcs.elite} |

## Countermeasures

${formatted.join('\n\n---\n\n')}

## Usage Notes
- Countermeasures trigger when failure threshold is reached
- **Persistent** countermeasures trigger again at end of each round until disabled
- Disabling a persistent countermeasure prevents future triggers but doesn't undo previous effects
- Notice DC is typically lower than Disable DC
- Critical failures on Hack checks accrue 2 failures instead of 1`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error generating SF2e countermeasures: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// planSF2eHackingEncounter - Plan a complete hacking encounter
server.tool(
  'planSF2eHackingEncounter',
  'Plan a complete Starfinder 2e hacking encounter with computer, context, party roles, and integration tips.',
  {
    computerLevel: z.number().min(0).max(20).describe('Computer level'),
    concept: z.enum(['corporate', 'security', 'personal', 'military', 'magical', 'financial', 'media', 'custom']).describe('Type of computer/system being hacked'),
    partyLevel: z.number().min(1).max(20).optional().describe('Party level for difficulty assessment'),
    timeConstraint: z.boolean().optional().describe('Is there time pressure during the hack?'),
    combatIntegration: z.boolean().optional().describe('Is hacking happening during combat?')
  },
  async (args) => {
    try {
      const dcs = getDCsForLevel(args.computerLevel);
      const partyLevel = args.partyLevel || args.computerLevel;
      const levelDiff = args.computerLevel - partyLevel;

      // Select a concept template
      const conceptMap: Record<string, string> = {
        corporate: 'Corporate Database',
        security: 'Security Terminal',
        personal: 'Personal Comm Unit',
        military: 'Military Command System',
        magical: 'Aeon Stone Computer',
        financial: 'Bank Account Server',
        media: 'Media Server',
        custom: 'Custom System'
      };

      const conceptTemplate = COMPUTER_CONCEPTS.find(c =>
        c.name.toLowerCase().includes(args.concept) ||
        conceptMap[args.concept]?.toLowerCase().includes(c.name.toLowerCase())
      ) || COMPUTER_CONCEPTS[0];

      // Determine complexity based on context
      const complexity = args.combatIntegration ? 'simple' : 'complex';
      const compType = conceptTemplate.suggestedType;

      // Get appropriate vulnerabilities and countermeasures
      const vulns = VULNERABILITY_TEMPLATES
        .filter(v => conceptTemplate.thematicVulnerabilities.some(tv =>
          v.name.toLowerCase().includes(tv.toLowerCase()) ||
          tv.toLowerCase().includes(v.category)
        ))
        .slice(0, 3);

      const cms = COUNTERMEASURE_TEMPLATES
        .filter(cm => conceptTemplate.thematicCountermeasures.some(tcm =>
          cm.name.toLowerCase().includes(tcm.toLowerCase()) ||
          tcm.toLowerCase().includes(cm.name.toLowerCase())
        ))
        .slice(0, 2);

      // Build party role suggestions
      const partyRoles = `
## Party Roles in Hacking

### Primary Hacker
- Makes the actual Hack checks
- Should have highest relevant skill (${COMPUTER_TYPES[compType].typicalHackingSkills[0]})
- Goes last each round to benefit from vulnerability exploitation

### Vulnerability Exploiters
- Use varied skills to lower the Hack DC
- Social characters: Deception, Diplomacy, Intimidation
- Technical characters: Crafting, Thievery
- Physical characters: Athletics, Acrobatics, Stealth
- Magic characters: Arcana, Occultism, Religion

### Countermeasure Watchers
- Use Perception to Notice countermeasures
- Ready to Disable before they trigger
- May need to handle physical security responses`;

      // Build timing guidance
      const timingGuidance = args.timeConstraint ? `
## Time Pressure

With time constraints active:
- Each round represents roughly 1 minute of in-game time
- Consider adding environmental pressure (guards approaching, system lockout timer)
- Failing to attempt Hack each round still accrues 1 failure
- May need to balance thoroughness with speed` : `
## Timing (No Pressure)

Without time constraints:
- Allow players to methodically exploit vulnerabilities
- Can allow extra failures before countermeasures trigger
- Consider letting players "Take 20" on some checks
- Focus on the narrative of the hack rather than round-by-round`;

      // Build combat integration if needed
      const combatGuidance = args.combatIntegration ? `
## Combat Integration

During combat encounters:
- Use simplified quick hacking: each support check lowers DC by 1 (2 on crit success, raises by 1 on crit fail)
- Hacking is a 2-action activity
- Limit to single access point with basic countermeasure
- Success should provide immediate tactical benefit (disable turret, open door, etc.)
- Consider having the computer as a "target" enemies try to protect` : '';

      // Difficulty assessment
      const difficultyAssessment = levelDiff <= -3 ? 'Trivial - consider adding complications' :
                                   levelDiff <= -1 ? 'Easy - good for time pressure scenarios' :
                                   levelDiff <= 1 ? 'Moderate - balanced challenge' :
                                   levelDiff <= 3 ? 'Hard - may need multiple attempts' :
                                   'Very Hard - consider providing advantages';

      return {
        content: [{
          type: "text" as const,
          text: `# SF2e Hacking Encounter Plan

## Overview
**Concept:** ${conceptTemplate.name}
**Level:** ${args.computerLevel} (Party Level ${partyLevel}: ${difficultyAssessment})
**Complexity:** ${complexity}
**Type:** ${COMPUTER_TYPES[compType].name}

${conceptTemplate.description}

## DC Summary
| Check Type | DC |
|------------|-----|
| Hack (High) | ${dcs.high} |
| Hack (Elite) | ${dcs.elite} |
| Notice Countermeasure | ${dcs.low} |
| Disable Countermeasure | ${dcs.high}-${dcs.elite} |
| Exploit Vulnerability | ${dcs.low}-${dcs.elite} |

## Thematic Vulnerabilities
${conceptTemplate.thematicVulnerabilities.map(v => `- ${v}`).join('\n')}

## Thematic Countermeasures
${conceptTemplate.thematicCountermeasures.map(c => `- ${c}`).join('\n')}

## Suggested Rewards
${SUCCESS_REWARDS.slice(0, 2).map(r => `**${r.category}:** ${r.examples[0]}`).join('\n')}
${partyRoles}
${timingGuidance}
${combatGuidance}

## Next Steps
1. Use \`buildSF2eComputer\` to generate the full stat block
2. Use \`generateSF2eVulnerabilities\` for additional vulnerability options
3. Use \`generateSF2eCountermeasures\` to customize security responses

## Quick Stat Block

**${conceptTemplate.name.toUpperCase()}** — LEVEL ${args.computerLevel}
${complexity.toUpperCase()} ${COMPUTER_TYPES[compType].traits.map(t => t.toUpperCase()).join(' ')}

**Access Point** (${complexity === 'simple' ? 'physical' : 'remote'}; ${complexity === 'simple' ? 1 : 2} Success${complexity === 'simple' ? '' : 'es'}) DC ${dcs.high} ${COMPUTER_TYPES[compType].typicalHackingSkills.slice(0, 2).join(' or ')}${args.computerLevel >= 5 ? ' (trained)' : ''}

**Countermeasures** (2 Failures) System locks out user; Notice DC ${dcs.low} Perception; Disable DC ${dcs.high} ${COMPUTER_TYPES[compType].typicalHackingSkills[0]}

**Success** Gain access to ${conceptTemplate.name.toLowerCase()} functions and data.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error planning SF2e hacking encounter: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);

// Connect to transport
const transport = new StdioServerTransport();
await server.connect(transport);
