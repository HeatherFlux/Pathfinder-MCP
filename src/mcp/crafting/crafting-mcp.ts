/**
 * MCP Tool for Pathfinder 2e Crafting Calculator
 */
import { getPathfinderCraftingRequirements } from './crafting-controller.js';

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
          description: "The category of item (weapon, armor, equipment, shield, alchemical, magical)",
          enum: ["weapon", "armor", "equipment", "shield", "alchemical", "magical"]
        },
        name: {
          type: "string",
          description: "The name of the item to craft",
          minLength: 1
        },
        characterLevel: {
          type: "integer",
          description: "The character's level (1-20)",
          default: 1,
          minimum: 1,
          maximum: 20
        },
        proficiency: {
          type: "string",
          description: "The character's crafting proficiency",
          enum: ["untrained", "trained", "expert", "master", "legendary"],
          default: "trained"
        },
        feats: {
          type: "array",
          description: "List of crafting-related feats the character has",
          items: {
            type: "string",
            enum: [
              "Alchemical Crafting",
              "Magical Crafting", 
              "Specialty Crafting", 
              "Snare Crafting",
              "Impeccable Crafting",
              "Inventor",
              "Quick Craft",
              "Efficient Crafting"
            ]
          },
          default: []
        },
        useComplexCrafting: {
          type: "boolean",
          description: "Whether to use complex crafting rules or simplified ones",
          default: false
        },
        rushDays: {
          type: "integer",
          description: "Number of days to rush crafting by (increases DC)",
          default: 0,
          minimum: 0
        }
      }
    }
  },
  /**
   * Handler function that processes the crafting requirements calculation request
   * @param {Parameters<typeof getPathfinderCraftingRequirements>[0]} params - The parameters for calculating crafting requirements
   * @returns {Promise<ReturnType<typeof getPathfinderCraftingRequirements>>} A promise that resolves to the crafting requirements calculation result
   */
  handler: async (params: Parameters<typeof getPathfinderCraftingRequirements>[0]): Promise<ReturnType<typeof getPathfinderCraftingRequirements>> => {
    return await getPathfinderCraftingRequirements(params);
  }
};

/**
 * Export the crafting tool configuration
 */
export default {
  name: 'pathfinder_crafting',
  description: 'Calculate crafting requirements for Pathfinder 2e items including DC, time, materials, and success chances.',
  functions: [calculateCraftingRequirements]
}; 