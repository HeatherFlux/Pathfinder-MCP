/**
 * Secret templates for Lazy DM style prep
 * These are location-agnostic clues that can be discovered anywhere
 */

interface SecretParams {
  theme: 'betrayal' | 'conspiracy' | 'treasure' | 'monster' | 'history' | 'npc' | 'random';
  count?: number;
  dangerLevel?: 'low' | 'medium' | 'high';
}

const SECRET_TEMPLATES = {
  betrayal: [
    { secret: 'A trusted ally is secretly working for the enemy', reveal: 'Letters, overheard conversation, caught in the act' },
    { secret: 'The quest giver has ulterior motives for sending the party', reveal: 'Journal entries, servant gossip, discovered evidence' },
    { secret: 'A party contact has been replaced by a doppelganger', reveal: 'Inconsistent behavior, failed recognition, magic detection' },
    { secret: 'The local leader is being blackmailed into betraying their people', reveal: 'Hidden correspondence, tearful confession, blackmail material' },
    { secret: 'A helpful NPC is actually gathering information on the party', reveal: 'Coded messages, suspicious meetings, interrogation' },
    { secret: 'The person who hired them wants them to fail', reveal: 'Sabotaged supplies, withheld information, ambush setup' },
  ],
  conspiracy: [
    { secret: 'A secret society controls events from the shadows', reveal: 'Matching symbols, coordinated actions, member rosters' },
    { secret: 'The official story of a historical event is a lie', reveal: 'Contradicting records, survivor testimony, hidden documents' },
    { secret: 'Two seemingly opposed factions are secretly allied', reveal: 'Shared resources, private meetings, identical orders' },
    { secret: 'A prophecy is being manipulated to serve someone\'s agenda', reveal: 'Altered texts, false prophets, magical tampering' },
    { secret: 'The real power in the region operates through puppet rulers', reveal: 'Financial trails, magical compulsions, secret chambers' },
    { secret: 'An ancient pact binds certain families to a dark purpose', reveal: 'Family histories, birthmarks, ritual evidence' },
  ],
  treasure: [
    { secret: 'A legendary item is hidden nearby, but cursed', reveal: 'Treasure maps, dying confession, historical records' },
    { secret: 'The treasure everyone seeks is already gone—replaced with a fake', reveal: 'Expert appraisal, magical analysis, thief\'s confession' },
    { secret: 'The true treasure is not gold but knowledge or power', reveal: 'Riddle interpretation, sage consultation, trial completion' },
    { secret: 'A valuable item is hidden in plain sight, disguised', reveal: 'True sight, identify spell, craftsman recognition' },
    { secret: 'The treasure is guarded by something that cannot be defeated by force', reveal: 'Failed attempts, guardian riddles, ancient warnings' },
    { secret: 'Someone has already found the treasure and is using it secretly', reveal: 'Unexplained power, traced magic, witnessed usage' },
  ],
  monster: [
    { secret: 'The monster attacking the village was once a beloved citizen', reveal: 'Recognition, transformation evidence, grieving family' },
    { secret: 'The creature is not evil—it\'s defending something important', reveal: 'Observation, communication attempt, protected discovery' },
    { secret: 'Multiple monsters are controlled by a hidden master', reveal: 'Coordinated attacks, magical traces, control focus' },
    { secret: 'The monster is the last of its kind and valuable alive', reveal: 'Scholar recognition, bounty hunter intel, historical texts' },
    { secret: 'Killing the creature will unleash something worse', reveal: 'Sealed evil, binding magic, prophetic warning' },
    { secret: 'The creature\'s weakness is not what the legends say', reveal: 'Failed attempts, true scholar, creature\'s own hints' },
  ],
  history: [
    { secret: 'This location was the site of an ancient atrocity', reveal: 'Ghostly visions, excavated remains, forbidden archives' },
    { secret: 'The ruins hold the key to stopping a returning threat', reveal: 'Matching prophecy, ancient defenses, sealed knowledge' },
    { secret: 'A supposedly extinct civilization left survivors in hiding', reveal: 'Living descendants, preserved enclaves, active protections' },
    { secret: 'The heroes of legend were actually villains, or vice versa', reveal: 'Primary sources, divine revelation, survivor accounts' },
    { secret: 'A sealed portal once brought destruction and threatens to open again', reveal: 'Weakening wards, cult activity, planar bleeding' },
    { secret: 'The reason this place was abandoned is about to happen again', reveal: 'Cyclical patterns, warning signs, historical parallels' },
  ],
  npc: [
    { secret: 'An NPC carries a terrible burden of guilt for past actions', reveal: 'Nightmares, slip of tongue, confrontation by victim' },
    { secret: 'Someone here is not who they claim to be', reveal: 'Inconsistent story, failed disguise, recognition by other' },
    { secret: 'An NPC possesses a hidden power they fear to use', reveal: 'Desperate moment, magical detection, childhood friend' },
    { secret: 'Two NPCs share a secret relationship they\'re hiding', reveal: 'Private moments, matching tokens, defensive reactions' },
    { secret: 'An NPC knows crucial information but is afraid to share it', reveal: 'Nervous behavior, interrupted attempts, removed threat' },
    { secret: 'Someone the party trusts is dying and hiding it', reveal: 'Physical symptoms, hidden medicine, overheard prayers' },
  ],
};

/**
 * Generate Lazy DM style secrets and clues
 */
export default async function generateSecrets(
  params: SecretParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { theme, count = 5, dangerLevel = 'medium' } = params;

  try {
    let secrets: Array<{ secret: string; reveal: string }> = [];

    if (theme === 'random') {
      // Pick from all categories
      const allThemes = Object.keys(SECRET_TEMPLATES) as Array<keyof typeof SECRET_TEMPLATES>;
      for (let i = 0; i < count; i++) {
        const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
        const themeSecrets = SECRET_TEMPLATES[randomTheme];
        const randomSecret = themeSecrets[Math.floor(Math.random() * themeSecrets.length)];
        secrets.push(randomSecret);
      }
    } else {
      const themeSecrets = SECRET_TEMPLATES[theme as keyof typeof SECRET_TEMPLATES];
      if (!themeSecrets) {
        // Fallback to betrayal if theme not found
        const fallback = SECRET_TEMPLATES.betrayal;
        const shuffled = [...fallback].sort(() => Math.random() - 0.5);
        secrets = shuffled.slice(0, count);
      } else {
        // Shuffle and pick
        const shuffled = [...themeSecrets].sort(() => Math.random() - 0.5);
        secrets = shuffled.slice(0, count);
      }
    }

    const output = formatSecretsOutput(secrets, theme, dangerLevel);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error generating secrets: ${errorMessage}` }]
    };
  }
}

function formatSecretsOutput(
  secrets: Array<{ secret: string; reveal: string }>,
  theme: string,
  dangerLevel: string
): string {
  const lines: string[] = [];

  lines.push('# Generated Secrets & Clues');
  lines.push('');
  lines.push(`**Theme:** ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  lines.push(`**Danger Level:** ${dangerLevel}`);
  lines.push('');
  lines.push('*These secrets are location-agnostic. Decide at the table how and where players discover them.*');
  lines.push('');

  for (let i = 0; i < secrets.length; i++) {
    const s = secrets[i];
    lines.push(`## Secret ${i + 1}`);
    lines.push('');
    lines.push(`**The Truth:** ${s.secret}`);
    lines.push('');
    lines.push(`**Discovery Methods:** ${s.reveal}`);
    lines.push('');
    lines.push('**Complications:**');

    // Generate complications based on danger level
    switch (dangerLevel) {
      case 'low':
        lines.push('- Someone else also knows and might help');
        lines.push('- Evidence is clear once found');
        break;
      case 'medium':
        lines.push('- Someone wants to keep this hidden');
        lines.push('- The truth is partially obscured');
        lines.push('- Learning this creates a new enemy');
        break;
      case 'high':
        lines.push('- Powerful forces are actively hiding this');
        lines.push('- Learning this puts the party in danger');
        lines.push('- The implications affect many people');
        lines.push('- There\'s no going back once this is known');
        break;
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Tips section
  lines.push('## Using These Secrets');
  lines.push('');
  lines.push('1. **Layer reveals:** Don\'t give everything at once. Let players piece it together.');
  lines.push('2. **Multiple paths:** Any secret can be discovered through investigation, social, or exploration.');
  lines.push('3. **Player agency:** Let players choose which secrets to pursue.');
  lines.push('4. **Consequences:** Secrets should change the situation when revealed.');
  lines.push('5. **Connect to PCs:** Tie at least one secret to a character backstory.');
  lines.push('');

  return lines.join('\n');
}
