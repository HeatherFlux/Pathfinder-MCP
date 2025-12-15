/**
 * Scene templates for adventure building
 */

interface SceneParams {
  sceneType: 'combat' | 'exploration' | 'social' | 'puzzle' | 'chase' | 'heist' | 'random';
  environment?: string;
  tension?: 'low' | 'medium' | 'high' | 'climax';
  count?: number;
}

const SCENE_TEMPLATES = {
  combat: [
    { title: 'Ambush at the Crossroads', hook: 'Enemies spring a trap at a vulnerable location', elements: ['difficult terrain', 'height advantage for enemies', 'escape route for party'] },
    { title: 'Defense of the Innocent', hook: 'Protect civilians while fighting off attackers', elements: ['vulnerable NPCs', 'multiple threat directions', 'collateral damage risk'] },
    { title: 'Running Battle', hook: 'Fight while pursuing or fleeing through changing terrain', elements: ['environmental transitions', 'new threats appearing', 'time pressure'] },
    { title: 'Boss Arena', hook: 'Face a powerful enemy in their lair', elements: ['lair actions', 'minion waves', 'environmental hazards'] },
    { title: 'Waves of Enemies', hook: 'Hold position against increasing threats', elements: ['reinforcement timing', 'resource management', 'fortification options'] },
    { title: 'Three-Way Fight', hook: 'Two enemy groups plus the party create chaos', elements: ['faction targeting', 'temporary alliances', 'opportunity attacks'] },
  ],
  exploration: [
    { title: 'The Forgotten Path', hook: 'Navigate through dangerous terrain to reach the destination', elements: ['navigation challenges', 'environmental hazards', 'hidden discoveries'] },
    { title: 'Dungeon Delve', hook: 'Explore a dungeon room by room, managing resources', elements: ['trap variety', 'secret doors', 'monster encounters'] },
    { title: 'Race Against Time', hook: 'Explore while a deadline approaches', elements: ['time pressure', 'shortcut opportunities', 'consequence for delay'] },
    { title: 'Investigation Scene', hook: 'Examine a location for clues and evidence', elements: ['hidden information', 'witness interviews', 'environmental storytelling'] },
    { title: 'Vertical Ascent/Descent', hook: 'Navigate dangerous heights or depths', elements: ['climbing challenges', 'falling hazards', 'vertical combat'] },
    { title: 'Shifting Environment', hook: 'The location changes as you explore', elements: ['time-based changes', 'triggered events', 'one-way paths'] },
  ],
  social: [
    { title: 'The Negotiation', hook: 'Convince a powerful figure to provide aid or information', elements: ['leverage points', 'hidden agendas', 'time limit'] },
    { title: 'Court Intrigue', hook: 'Navigate political machinations at a formal gathering', elements: ['multiple factions', 'social traps', 'observation opportunities'] },
    { title: 'Interrogation', hook: 'Extract information from an unwilling source', elements: ['resistance tactics', 'truth verification', 'ethical considerations'] },
    { title: 'Undercover Operation', hook: 'Maintain a cover identity while achieving objectives', elements: ['suspicion management', 'role requirements', 'blown cover consequences'] },
    { title: 'The Trial', hook: 'Prove innocence or guilt in a formal proceeding', elements: ['evidence presentation', 'witness testimony', 'opposing counsel'] },
    { title: 'Festival or Celebration', hook: 'Interact with many NPCs in a festive setting', elements: ['competitions', 'rumors', 'unexpected encounters'] },
  ],
  puzzle: [
    { title: 'The Locked Room', hook: 'Escape or enter a sealed space using environmental clues', elements: ['mechanism discovery', 'component gathering', 'sequence solving'] },
    { title: 'The Guardian\'s Riddle', hook: 'Answer a guardian\'s challenge to proceed', elements: ['lore knowledge', 'multiple solutions', 'failure consequences'] },
    { title: 'The Machinery', hook: 'Activate or deactivate complex ancient machinery', elements: ['trial and error', 'observation clues', 'partial activation effects'] },
    { title: 'Environmental Puzzle', hook: 'Use the environment itself to solve a problem', elements: ['physics/magic interaction', 'tool usage', 'teamwork requirements'] },
    { title: 'The Code', hook: 'Decrypt a message or solve a coded lock', elements: ['cipher discovery', 'reference materials', 'partial solutions'] },
    { title: 'The Moral Dilemma', hook: 'A puzzle with no perfect solution—only trade-offs', elements: ['ethical weight', 'lasting consequences', 'character values'] },
  ],
  chase: [
    { title: 'Urban Pursuit', hook: 'Chase through crowded city streets', elements: ['crowd obstacles', 'shortcut opportunities', 'vertical options'] },
    { title: 'Vehicle Chase', hook: 'Pursue or flee using vehicles or mounts', elements: ['terrain hazards', 'vehicle actions', 'boarding attempts'] },
    { title: 'Wilderness Hunt', hook: 'Track prey through natural terrain', elements: ['tracking challenges', 'environmental hazards', 'ambush points'] },
    { title: 'Escape the Collapse', hook: 'Flee a collapsing structure or environment', elements: ['falling debris', 'blocked routes', 'rescue opportunities'] },
    { title: 'The Heist Getaway', hook: 'Escape with the goods while pursued', elements: ['package protection', 'misdirection', 'safe house location'] },
    { title: 'Supernatural Pursuit', hook: 'Flee or chase something that doesn\'t follow normal rules', elements: ['unusual movement', 'sanctuary points', 'counter-measures'] },
  ],
  heist: [
    { title: 'The Vault', hook: 'Break into a heavily guarded vault', elements: ['security layers', 'guard patrols', 'alarm systems'] },
    { title: 'The Swap', hook: 'Replace an item without anyone noticing', elements: ['timing windows', 'distraction needs', 'forgery quality'] },
    { title: 'The Extraction', hook: 'Get a person out of a secure location', elements: ['subject cooperation', 'identity concealment', 'exit strategies'] },
    { title: 'The Con', hook: 'Deceive a target into giving up something willingly', elements: ['mark research', 'team roles', 'contingency plans'] },
    { title: 'The Plant', hook: 'Place something in a secure location', elements: ['access methods', 'concealment', 'verification avoidance'] },
    { title: 'The Inside Job', hook: 'Use an insider to accomplish the goal', elements: ['insider management', 'loyalty concerns', 'information access'] },
  ],
};

/**
 * Generate scene ideas for adventure building
 */
export default async function generateSceneIdeas(
  params: SceneParams
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { sceneType, environment, tension = 'medium', count = 3 } = params;

  try {
    let scenes: Array<{ title: string; hook: string; elements: string[] }> = [];

    if (sceneType === 'random') {
      const allTypes = Object.keys(SCENE_TEMPLATES) as Array<keyof typeof SCENE_TEMPLATES>;
      for (let i = 0; i < count; i++) {
        const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
        const typeScenes = SCENE_TEMPLATES[randomType];
        const randomScene = typeScenes[Math.floor(Math.random() * typeScenes.length)];
        scenes.push(randomScene);
      }
    } else {
      const typeScenes = SCENE_TEMPLATES[sceneType] || [];
      const shuffled = [...typeScenes].sort(() => Math.random() - 0.5);
      scenes = shuffled.slice(0, count);
    }

    const output = formatSceneOutput(scenes, sceneType, environment, tension);

    return {
      content: [{ type: 'text', text: output }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error generating scenes: ${errorMessage}` }]
    };
  }
}

function formatSceneOutput(
  scenes: Array<{ title: string; hook: string; elements: string[] }>,
  sceneType: string,
  environment: string | undefined,
  tension: string
): string {
  const lines: string[] = [];

  lines.push('# Generated Scene Ideas');
  lines.push('');
  lines.push(`**Type:** ${sceneType.charAt(0).toUpperCase() + sceneType.slice(1)}`);
  if (environment) {
    lines.push(`**Environment:** ${environment}`);
  }
  lines.push(`**Tension Level:** ${tension}`);
  lines.push('');

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    lines.push(`## Scene ${i + 1}: ${scene.title}`);
    lines.push('');
    lines.push(`**Hook:** ${scene.hook}`);
    lines.push('');

    if (environment) {
      lines.push(`**In your ${environment}:**`);
      lines.push(`- Adapt the setting: How does ${environment} change this scene?`);
      lines.push(`- Local flavor: What unique elements does ${environment} add?`);
      lines.push('');
    }

    lines.push('**Key Elements:**');
    for (const element of scene.elements) {
      lines.push(`- ${element}`);
    }
    lines.push('');

    // Tension-based additions
    lines.push('**Tension Adjustments:**');
    switch (tension) {
      case 'low':
        lines.push('- Players have time to plan');
        lines.push('- Stakes are personal but not dire');
        lines.push('- Failure is recoverable');
        break;
      case 'medium':
        lines.push('- Time pressure exists but isn\'t crushing');
        lines.push('- Stakes affect NPCs or party goals');
        lines.push('- Failure has consequences but alternatives exist');
        break;
      case 'high':
        lines.push('- Immediate time pressure');
        lines.push('- Stakes are high—lives or major goals at risk');
        lines.push('- Failure has lasting negative effects');
        break;
      case 'climax':
        lines.push('- Everything comes down to this moment');
        lines.push('- Stakes are the highest they\'ve been');
        lines.push('- Success or failure defines the story\'s direction');
        lines.push('- All previous threads converge here');
        break;
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Scene building tips
  lines.push('## Scene Building Tips');
  lines.push('');
  lines.push('1. **Start with action:** Begin scenes in media res when possible');
  lines.push('2. **Clear objectives:** Players should know what success looks like');
  lines.push('3. **Multiple solutions:** Combat, stealth, social, or creative approaches');
  lines.push('4. **Consequences:** Scene outcomes should matter to the story');
  lines.push('5. **Character moments:** Include opportunities for roleplay');
  lines.push('');

  return lines.join('\n');
}
