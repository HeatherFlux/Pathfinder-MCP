import { AonClient } from '../../clients/aon-client.js';

interface SearchParams {
  traits: string[];
  minLevel?: number;
  maxLevel?: number;
  limit?: number;
}

/**
 * Search for creatures by their traits (undead, dragon, humanoid, etc.)
 */
export default async function searchCreaturesByTrait(
  params: SearchParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { traits, minLevel = 0, maxLevel = 25, limit = 30 } = params;

  try {
    const client = new AonClient();
    const allCreatures: Array<{
      name: string;
      level: number;
      traits: string[];
      url?: string;
    }> = [];

    // Search for each trait
    for (const trait of traits) {
      try {
        const results = await client.searchCategory('creature', trait);

        const matchingCreatures = results
          .filter(c => {
            const level = c.level as number;
            return level >= minLevel && level <= maxLevel;
          })
          .filter(c => {
            const creatureTraits = (c.traits as string[]) || [];
            return creatureTraits.some(ct =>
              ct.toLowerCase().includes(trait.toLowerCase())
            );
          })
          .map(c => ({
            name: c.name,
            level: c.level as number,
            traits: (c.traits as string[]) || [],
            url: c.url
          }));

        allCreatures.push(...matchingCreatures);
      } catch {
        // Continue if a search fails
      }
    }

    // Remove duplicates, sort by level, and limit
    const uniqueCreatures = [...new Map(allCreatures.map(c => [c.name, c])).values()]
      .sort((a, b) => a.level - b.level)
      .slice(0, limit);

    // Format output
    const output = formatOutput(uniqueCreatures, traits, minLevel, maxLevel);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error searching by traits: ${errorMessage}` }]
    };
  }
}

function formatOutput(
  creatures: Array<{ name: string; level: number; traits: string[] }>,
  searchTraits: string[],
  minLevel: number,
  maxLevel: number
): string {
  const lines: string[] = [];

  lines.push(`# Creatures with Traits: ${searchTraits.join(', ')}`);
  lines.push(`**Level range:** ${minLevel}-${maxLevel}`);
  lines.push(`**Found:** ${creatures.length} creatures`);
  lines.push('');

  if (creatures.length === 0) {
    lines.push('No creatures found matching these criteria.');
    lines.push('');
    lines.push('**Common trait categories:**');
    lines.push('- **Creature types:** aberration, animal, beast, construct, dragon, elemental, fey, fiend, giant, humanoid, monitor, ooze, plant, undead');
    lines.push('- **Alignments:** chaotic, evil, good, lawful');
    lines.push('- **Elements:** air, earth, fire, water, cold');
    lines.push('- **Special:** incorporeal, mindless, swarm');
    return lines.join('\n');
  }

  // Group by level range for easier reading
  const lowLevel = creatures.filter(c => c.level <= 4);
  const midLevel = creatures.filter(c => c.level >= 5 && c.level <= 10);
  const highLevel = creatures.filter(c => c.level >= 11 && c.level <= 15);
  const epicLevel = creatures.filter(c => c.level >= 16);

  if (lowLevel.length > 0) {
    lines.push('## Low Level (0-4)');
    for (const c of lowLevel) {
      lines.push(`- **${c.name}** (Level ${c.level}) [${c.traits.slice(0, 3).join(', ')}]`);
    }
    lines.push('');
  }

  if (midLevel.length > 0) {
    lines.push('## Mid Level (5-10)');
    for (const c of midLevel) {
      lines.push(`- **${c.name}** (Level ${c.level}) [${c.traits.slice(0, 3).join(', ')}]`);
    }
    lines.push('');
  }

  if (highLevel.length > 0) {
    lines.push('## High Level (11-15)');
    for (const c of highLevel) {
      lines.push(`- **${c.name}** (Level ${c.level}) [${c.traits.slice(0, 3).join(', ')}]`);
    }
    lines.push('');
  }

  if (epicLevel.length > 0) {
    lines.push('## Epic Level (16+)');
    for (const c of epicLevel) {
      lines.push(`- **${c.name}** (Level ${c.level}) [${c.traits.slice(0, 3).join(', ')}]`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
