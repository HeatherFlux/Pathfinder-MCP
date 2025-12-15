import { AonClient } from '../../clients/aon-client.js';

interface LevelParams {
  level: number;
  includeAdjacent?: boolean;
}

/**
 * Get all hazards at a specific level (useful for encounter building)
 */
export default async function getHazardsByLevel(
  params: LevelParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { level, includeAdjacent = true } = params;

  try {
    const client = new AonClient();

    const minLevel = includeAdjacent ? Math.max(0, level - 2) : level;
    const maxLevel = includeAdjacent ? level + 2 : level;

    // Search for hazards at each level
    const allHazards: Array<{
      name: string;
      level: number;
      traits: string[];
      isComplex: boolean;
      xpSimple: number;
      xpComplex: number;
    }> = [];

    for (let l = minLevel; l <= maxLevel; l++) {
      try {
        // Search with level as a filter
        const results = await client.searchCategory('hazard', `level ${l}`);

        const hazards = results
          .filter(h => h.level === l)
          .map(h => {
            const traits = (h.traits as string[]) || [];
            const isComplex = traits.some(t => t.toLowerCase() === 'complex');
            const levelDiff = l - level;

            return {
              name: h.name,
              level: h.level as number,
              traits,
              isComplex,
              xpSimple: getSimpleHazardXP(levelDiff),
              xpComplex: getComplexHazardXP(levelDiff)
            };
          });

        allHazards.push(...hazards);
      } catch {
        // Continue
      }
    }

    // Also try a generic search to catch more hazards
    try {
      const genericResults = await client.searchCategory('hazard', 'trap');
      const filtered = genericResults
        .filter(h => {
          const hLevel = h.level as number;
          return hLevel >= minLevel && hLevel <= maxLevel;
        })
        .map(h => {
          const traits = (h.traits as string[]) || [];
          const isComplex = traits.some(t => t.toLowerCase() === 'complex');
          const levelDiff = (h.level as number) - level;

          return {
            name: h.name,
            level: h.level as number,
            traits,
            isComplex,
            xpSimple: getSimpleHazardXP(levelDiff),
            xpComplex: getComplexHazardXP(levelDiff)
          };
        });
      allHazards.push(...filtered);
    } catch {
      // Continue
    }

    // Remove duplicates
    const uniqueHazards = [...new Map(allHazards.map(h => [h.name, h])).values()]
      .sort((a, b) => a.level - b.level);

    const output = formatOutput(uniqueHazards, level, includeAdjacent);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error getting hazards: ${errorMessage}` }]
    };
  }
}

function getSimpleHazardXP(levelDiff: number): number {
  const xpTable: Record<number, number> = {
    [-4]: 2, [-3]: 3, [-2]: 4, [-1]: 6, [0]: 8,
    [1]: 12, [2]: 16, [3]: 24, [4]: 32
  };
  const clamped = Math.max(-4, Math.min(4, levelDiff));
  return xpTable[clamped] || 8;
}

function getComplexHazardXP(levelDiff: number): number {
  const xpTable: Record<number, number> = {
    [-4]: 10, [-3]: 15, [-2]: 20, [-1]: 30, [0]: 40,
    [1]: 60, [2]: 80, [3]: 120, [4]: 160
  };
  const clamped = Math.max(-4, Math.min(4, levelDiff));
  return xpTable[clamped] || 40;
}

function formatOutput(
  hazards: Array<{ name: string; level: number; traits: string[]; isComplex: boolean; xpSimple: number; xpComplex: number }>,
  targetLevel: number,
  includeAdjacent: boolean
): string {
  const lines: string[] = [];

  lines.push(`# Hazards for Level ${targetLevel} Party`);
  if (includeAdjacent) {
    lines.push(`*Showing levels ${Math.max(0, targetLevel - 2)} to ${targetLevel + 2}*`);
  }
  lines.push('');
  lines.push(`**Found:** ${hazards.length} hazards`);
  lines.push('');

  if (hazards.length === 0) {
    lines.push('No hazards found at this level range.');
    return lines.join('\n');
  }

  // Group by level
  const byLevel = new Map<number, typeof hazards>();
  for (const h of hazards) {
    if (!byLevel.has(h.level)) {
      byLevel.set(h.level, []);
    }
    byLevel.get(h.level)!.push(h);
  }

  for (const [lvl, levelHazards] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
    const levelDiff = lvl - targetLevel;
    const diffStr = levelDiff === 0 ? '(party level)' :
      levelDiff > 0 ? `(+${levelDiff})` : `(${levelDiff})`;

    lines.push(`## Level ${lvl} ${diffStr}`);
    lines.push('');
    lines.push('| Hazard | Type | XP |');
    lines.push('|--------|------|-----|');

    for (const h of levelHazards) {
      const type = h.isComplex ? 'Complex' : 'Simple';
      const xp = h.isComplex ? h.xpComplex : h.xpSimple;
      lines.push(`| **${h.name}** | ${type} | ${xp} XP |`);
    }
    lines.push('');
  }

  lines.push('## Combining Hazards with Creatures');
  lines.push('');
  lines.push('Hazards work best when combined with creatures:');
  lines.push('- Add hazards worth ~10-20% of encounter XP budget');
  lines.push('- Place hazards to give monsters tactical advantage');
  lines.push('- Use simple hazards for quick additions, complex for encounter focus');
  lines.push('');

  return lines.join('\n');
}
