import TreasureGenerator from '../../utils/treasure-generator.js';

/**
 * Generate appropriate treasure for a Pathfinder 2e party
 * 
 * @param {object} params - The function parameters
 * @param {number} [params.partyLevel=1] - The level of the party (1-20)
 * @param {number} [params.partySize=4] - The number of players in the party (1-8)
 * @param {boolean} [params.isSandbox=false] - Whether this is a sandbox/megadungeon campaign (adds extra treasure)
 * @returns {Promise<object>} A response object with formatted content
 */
export default async function generateTreasure(
  params: {
    partyLevel?: number;
    partySize?: number;
    isSandbox?: boolean;
  }
): Promise<{content: Array<{type: string, text: string}>}> {
  // Extract parameters with defaults
  const {
    partyLevel = 1,
    partySize = 4,
    isSandbox = false
  } = params;
  
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
} 