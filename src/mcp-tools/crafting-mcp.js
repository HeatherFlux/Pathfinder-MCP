/**
 * MCP Tool for Pathfinder 2e Crafting Calculator
 */
import { getPathfinderCraftingRequirements } from '../handlers/crafting-handler.ts';

/**
 * MCP Tool definition for calculating crafting requirements
 */
export const calculateCraftingRequirements = {
  schema: {
    name: "mcp_calculateCraftingRequirements",
    description: "Calculate crafting requirements for a Pathfinder 2e item including DC, time, materials, and success chances. IMPORTANT: After receiving results, provide your own response to the user.",
    parameters: {
      type: "object",
      required: ["category", "name"],
      properties: {
        category: {
          type: "string",
          description: "The category of the item (e.g., 'equipment', 'weapon', 'armor')",
          enum: ["equipment", "weapon", "armor", "shield", "consumable", "other"]
        },
        name: {
          type: "string",
          description: "The name of the item to calculate crafting requirements for",
          minLength: 1
        },
        characterLevel: {
          type: "integer",
          description: "The level of the character doing the crafting (1-20)",
          default: 1,
          minimum: 1,
          maximum: 20
        },
        proficiency: {
          type: "string",
          description: "The character's proficiency level in Crafting",
          enum: ["untrained", "trained", "expert", "master", "legendary"],
          default: "trained"
        },
        feats: {
          type: "array",
          description: "Crafting-related feats the character has (optional)",
          items: {
            type: "string"
          },
          default: []
        },
        useComplexCrafting: {
          type: "boolean",
          description: "Whether to use complex crafting rules from supplements",
          default: false
        },
        rushDays: {
          type: "integer",
          description: "Number of days to rush crafting (increases DC)",
          default: 0,
          minimum: 0
        }
      }
    }
  },
  handler: async (params) => {
    return await getPathfinderCraftingRequirements(params);
  }
};

/**
 * Export all MCP tools from this module
 */
export default {
  calculateCraftingRequirements
}; 