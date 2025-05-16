/**
 * Type definition for the crafting tool module
 */

export interface CraftingParams {
  category: string;
  name: string;
  characterLevel: number;
  proficiency: string;
  feats?: string[];
  useComplexCrafting?: boolean;
  rushDays?: number;
}

export interface CraftingResult {
  itemName: string;
  itemLevel: number;
  itemPrice: string;
  itemRarity: string;
  item: {
    name: string;
    level: number;
    price: number;
    rarity: string;
    category: string;
    isConsumable: boolean;
    url?: string;
  };
  prerequisites: {
    meetsLevelRequirement: boolean;
    meetsProficiencyRequirement: boolean;
    requiredFeats: string[];
    hasRequiredFeats: boolean;
    missingFeats: string[];
  };
  crafting: {
    initialDays: number;
    materialCost: number;
    dc: number;
    rushPenalty: number;
    dailyReduction: number;
    criticalDailyReduction: number;
    daysToFree: number;
    criticalDaysToFree: number;
  };
  success: {
    critical: string;
    success: string;
    failure: string;
    criticalFailure: string;
  };
  tips: string[];
}

export interface CraftingToolFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    required: string[];
    properties: Record<string, unknown>;
  };
  handler: (params: CraftingParams) => Promise<CraftingResult>;
}

export interface CraftingTool {
  name: string;
  description: string;
  functions: CraftingToolFunction[];
}

export function getPathfinderCraftingRequirements(params: CraftingParams): Promise<CraftingResult>;
export const craftingTool: CraftingTool; 