import { AonClient } from '../../clients/aon-client.js';

interface FamilyParams {
  familyName: string;
  minLevel?: number;
  maxLevel?: number;
}

/**
 * Get all creatures in a creature family (e.g., "goblin", "dragon", "demon")
 * Useful for themed encounters with related creatures
 */
export default async function getCreatureFamily(
  params: FamilyParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { familyName, minLevel = 0, maxLevel = 25 } = params;

  try {
    const client = new AonClient();

    // First try searching creature-family category
    let familyInfo = null;
    try {
      const familyResults = await client.searchCategory('creature-family', familyName);
      if (familyResults.length > 0) {
        familyInfo = familyResults[0];
      }
    } catch {
      // Family search failed, continue with creature search
    }

    // Search for creatures matching the family name
    const creatureResults = await client.searchCategory('creature', familyName);

    const familyCreatures = creatureResults
      .filter(c => {
        const level = c.level as number;
        return level >= minLevel && level <= maxLevel;
      })
      .filter(c => {
        // Match by name containing family name or traits
        const nameMatch = c.name.toLowerCase().includes(familyName.toLowerCase());
        const traitMatch = (c.traits as string[] || []).some(t =>
          t.toLowerCase().includes(familyName.toLowerCase())
        );
        return nameMatch || traitMatch;
      })
      .map(c => ({
        name: c.name,
        level: c.level as number,
        traits: (c.traits as string[]) || [],
        description: c.description?.substring(0, 100),
        url: c.url
      }))
      .sort((a, b) => a.level - b.level);

    // Remove duplicates
    const uniqueCreatures = [...new Map(familyCreatures.map(c => [c.name, c])).values()];

    // Format output
    const output = formatFamilyOutput(familyName, uniqueCreatures, familyInfo);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error getting creature family: ${errorMessage}` }]
    };
  }
}

function formatFamilyOutput(
  familyName: string,
  creatures: Array<{ name: string; level: number; traits: string[]; description?: string }>,
  familyInfo: { name: string; description?: string } | null
): string {
  const lines: string[] = [];

  lines.push(`# ${familyName.charAt(0).toUpperCase() + familyName.slice(1)} Creature Family`);
  lines.push('');

  if (familyInfo?.description) {
    lines.push('## Family Description');
    lines.push(familyInfo.description.substring(0, 500));
    lines.push('');
  }

  lines.push(`## Members (${creatures.length} found)`);
  lines.push('');

  if (creatures.length === 0) {
    lines.push(`No creatures found for family "${familyName}".`);
    lines.push('');
    lines.push('**Try searching for:**');
    lines.push('- Common families: goblin, orc, dragon, demon, devil, elemental, undead, giant');
    lines.push('- Specific types: skeleton, zombie, vampire, werewolf');
    return lines.join('\n');
  }

  // Create a level ladder for encounter building
  lines.push('| Level | Creature | Traits |');
  lines.push('|-------|----------|--------|');

  for (const creature of creatures) {
    const traitsStr = creature.traits.slice(0, 3).join(', ');
    lines.push(`| ${creature.level} | **${creature.name}** | ${traitsStr} |`);
  }

  lines.push('');
  lines.push('## Encounter Ideas');
  lines.push('');

  // Suggest encounter combinations
  const lowLevel = creatures.filter(c => c.level <= 4);
  const midLevel = creatures.filter(c => c.level >= 5 && c.level <= 10);
  const bosses = creatures.filter(c => c.level >= 8);

  if (lowLevel.length > 0 && bosses.length > 0) {
    const minion = lowLevel[0];
    const boss = bosses[bosses.length - 1];
    lines.push(`- **Boss + Minions:** 1× ${boss.name} (L${boss.level}) + 2-4× ${minion.name} (L${minion.level})`);
  }

  if (midLevel.length >= 2) {
    const pair = midLevel.slice(0, 2);
    lines.push(`- **Squad:** 2× ${pair[0].name} (L${pair[0].level}) + 2× ${pair[1]?.name || pair[0].name} (L${pair[1]?.level || pair[0].level})`);
  }

  if (creatures.length >= 3) {
    lines.push(`- **Escalating Threat:** Start with L${creatures[0].level} ${creatures[0].name}, escalate to L${creatures[Math.floor(creatures.length/2)].level} ${creatures[Math.floor(creatures.length/2)].name}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('*Use `buildEncounter` to calculate XP for these combinations.*');

  return lines.join('\n');
}
