import { AonClient } from '../../clients/aon-client.js';

/**
 * PF2e XP budget by difficulty
 */
const XP_BUDGETS = {
  trivial: 40,
  low: 60,
  moderate: 80,
  severe: 120,
  extreme: 160
} as const;

/**
 * Creature XP by level relative to party
 */
const CREATURE_XP_BY_LEVEL_DIFF: Record<number, number> = {
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

type Difficulty = keyof typeof XP_BUDGETS;

interface EncounterParams {
  partyLevel: number;
  partySize?: number;
  difficulty: Difficulty;
  creatureTypes?: string[];
  environment?: string;
}

interface CreatureSuggestion {
  name: string;
  level: number;
  xp: number;
  traits: string[];
  url?: string;
}

/**
 * Build a balanced encounter for PF2e
 */
export default async function buildEncounter(
  params: EncounterParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const {
    partyLevel,
    partySize = 4,
    difficulty,
    creatureTypes,
    environment
  } = params;

  try {
    const client = new AonClient();

    // Calculate XP budget (adjusted for party size)
    const baseXP = XP_BUDGETS[difficulty];
    const sizeAdjustment = (partySize - 4) * 20;
    const xpBudget = baseXP + sizeAdjustment;

    // Determine creature level range based on difficulty
    const levelRange = getLevelRange(partyLevel, difficulty);

    // Search for appropriate creatures
    const creatures: CreatureSuggestion[] = [];

    for (let level = levelRange.min; level <= levelRange.max; level++) {
      const searchQuery = creatureTypes?.join(' ') || environment || 'humanoid';

      try {
        const results = await client.searchCategory('creature', searchQuery);

        // Filter by level and add XP values
        const levelCreatures = results
          .filter(c => c.level === level)
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            level: c.level as number,
            xp: getCreatureXP(level, partyLevel),
            traits: (c.traits as string[]) || [],
            url: c.url
          }));

        creatures.push(...levelCreatures);
      } catch {
        // Continue if a search fails
      }
    }

    // Build encounter suggestions
    const suggestions = buildEncounterSuggestions(creatures, xpBudget, partyLevel);

    // Format output
    const output = formatEncounterOutput({
      partyLevel,
      partySize,
      difficulty,
      xpBudget,
      creatures,
      suggestions
    });

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error building encounter: ${errorMessage}` }]
    };
  }
}

function getLevelRange(partyLevel: number, difficulty: Difficulty): { min: number; max: number } {
  switch (difficulty) {
    case 'trivial':
      return { min: partyLevel - 4, max: partyLevel - 2 };
    case 'low':
      return { min: partyLevel - 3, max: partyLevel - 1 };
    case 'moderate':
      return { min: partyLevel - 2, max: partyLevel + 1 };
    case 'severe':
      return { min: partyLevel - 1, max: partyLevel + 2 };
    case 'extreme':
      return { min: partyLevel, max: partyLevel + 4 };
    default:
      return { min: partyLevel - 2, max: partyLevel + 2 };
  }
}

function getCreatureXP(creatureLevel: number, partyLevel: number): number {
  const diff = creatureLevel - partyLevel;
  const clampedDiff = Math.max(-4, Math.min(4, diff));
  return CREATURE_XP_BY_LEVEL_DIFF[clampedDiff] || 40;
}

interface EncounterSuggestion {
  creatures: Array<{ count: number; creature: CreatureSuggestion }>;
  totalXP: number;
}

function buildEncounterSuggestions(
  creatures: CreatureSuggestion[],
  xpBudget: number,
  partyLevel: number
): EncounterSuggestion[] {
  const suggestions: EncounterSuggestion[] = [];

  // Sort creatures by level (descending) for boss + minions patterns
  const sortedCreatures = [...creatures].sort((a, b) => b.level - a.level);

  // Try single creature encounters (boss fights)
  for (const creature of sortedCreatures) {
    if (creature.xp >= xpBudget * 0.8 && creature.xp <= xpBudget * 1.2) {
      suggestions.push({
        creatures: [{ count: 1, creature }],
        totalXP: creature.xp
      });
    }
  }

  // Try pairs of same creature
  for (const creature of sortedCreatures) {
    const pairXP = creature.xp * 2;
    if (pairXP >= xpBudget * 0.8 && pairXP <= xpBudget * 1.2) {
      suggestions.push({
        creatures: [{ count: 2, creature }],
        totalXP: pairXP
      });
    }
  }

  // Try boss + minions pattern
  const bosses = sortedCreatures.filter(c => c.level >= partyLevel);
  const minions = sortedCreatures.filter(c => c.level < partyLevel);

  for (const boss of bosses) {
    const remainingXP = xpBudget - boss.xp;
    if (remainingXP > 0) {
      for (const minion of minions) {
        const minionCount = Math.floor(remainingXP / minion.xp);
        if (minionCount >= 1 && minionCount <= 6) {
          const totalXP = boss.xp + (minion.xp * minionCount);
          if (totalXP >= xpBudget * 0.8 && totalXP <= xpBudget * 1.2) {
            suggestions.push({
              creatures: [
                { count: 1, creature: boss },
                { count: minionCount, creature: minion }
              ],
              totalXP
            });
          }
        }
      }
    }
  }

  // Limit and sort suggestions
  return suggestions
    .sort((a, b) => Math.abs(b.totalXP - xpBudget) - Math.abs(a.totalXP - xpBudget))
    .slice(0, 5);
}

function formatEncounterOutput(data: {
  partyLevel: number;
  partySize: number;
  difficulty: string;
  xpBudget: number;
  creatures: CreatureSuggestion[];
  suggestions: EncounterSuggestion[];
}): string {
  const lines: string[] = [];

  lines.push(`# Encounter Builder: ${data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)} Difficulty`);
  lines.push('');
  lines.push(`**Party:** Level ${data.partyLevel}, ${data.partySize} players`);
  lines.push(`**XP Budget:** ${data.xpBudget} XP`);
  lines.push('');

  if (data.suggestions.length > 0) {
    lines.push('## Suggested Encounters');
    lines.push('');

    for (let i = 0; i < data.suggestions.length; i++) {
      const suggestion = data.suggestions[i];
      lines.push(`### Option ${i + 1} (${suggestion.totalXP} XP)`);

      for (const entry of suggestion.creatures) {
        const creature = entry.creature;
        const countText = entry.count > 1 ? `${entry.count}× ` : '';
        const traits = creature.traits.length > 0 ? ` [${creature.traits.slice(0, 3).join(', ')}]` : '';
        lines.push(`- ${countText}**${creature.name}** (Level ${creature.level}, ${creature.xp} XP each)${traits}`);
      }
      lines.push('');
    }
  } else {
    lines.push('## Available Creatures by Level');
    lines.push('');

    // Group by level
    const byLevel = new Map<number, CreatureSuggestion[]>();
    for (const creature of data.creatures) {
      const level = creature.level;
      if (!byLevel.has(level)) {
        byLevel.set(level, []);
      }
      byLevel.get(level)!.push(creature);
    }

    for (const [level, levelCreatures] of [...byLevel.entries()].sort((a, b) => b[0] - a[0])) {
      const xp = levelCreatures[0]?.xp || 0;
      lines.push(`### Level ${level} (${xp} XP each)`);
      for (const creature of levelCreatures.slice(0, 5)) {
        lines.push(`- **${creature.name}**`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('*Use `getPathfinderItem` to get full stat blocks for selected creatures.*');

  return lines.join('\n');
}
