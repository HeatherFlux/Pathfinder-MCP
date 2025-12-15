import { AonClient } from '../../clients/aon-client.js';

interface SearchParams {
  minLevel: number;
  maxLevel: number;
  traits?: string[];
  creatureType?: string;
  limit?: number;
}

/**
 * Search for creatures within a level range, optionally filtered by traits
 */
export default async function searchCreaturesByLevel(
  params: SearchParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { minLevel, maxLevel, traits, creatureType, limit = 20 } = params;

  try {
    const client = new AonClient();
    const allCreatures: Array<{
      name: string;
      level: number;
      traits: string[];
      url?: string;
      description?: string;
    }> = [];

    // Search each level in the range
    for (let level = minLevel; level <= maxLevel; level++) {
      const searchQuery = creatureType || traits?.join(' ') || '*';

      try {
        const results = await client.searchCategory('creature', searchQuery);

        const levelCreatures = results
          .filter(c => c.level === level)
          .filter(c => {
            if (!traits || traits.length === 0) return true;
            const creatureTraits = (c.traits as string[]) || [];
            return traits.some(t =>
              creatureTraits.some(ct =>
                ct.toLowerCase().includes(t.toLowerCase())
              )
            );
          })
          .map(c => ({
            name: c.name,
            level: c.level as number,
            traits: (c.traits as string[]) || [],
            url: c.url,
            description: c.description?.substring(0, 150)
          }));

        allCreatures.push(...levelCreatures);
      } catch {
        // Continue if a level search fails
      }
    }

    // Remove duplicates and limit
    const uniqueCreatures = [...new Map(allCreatures.map(c => [c.name, c])).values()]
      .slice(0, limit);

    // Format output
    const output = formatCreatureList(uniqueCreatures, { minLevel, maxLevel, traits, creatureType });

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error searching creatures: ${errorMessage}` }]
    };
  }
}

function formatCreatureList(
  creatures: Array<{ name: string; level: number; traits: string[]; url?: string; description?: string }>,
  params: { minLevel: number; maxLevel: number; traits?: string[]; creatureType?: string }
): string {
  const lines: string[] = [];

  lines.push(`# Creatures (Level ${params.minLevel}-${params.maxLevel})`);
  if (params.traits?.length) {
    lines.push(`**Traits filter:** ${params.traits.join(', ')}`);
  }
  if (params.creatureType) {
    lines.push(`**Type filter:** ${params.creatureType}`);
  }
  lines.push(`**Found:** ${creatures.length} creatures`);
  lines.push('');

  // Group by level
  const byLevel = new Map<number, typeof creatures>();
  for (const creature of creatures) {
    if (!byLevel.has(creature.level)) {
      byLevel.set(creature.level, []);
    }
    byLevel.get(creature.level)!.push(creature);
  }

  for (const [level, levelCreatures] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
    lines.push(`## Level ${level}`);
    for (const creature of levelCreatures) {
      const traitsStr = creature.traits.length > 0
        ? ` [${creature.traits.slice(0, 4).join(', ')}]`
        : '';
      lines.push(`- **${creature.name}**${traitsStr}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('*Use `getPathfinderItem` with category "creature" to get full stat blocks.*');

  return lines.join('\n');
}
