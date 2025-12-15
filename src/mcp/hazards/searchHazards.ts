import { AonClient } from '../../clients/aon-client.js';

interface HazardParams {
  query?: string;
  minLevel?: number;
  maxLevel?: number;
  hazardType?: 'trap' | 'environmental' | 'haunt' | 'all';
  complexity?: 'simple' | 'complex' | 'all';
  limit?: number;
}

/**
 * Search for hazards (traps, environmental hazards, haunts)
 */
export default async function searchHazards(
  params: HazardParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const {
    query = '*',
    minLevel = 0,
    maxLevel = 25,
    hazardType = 'all',
    complexity = 'all',
    limit = 25
  } = params;

  try {
    const client = new AonClient();

    // Build search queries based on hazard type
    const searchQueries: string[] = [];
    if (hazardType === 'all' || hazardType === 'trap') {
      searchQueries.push(query === '*' ? 'trap' : `${query} trap`);
    }
    if (hazardType === 'all' || hazardType === 'environmental') {
      searchQueries.push(query === '*' ? 'environmental' : `${query} environmental`);
    }
    if (hazardType === 'all' || hazardType === 'haunt') {
      searchQueries.push(query === '*' ? 'haunt' : `${query} haunt`);
    }
    if (query !== '*' && hazardType === 'all') {
      searchQueries.push(query);
    }

    const allHazards: Array<{
      name: string;
      level: number;
      traits: string[];
      description?: string;
      url?: string;
      isComplex: boolean;
    }> = [];

    for (const searchQuery of searchQueries) {
      try {
        const results = await client.searchCategory('hazard', searchQuery);

        const hazards = results
          .filter(h => {
            const level = h.level as number;
            return level >= minLevel && level <= maxLevel;
          })
          .filter(h => {
            if (complexity === 'all') return true;
            const traits = (h.traits as string[]) || [];
            const isComplex = traits.some(t => t.toLowerCase() === 'complex');
            return complexity === 'complex' ? isComplex : !isComplex;
          })
          .map(h => {
            const traits = (h.traits as string[]) || [];
            return {
              name: h.name,
              level: h.level as number,
              traits,
              description: h.description?.substring(0, 150),
              url: h.url,
              isComplex: traits.some(t => t.toLowerCase() === 'complex')
            };
          });

        allHazards.push(...hazards);
      } catch {
        // Continue if search fails
      }
    }

    // Remove duplicates and sort
    const uniqueHazards = [...new Map(allHazards.map(h => [h.name, h])).values()]
      .sort((a, b) => a.level - b.level)
      .slice(0, limit);

    const output = formatHazardOutput(uniqueHazards, params);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error searching hazards: ${errorMessage}` }]
    };
  }
}

function formatHazardOutput(
  hazards: Array<{ name: string; level: number; traits: string[]; description?: string; isComplex: boolean }>,
  params: HazardParams
): string {
  const lines: string[] = [];

  lines.push('# Hazards Search Results');
  lines.push('');
  lines.push(`**Level range:** ${params.minLevel || 0}-${params.maxLevel || 25}`);
  if (params.hazardType && params.hazardType !== 'all') {
    lines.push(`**Type:** ${params.hazardType}`);
  }
  if (params.complexity && params.complexity !== 'all') {
    lines.push(`**Complexity:** ${params.complexity}`);
  }
  lines.push(`**Found:** ${hazards.length} hazards`);
  lines.push('');

  if (hazards.length === 0) {
    lines.push('No hazards found matching these criteria.');
    lines.push('');
    lines.push('**Search tips:**');
    lines.push('- Try broader terms: "pit", "fire", "poison", "blade"');
    lines.push('- Search by type: trap, environmental, haunt');
    lines.push('- Expand level range');
    return lines.join('\n');
  }

  // Group by complexity
  const simple = hazards.filter(h => !h.isComplex);
  const complex = hazards.filter(h => h.isComplex);

  if (simple.length > 0) {
    lines.push('## Simple Hazards');
    lines.push('*Single reaction or effect, easily bypassed*');
    lines.push('');
    lines.push('| Level | Hazard | Traits |');
    lines.push('|-------|--------|--------|');
    for (const h of simple) {
      const traits = h.traits.filter(t => t.toLowerCase() !== 'complex').slice(0, 3).join(', ');
      lines.push(`| ${h.level} | **${h.name}** | ${traits} |`);
    }
    lines.push('');
  }

  if (complex.length > 0) {
    lines.push('## Complex Hazards');
    lines.push('*Multi-round threats, require sustained attention*');
    lines.push('');
    lines.push('| Level | Hazard | Traits |');
    lines.push('|-------|--------|--------|');
    for (const h of complex) {
      const traits = h.traits.filter(t => t.toLowerCase() !== 'complex').slice(0, 3).join(', ');
      lines.push(`| ${h.level} | **${h.name}** | ${traits} |`);
    }
    lines.push('');
  }

  lines.push('## Hazard XP Values (PF2e)');
  lines.push('');
  lines.push('| Hazard Level vs Party | Simple XP | Complex XP |');
  lines.push('|----------------------|-----------|------------|');
  lines.push('| Party Level -4 | 2 XP | 10 XP |');
  lines.push('| Party Level -2 | 4 XP | 20 XP |');
  lines.push('| Party Level | 8 XP | 40 XP |');
  lines.push('| Party Level +2 | 16 XP | 80 XP |');
  lines.push('| Party Level +4 | 32 XP | 160 XP |');
  lines.push('');

  lines.push('---');
  lines.push('*Use `getPathfinderItem` with category "hazard" for full mechanics.*');

  return lines.join('\n');
}
