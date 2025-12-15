/**
 * PF2e Creature XP by level difference from party
 */
const CREATURE_XP: Record<number, number> = {
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

/**
 * Simple hazard XP
 */
const SIMPLE_HAZARD_XP: Record<number, number> = {
  [-4]: 2,
  [-3]: 3,
  [-2]: 4,
  [-1]: 6,
  [0]: 8,
  [1]: 12,
  [2]: 16,
  [3]: 24,
  [4]: 32
};

/**
 * Complex hazard XP
 */
const COMPLEX_HAZARD_XP: Record<number, number> = {
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

interface ThreatEntry {
  name: string;
  level: number;
  count: number;
  type: 'creature' | 'simple_hazard' | 'complex_hazard';
}

interface CalculateParams {
  partyLevel: number;
  partySize?: number;
  threats: ThreatEntry[];
}

/**
 * Calculate total XP and difficulty for a custom encounter
 */
export default async function calculateEncounterXP(
  params: CalculateParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { partyLevel, partySize = 4, threats } = params;

  try {
    // Calculate XP for each threat
    const threatXP = threats.map(threat => {
      const levelDiff = threat.level - partyLevel;
      const clampedDiff = Math.max(-4, Math.min(4, levelDiff));

      let xpPerUnit: number;
      switch (threat.type) {
        case 'simple_hazard':
          xpPerUnit = SIMPLE_HAZARD_XP[clampedDiff] || 8;
          break;
        case 'complex_hazard':
          xpPerUnit = COMPLEX_HAZARD_XP[clampedDiff] || 40;
          break;
        default:
          xpPerUnit = CREATURE_XP[clampedDiff] || 40;
      }

      return {
        ...threat,
        xpPerUnit,
        totalXP: xpPerUnit * threat.count,
        levelDiff
      };
    });

    // Calculate totals
    const totalXP = threatXP.reduce((sum, t) => sum + t.totalXP, 0);

    // Adjust XP budget for party size (±20 XP per player difference from 4)
    const sizeAdjustment = (partySize - 4) * 20;
    const adjustedBudgets = {
      trivial: 40 + sizeAdjustment,
      low: 60 + sizeAdjustment,
      moderate: 80 + sizeAdjustment,
      severe: 120 + sizeAdjustment,
      extreme: 160 + sizeAdjustment
    };

    // Determine difficulty
    let difficulty: string;
    let difficultyNote: string;

    if (totalXP <= adjustedBudgets.trivial) {
      difficulty = 'Trivial';
      difficultyNote = 'Not a threat, minor resource drain at most';
    } else if (totalXP <= adjustedBudgets.low) {
      difficulty = 'Low';
      difficultyNote = 'Minor challenge, unlikely to seriously threaten the party';
    } else if (totalXP <= adjustedBudgets.moderate) {
      difficulty = 'Moderate';
      difficultyNote = 'A typical challenge; party will use some resources';
    } else if (totalXP <= adjustedBudgets.severe) {
      difficulty = 'Severe';
      difficultyNote = 'Dangerous; poor tactics or bad luck could result in deaths';
    } else if (totalXP <= adjustedBudgets.extreme) {
      difficulty = 'Extreme';
      difficultyNote = 'Very dangerous; likely to cause casualties without excellent play';
    } else {
      difficulty = 'DEADLY';
      difficultyNote = 'Beyond extreme; TPK is likely without significant advantages';
    }

    const output = formatOutput({
      partyLevel,
      partySize,
      threatXP,
      totalXP,
      difficulty,
      difficultyNote,
      adjustedBudgets
    });

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error calculating XP: ${errorMessage}` }]
    };
  }
}

function formatOutput(data: {
  partyLevel: number;
  partySize: number;
  threatXP: Array<ThreatEntry & { xpPerUnit: number; totalXP: number; levelDiff: number }>;
  totalXP: number;
  difficulty: string;
  difficultyNote: string;
  adjustedBudgets: Record<string, number>;
}): string {
  const lines: string[] = [];

  lines.push('# Encounter XP Calculator');
  lines.push('');
  lines.push(`## Party: Level ${data.partyLevel}, ${data.partySize} players`);
  lines.push('');

  // Threat breakdown
  lines.push('## Threat Breakdown');
  lines.push('');
  lines.push('| Threat | Level | Count | XP Each | Total XP |');
  lines.push('|--------|-------|-------|---------|----------|');

  for (const threat of data.threatXP) {
    const levelStr = threat.levelDiff >= 0 ? `${threat.level} (+${threat.levelDiff})` : `${threat.level} (${threat.levelDiff})`;
    lines.push(`| ${threat.name} | ${levelStr} | ${threat.count} | ${threat.xpPerUnit} | ${threat.totalXP} |`);
  }

  lines.push('');
  lines.push(`### **Total XP: ${data.totalXP}**`);
  lines.push(`### **Difficulty: ${data.difficulty}**`);
  lines.push('');
  lines.push(`*${data.difficultyNote}*`);
  lines.push('');

  // Budget reference
  lines.push('## XP Budgets for This Party');
  lines.push('');
  lines.push('| Difficulty | XP Budget | Your Encounter |');
  lines.push('|------------|-----------|----------------|');

  for (const [diff, budget] of Object.entries(data.adjustedBudgets)) {
    const comparison = data.totalXP <= budget ? '✓' : '';
    const current = diff.charAt(0).toUpperCase() + diff.slice(1) === data.difficulty ? '← Current' : '';
    lines.push(`| ${diff.charAt(0).toUpperCase() + diff.slice(1)} | ${budget} XP | ${comparison} ${current} |`);
  }

  lines.push('');

  // Adjustment suggestions
  if (data.difficulty === 'DEADLY') {
    lines.push('## ⚠️ Warning: Deadly Encounter');
    lines.push('');
    lines.push('Consider reducing difficulty by:');
    lines.push('- Removing 1-2 creatures');
    lines.push('- Lowering creature levels');
    lines.push('- Adding environmental advantages for players');
    lines.push('- Providing consumables or NPC assistance');
  } else if (data.difficulty === 'Trivial') {
    lines.push('## 💡 Note: Easy Encounter');
    lines.push('');
    lines.push('Consider increasing difficulty by:');
    lines.push('- Adding more creatures');
    lines.push('- Adding a hazard');
    lines.push('- Adding environmental complications');
    lines.push('- Using higher-level creatures');
  }

  lines.push('');
  lines.push('---');
  lines.push('*XP values from Pathfinder 2e Core Rulebook*');

  return lines.join('\n');
}
