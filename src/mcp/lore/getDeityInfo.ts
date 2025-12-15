import { AonClient } from '../../clients/aon-client.js';

interface DeityParams {
  name?: string;
  domain?: string;
  alignment?: string;
}

/**
 * Get deity information for temple encounters, cultist motivations, divine casters
 */
export default async function getDeityInfo(
  params: DeityParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { name, domain, alignment } = params;

  try {
    const client = new AonClient();

    // Build search query
    let searchQuery = name || domain || alignment || 'deity';
    if (domain && !name) {
      searchQuery = domain;
    }

    const results = await client.searchCategory('deity', searchQuery);

    // Filter results
    let deities = results.map(d => ({
      name: d.name,
      description: d.description,
      text: d.text,
      traits: (d.traits as string[]) || [],
      url: d.url
    }));

    // Filter by alignment if specified
    if (alignment) {
      const alignmentLower = alignment.toLowerCase();
      deities = deities.filter(d => {
        const allText = `${d.description || ''} ${d.text || ''} ${d.traits.join(' ')}`.toLowerCase();
        return allText.includes(alignmentLower);
      });
    }

    // Limit results
    deities = deities.slice(0, 10);

    const output = formatDeityOutput(deities, params);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error getting deity info: ${errorMessage}` }]
    };
  }
}

function formatDeityOutput(
  deities: Array<{ name: string; description?: string; text?: string; traits: string[]; url?: string }>,
  params: DeityParams
): string {
  const lines: string[] = [];

  lines.push('# Deity Information');
  lines.push('');

  if (params.name) {
    lines.push(`**Searching for:** ${params.name}`);
  }
  if (params.domain) {
    lines.push(`**Domain filter:** ${params.domain}`);
  }
  if (params.alignment) {
    lines.push(`**Alignment filter:** ${params.alignment}`);
  }
  lines.push(`**Found:** ${deities.length} deities`);
  lines.push('');

  if (deities.length === 0) {
    lines.push('No deities found matching these criteria.');
    lines.push('');
    lines.push('**Search tips:**');
    lines.push('- Search by name: "Sarenrae", "Pharasma", "Asmodeus"');
    lines.push('- Search by domain: "death", "war", "magic", "nature"');
    lines.push('- Search by alignment: "good", "evil", "lawful", "chaotic"');
    return lines.join('\n');
  }

  for (const deity of deities) {
    lines.push(`## ${deity.name}`);
    lines.push('');

    if (deity.traits.length > 0) {
      lines.push(`**Traits:** ${deity.traits.join(', ')}`);
    }

    if (deity.description) {
      // Truncate description for readability
      const desc = deity.description.length > 500
        ? deity.description.substring(0, 500) + '...'
        : deity.description;
      lines.push('');
      lines.push(desc);
    }

    if (deity.url) {
      lines.push('');
      lines.push(`[View on Archives of Nethys](${deity.url})`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Adventure hooks section
  lines.push('## Adventure Hooks for Deity Encounters');
  lines.push('');
  lines.push('### Temple Encounters');
  lines.push('- Corrupted temple: Worshippers unknowingly serving a false aspect');
  lines.push('- Holy site under attack: Defend the sacred ground');
  lines.push('- Relic retrieval: Recover a stolen divine artifact');
  lines.push('- Pilgrimage protection: Escort worshippers through danger');
  lines.push('');
  lines.push('### Cultist Motivations');
  lines.push('- True believers: Fanatical devotion, willing to die');
  lines.push('- Desperate converts: Seeking power/healing/revenge');
  lines.push('- Infiltrators: Pretending faith for access');
  lines.push('- Reformed: Former cultists seeking redemption');
  lines.push('');

  return lines.join('\n');
}
