import { CraftingRequirements } from "./crafting-calculator.js";

/**
 * Format crafting requirements into a readable string
 * @param {CraftingRequirements} requirements - The crafting requirements
 * @returns {string} Formatted crafting requirements
 */
export function formatCraftingRequirements(requirements: CraftingRequirements): string {
  if (!requirements) {
    return "No crafting requirements available.";
  }

  const { item, prerequisites, crafting, success } = requirements;
  
  // Start with the item details as title
  let result = `# Crafting: ${item.name} (Level ${item.level})\n\n`;
  
  // Item details section
  result += "## Item Details\n";
  result += `**Category:** ${item.category}\n`;
  result += `**Rarity:** ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}\n`;
  result += `**Price:** ${item.price} gp\n`;
  if (item.isConsumable) {
    result += "**Type:** Consumable\n";
  }
  if (item.url) {
    result += `**Reference:** [Archives of Nethys](${item.url})\n`;
  }
  
  // Prerequisites section
  result += "\n## Crafting Prerequisites\n";
  
  // Character level requirement
  if (prerequisites.meetsLevelRequirement) {
    result += "✅ **Character Level:** Sufficient\n";
  } else {
    result += "❌ **Character Level:** Insufficient (must be at least equal to item level)\n";
  }
  
  // Proficiency requirement
  if (prerequisites.meetsProficiencyRequirement) {
    result += "✅ **Proficiency Requirement:** Met\n";
  } else {
    if (item.level >= 16) {
      result += "❌ **Proficiency Requirement:** Legendary proficiency required (item level 16+)\n";
    } else if (item.level >= 9) {
      result += "❌ **Proficiency Requirement:** Master proficiency required (item level 9+)\n";
    }
  }
  
  // Required feats
  result += `**Required Feats:** ${prerequisites.requiredFeats.join(", ")}\n`;
  if (prerequisites.hasRequiredFeats) {
    result += "✅ Character has all required feats\n";
  } else {
    result += `❌ Missing feats: ${prerequisites.missingFeats.join(", ")}\n`;
  }
  
  // Crafting process section
  result += "\n## Crafting Process\n";
  result += `**Material Cost:** ${crafting.materialCost} gp (half the item's price)\n`;
  
  // Initial crafting time
  if (crafting.initialDays === 0.5) {
    result += "**Initial Crafting Time:** 4 hours\n";
  } else {
    result += `**Initial Crafting Time:** ${crafting.initialDays} day${crafting.initialDays !== 1 ? 's' : ''}\n`;
  }
  
  // DC information
  result += `**Crafting DC:** ${crafting.dc}`;
  if (crafting.rushPenalty > 0) {
    result += ` (includes +${crafting.rushPenalty} from rushing)\n`;
  } else {
    result += "\n";
  }
  
  // Daily cost reduction
  result += `**Daily Cost Reduction:** ${crafting.dailyReduction.toFixed(2)} gp per additional day (success)\n`;
  result += `**Critical Success Reduction:** ${crafting.criticalDailyReduction.toFixed(2)} gp per additional day\n`;
  
  // Days to craft for free
  result += `**Days to Completion (Success):** ${crafting.daysToFree} additional day${crafting.daysToFree !== 1 ? 's' : ''} to complete for free\n`;
  result += `**Days to Completion (Critical):** ${crafting.criticalDaysToFree} additional day${crafting.criticalDaysToFree !== 1 ? 's' : ''} to complete for free\n`;
  
  // Success outcomes section
  result += "\n## Possible Outcomes\n";
  result += `**Critical Success:** ${success.critical}\n`;
  result += `**Success:** ${success.success}\n`;
  result += `**Failure:** ${success.failure}\n`;
  result += `**Critical Failure:** ${success.criticalFailure}\n`;
  
  return result;
}

/**
 * Format crafting requirements into a compact summary string
 * @param {CraftingRequirements} requirements - The crafting requirements
 * @returns {string} Formatted crafting summary
 */
export function formatCraftingSummary(requirements: CraftingRequirements): string {
  if (!requirements) {
    return "No crafting requirements available.";
  }

  const { item, prerequisites, crafting } = requirements;
  
  // Start with the item name and level
  let result = `Crafting ${item.name} (Level ${item.level}): `;
  
  // Add prerequisites
  const failedPrereqs = [];
  
  if (!prerequisites.meetsLevelRequirement) {
    failedPrereqs.push("insufficient character level");
  }
  
  if (!prerequisites.meetsProficiencyRequirement) {
    if (item.level >= 16) {
      failedPrereqs.push("requires legendary proficiency");
    } else if (item.level >= 9) {
      failedPrereqs.push("requires master proficiency");
    }
  }
  
  if (!prerequisites.hasRequiredFeats) {
    failedPrereqs.push(`missing feats: ${prerequisites.missingFeats.join(", ")}`);
  }
  
  if (failedPrereqs.length === 0) {
    result += "All prerequisites met. ";
  } else {
    result += `Cannot craft: ${failedPrereqs.join("; ")}. `;
    return result;
  }
  
  // Add basic crafting info
  result += `Costs ${crafting.materialCost} gp in materials. `;
  
  if (crafting.initialDays === 0.5) {
    result += "Initial crafting time: 4 hours. ";
  } else {
    result += `Initial crafting time: ${crafting.initialDays} day${crafting.initialDays !== 1 ? 's' : ''}. `;
  }
  
  result += `DC ${crafting.dc}. `;
  result += `${crafting.daysToFree} additional day${crafting.daysToFree !== 1 ? 's' : ''} to complete for free.`;
  
  return result;
} 