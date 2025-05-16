/**
 * Type definition for the crafting handler module
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

export function getPathfinderCraftingRequirements(params: CraftingParams): Promise<any>; 