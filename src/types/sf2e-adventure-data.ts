/**
 * Starfinder 2e Adventure Building Reference Data
 * Based on SF2e GM Core - Campaign Structure and Adventure Design
 */

// =============================================================================
// CAMPAIGN STRUCTURES
// =============================================================================

export interface CampaignStructure {
  name: string;
  adventures: number;
  topLevel: string;
  timeFrame: string;
  description: string;
  adventureTypes: string[];
}

export const CAMPAIGN_STRUCTURES: Record<string, CampaignStructure> = {
  oneShot: {
    name: "One-Shot",
    adventures: 1,
    topLevel: "1 (often starts higher)",
    timeFrame: "1 session",
    description: "A single adventure played in one session. Works well for highly thematic adventures using characters or concepts players might not want to stick with long-term.",
    adventureTypes: ["exploration", "horror", "mystery", "weird"]
  },
  brief: {
    name: "Brief Campaign",
    adventures: 2,
    topLevel: "4-5",
    timeFrame: "3 months weekly, 6 months biweekly",
    description: "A brief, self-contained campaign ideal for introducing new players to Starfinder. Can be extended to a longer campaign if the group wishes.",
    adventureTypes: ["exploration", "investigation", "any"]
  },
  extended: {
    name: "Extended Campaign",
    adventures: 5,
    topLevel: "11-13",
    timeFrame: "1 year weekly, 1.5 years biweekly",
    description: "Works well for a dedicated group that might want to switch to a new campaign after a year or so. Allows significant character and plot development without reaching higher levels.",
    adventureTypes: ["multiple fitting main theme", "any"]
  },
  epic: {
    name: "Epic Campaign",
    adventures: 6,
    topLevel: "20",
    timeFrame: "1.5 years weekly, 3 years biweekly",
    description: "An ambitious and complex game taking PCs all the way to level 20, pitting them against the greatest threats in the galaxy and beyond.",
    adventureTypes: ["6 long adventures", "any"]
  }
};

// =============================================================================
// ADVENTURE STYLES (RECIPES)
// =============================================================================

export interface AdventureStyle {
  name: string;
  sessions: string;
  explorationScenes: string[];
  combatEncounters: {
    trivial: number;
    low: number;
    moderate: number;
    severe: number;
    extreme?: number;
    notes?: string;
  };
  roleplayEncounters: string[];
  encounterTropes: string[];
}

export const ADVENTURE_STYLES: Record<string, AdventureStyle> = {
  exploration: {
    name: "Exploration",
    sessions: "3-4",
    explorationScenes: [
      "1 long voyage to reach the complex or site",
      "3 voyages through long, trapped hallways or mazes",
      "1 secure hangar or other staging area",
      "2 secret rooms"
    ],
    combatEncounters: {
      trivial: 2,
      low: 8,
      moderate: 6,
      severe: 2,
      notes: "Many encounters can be bypassed through secret routes or by infiltrating using skills and spells."
    },
    roleplayEncounters: [
      "4 conversations with security guards, workers, prisoners, or other creatures",
      "1 negotiation to establish a truce or business deal with the faction controlling the site"
    ],
    encounterTropes: [
      "Laser-trapped hallways",
      "Security cameras and robotic sentries",
      "Vaulted chambers and long hallways",
      "Catwalks, traps, and puzzles"
    ]
  },
  dystopian: {
    name: "Dystopian Adventure",
    sessions: "5-7",
    explorationScenes: [
      "1 long voyage in outer space, plagued by attacks",
      "2-3 explorations of sites in urban environments or outer space",
      "1 prison break, heist, or other test of skill"
    ],
    combatEncounters: {
      trivial: 4,
      low: 7,
      moderate: 7,
      severe: 4,
      extreme: 1,
      notes: "Foes are often intelligent and represent rival factions, law enforcement, or outlaws."
    },
    roleplayEncounters: [
      "2 battles of wits",
      "2 chances to best opponents with deception or threats",
      "2 opportunities to gather information and rumors"
    ],
    encounterTropes: [
      "Personal stakes (clearing names, eliminating problems for pay)",
      "Betrayal, ambushes, and duplicity",
      "Urban disasters, piracy, unfriendly crowds",
      "Untrustworthy allies who might betray PCs",
      "Downtime: hard labor, seedy clubs, criminal activities"
    ]
  },
  horror: {
    name: "Horror",
    sessions: "1-2",
    explorationScenes: [
      "1 short voyage full of ill omens",
      "2-4 creepy areas to investigate (haunted reactors, cursed magitech labs)"
    ],
    combatEncounters: {
      trivial: 0,
      low: 0,
      moderate: 2,
      severe: 1,
      extreme: 1,
      notes: "Avoid trivial/low encounters except as relief. Extreme encounters against overwhelming foes are excellent in horror one-shots."
    },
    roleplayEncounters: [
      "2 conversations with doubtful authority figures",
      "1 opportunity to gather information and rumors",
      "1 revelation of a horrible truth"
    ],
    encounterTropes: [
      "Surprising and jarring encounters",
      "Encounters that feel overwhelming even when they're not",
      "Retreat is often the right option (include escape routes)",
      "Environmental storytelling reveals terrible secrets"
    ]
  },
  infiltration: {
    name: "Infiltration",
    sessions: "2-3",
    explorationScenes: [
      "1 voyage, or a tour of a site's location and defenses",
      "2-3 trapped rooms and vaults"
    ],
    combatEncounters: {
      trivial: 0,
      low: 4,
      moderate: 4,
      severe: 1,
      notes: "Most combat encounters can be bypassed with stealth and subterfuge."
    },
    roleplayEncounters: [
      "1-2 encounters with security patrols or workers in which PCs must avoid suspicion or resort to combat"
    ],
    encounterTropes: [
      "Secure complexes with locked and trapped doors",
      "Automated defenses and security patrols",
      "Goal/deadline oriented victory conditions",
      "Examples: controlling fortress while uploading virus, robbing bank, rescuing prisoners"
    ]
  },
  intrigue: {
    name: "Intrigue",
    sessions: "2-3",
    explorationScenes: [
      "3-4 competitions, performances, or other tests of skill",
      "1-2 infiltrations or escapes"
    ],
    combatEncounters: {
      trivial: 2,
      low: 2,
      moderate: 4,
      severe: 1,
      notes: "Severe encounters reserved for major reveals - ally revealed as foe, schemer exposed and calls bodyguards."
    },
    roleplayEncounters: [
      "2-3 battles of wits",
      "2 political or courtroom scenes",
      "1 conversation with a cryptic source",
      "2 opportunities to gather information and rumors"
    ],
    encounterTropes: [
      "Urban environments: fights atop racing vehicles, around furniture, between rooftops",
      "Ambushes in apparently safe social settings",
      "Assassination attempts"
    ]
  },
  military: {
    name: "Military Adventure",
    sessions: "2-3",
    explorationScenes: [
      "1 long voyage and 2-3 patrols, or tour of defenses for invasion",
      "2-3 trapped enemy outposts and enemy starship squads"
    ],
    combatEncounters: {
      trivial: 0,
      low: 4,
      moderate: 4,
      severe: 1,
      notes: "Most combat should be 2-4 foes, typically troopers with range of capabilities."
    },
    roleplayEncounters: [
      "1-2 skill challenges to convince neutral parties to become allies or raise morale",
      "1-2 conversations with commanding officers"
    ],
    encounterTropes: [
      "Fortified battlegrounds with automated defenses",
      "Epic starship battles in space or atmosphere",
      "Goal/deadline victory conditions: defeating squad, capturing planet/starship, infiltrating fortress, stealing weapon"
    ]
  },
  mystery: {
    name: "Mystery",
    sessions: "2-3",
    explorationScenes: [
      "2-3 trapped rooms, concealed hideouts, or tests of skill",
      "2 puzzles or investigations"
    ],
    combatEncounters: {
      trivial: 2,
      low: 4,
      moderate: 6,
      severe: 6,
      notes: "Solving the mystery uncovers advantage over powerful foe or reveals important secret."
    },
    roleplayEncounters: [
      "1 battle of wits",
      "1 conversation with unusual ally",
      "1 opportunity to gather information and rumors",
      "1 gathering to reveal the answer to the mystery"
    ],
    encounterTropes: [
      "Encounters come naturally during investigations or upon discovering mystery elements",
      "Multiple clues can send PCs to same locations",
      "If mystery stalls, have enemy attack to move plot forward"
    ]
  },
  planar: {
    name: "Planar Adventure",
    sessions: "6-8",
    explorationScenes: [
      "3-4 long voyages through different planes (using magic, Drift engines, spells, or planar vessel) punctuated with combat",
      "1-2 scouting a demiplane, planar city/fortress, or other planar stronghold"
    ],
    combatEncounters: {
      trivial: 0,
      low: 4,
      moderate: 12,
      severe: 6,
      extreme: 2,
      notes: "Avoid trivial encounters except as set dressing to introduce a new plane."
    },
    roleplayEncounters: [
      "4 conversations with bizarre creatures (including some with alien ways of thinking)",
      "4 opportunities to gather information and rumors"
    ],
    encounterTropes: [
      "Otherworldly environs: churning colors of the Drift, hurricane-force winds",
      "Chunks of metal floating along rivers of lava",
      "Bottomless pits, cockpits of 100-foot-tall magical engines",
      "Breaching the gates of Hell"
    ]
  },
  romantic: {
    name: "Romantic Adventure",
    sessions: "4-6",
    explorationScenes: [
      "1 tour of a port of call",
      "1 adventure into outskirts (fight bandits, hunt, preserve wildlife)",
      "1 tournament to prove PC's love or outdo a rival"
    ],
    combatEncounters: {
      trivial: 2,
      low: 3,
      moderate: 6,
      severe: 1,
      notes: "Emphasize emotional stakes. Battles end with loss of honor or pride, not life."
    },
    roleplayEncounters: [
      "2 battles of wits",
      "1 gala or party",
      "1 entreaty before a socialite or political leader",
      "2 scenes of relaxation or carousing with unexpected import"
    ],
    encounterTropes: [
      "Duels (social or combat) against romantic rivals",
      "PCs and foes fight only for purpose or cause",
      "Enemies have strong connections to PCs",
      "Rivals might become lovers"
    ]
  },
  spaceOpera: {
    name: "Space Opera",
    sessions: "6-8",
    explorationScenes: [
      "2 long voyages in outer space, punctuated with combat",
      "1 exploration of dangerous complex, starship/street race, or other test of skill"
    ],
    combatEncounters: {
      trivial: 4,
      low: 10,
      moderate: 12,
      severe: 4,
      notes: "Large groups of low-level enemies PCs can defeat with ease."
    },
    roleplayEncounters: [
      "2 battles of wits",
      "4 conversations with potential allies"
    ],
    encounterTropes: [
      "Unique environments for dynamic battles",
      "Boarding starship during space battle, fighting atop skyscrapers",
      "Racing enercycles, dogfights between starships",
      "Use difficult terrain sparingly with creative ways around it"
    ]
  }
};

// =============================================================================
// THREATS
// =============================================================================

export interface Threat {
  name: string;
  description: string;
  gmGuidance: string[];
  typicalFoes: string[];
  secretThemes: string[];
}

export const THREATS: Record<string, Threat> = {
  corruption: {
    name: "Corruption",
    description: "The opposition wants to weaken or even change the motivation of a place, person, institution, ideal, or group.",
    gmGuidance: [
      "Show effects of corruption on people and places, especially those connected to PCs",
      "Once-safe areas become less friendly and present threats",
      "Allies become unable to help or turn against PCs",
      "Make enemies subtle, patient, willing to let rumors/lies/diseases/poisons take effect",
      "In battle, they might curse PCs and retreat",
      "Contrast corruption with education, healing, and uplifting progress",
      "When PCs make progress, allow them to expose agents and inoculate allies"
    ],
    typicalFoes: ["fiends", "Midwives", "psychic fungus", "undead"],
    secretThemes: [
      "Someone has been editing records to hide a massacre",
      "The cure was delayed intentionally to profit from treatment",
      "An institution's charitable arm is a front for dark purposes",
      "A respected leader was corrupted long ago",
      "The 'protection' offered by a faction comes with hidden costs"
    ]
  },
  devastation: {
    name: "Devastation",
    description: "The opposition wants to destroy or lay waste to a place, person, institution, ideal, or group.",
    gmGuidance: [
      "Show effects of destruction on people and places PCs hold dear",
      "Show them desperate, devoid of resources, psychologically changed",
      "Make enemies hard to reason with and overwhelming in number",
      "In battle, they want not just to win but to kill, maim, or devour",
      "Contrast devastation with forces of preservation and order",
      "When PCs make progress, show slow recovery from devastation"
    ],
    typicalFoes: ["dragons", "daemons", "Swarm"],
    secretThemes: [
      "The 'natural disaster' was artificially induced",
      "Someone is selling locations of refugee ships to raiders",
      "The devastation is a distraction for a larger scheme",
      "Survivors are being rounded up for dark purposes",
      "The weapon that caused this destruction still exists"
    ]
  },
  extremism: {
    name: "Extremism",
    description: "The opposition seeks massive change they think is for the better. Their violent means put them in conflict with the PCs.",
    gmGuidance: [
      "Demonstrate ruthlessness - care for cause vs ambivalence toward everything else",
      "Have enemies focus purely on their goal, fall back on rhetoric to justify themselves",
      "If something about their cause is just, reveal sympathetic side",
      "Show horror of what they're fighting against AND how they fight",
      "When PCs make progress, show uncertainty, demoralization, even desertion in enemy ranks"
    ],
    typicalFoes: ["angels", "cultists", "jinsuls", "terrorists"],
    secretThemes: [
      "The extremists' founder disagrees with current methods",
      "Their cause has legitimate grievances being exploited",
      "A moderate faction within could be turned",
      "Their methods mirror what was done to them",
      "The 'enemy' they fight is not what they believe"
    ]
  },
  mayhem: {
    name: "Mayhem",
    description: "The opposition is a force for mayhem without greater plan. Might be mindless violence or thinking foe reveling in chaos.",
    gmGuidance: [
      "Mayhem is easy to track - leaves trail of destruction",
      "Show how senseless violence causes uncertainty and fear",
      "Single powerful foe is common, but packs/cults also work",
      "Source might result from natural order out of balance",
      "Might be distraction set off by different foe for their own goals",
      "Emphasize cascading effects - trade, travel, systems disrupted",
      "When PCs make progress, show how resilient systems recover"
    ],
    typicalFoes: ["akatas", "beasts", "bloodbrothers", "dinosaurs", "gremlins", "orocorans"],
    secretThemes: [
      "The creature was released deliberately as a distraction",
      "Someone is profiting from the chaos",
      "The mayhem follows a pattern no one has noticed",
      "Something is driving the creatures to this behavior",
      "The 'random' attacks target specific things"
    ]
  },
  subjugation: {
    name: "Subjugation",
    description: "The opposition wants to rule over a group, location, or even the world. Their ultimate objective is control.",
    gmGuidance: [
      "Show groups submitting rather than suffering consequences of resistance",
      "Show culture destroyed to ensure subjugation - religions, churches subverted",
      "Lackeys put in place to keep oppressed populations in line",
      "Make enemies self-righteous, focused, in control of previously subjugated groups",
      "Fights are steps toward greater control, not just violence",
      "Show opposition: open conflict, rebellion, secret groups, sabotage, countercultural art",
      "When PCs make progress, have previously cowed parties rebel"
    ],
    typicalFoes: ["aeon guards", "Corpse Fleet", "devils", "dragons", "imperial troopers", "Swarm"],
    secretThemes: [
      "The subjugator was once subjugated themselves",
      "A collaborator is secretly working against the regime",
      "The control relies on a single point of failure",
      "The oppressed have hidden resources",
      "Former allies now serve the oppressor unwillingly"
    ]
  }
};

// =============================================================================
// STORY ARC GUIDANCE
// =============================================================================

export interface StoryArcElement {
  name: string;
  description: string;
  examples: string[];
}

export const STORY_ARC_ELEMENTS: StoryArcElement[] = [
  {
    name: "Use Motifs",
    description: "Use repeated thematic elements, visuals, phrases, and items to reinforce connections between adventures.",
    examples: [
      "A recurring symbol or sigil that appears at crime scenes",
      "A phrase or code word used by the opposition",
      "A specific type of technology that keeps appearing",
      "Weather or environmental conditions that herald danger",
      "A musical theme or sound associated with a faction"
    ]
  },
  {
    name: "Follow Character Growth",
    description: "Respond to how PCs changed in previous adventures. Their next undertaking should reflect who they are now.",
    examples: [
      "A PC who showed mercy now faces consequences of that choice",
      "Reputation from previous deeds opens or closes doors",
      "Skills learned in one adventure become crucial in the next",
      "Relationships formed earlier pay off or create complications",
      "Personal growth is tested by new challenges"
    ]
  },
  {
    name: "Escalate",
    description: "Build on previous story and show the next threat is scarier. Increase scope progressively.",
    examples: [
      "First adventure endangers a port, next a planet, then a system",
      "Enemy lieutenants lead to the mastermind",
      "Local corruption reveals galactic conspiracy",
      "Minor inconvenience becomes existential threat",
      "Personal stakes become universal stakes"
    ]
  },
  {
    name: "Recurring Characters",
    description: "A recurring character is especially strong if they appear in similar circumstances each time.",
    examples: [
      "Space pirate who appears when she wants PCs to undermine rivals or is robbing them",
      "Information broker who always has what's needed for a price",
      "Rival adventuring party that keeps showing up at the same opportunities",
      "Authority figure who doubts the PCs every time",
      "Merchant who sells increasingly dangerous goods"
    ]
  },
  {
    name: "Make Each Adventure Count",
    description: "Don't diminish individual adventures. Illustrate consequences so players feel accomplishment.",
    examples: [
      "NPCs reference events from previous adventures",
      "The world visibly changes based on PC actions",
      "Rewards from one adventure become useful in the next",
      "Failures have lasting consequences that create new plots",
      "Victories are celebrated or envied by NPCs"
    ]
  },
  {
    name: "Make Choices Matter",
    description: "Describe consequences of PC actions and allow their choices to shape the story.",
    examples: [
      "Spared enemy returns as ally or worse enemy",
      "Destroyed facility creates power vacuum",
      "Saved NPC provides crucial help later",
      "Chosen faction remembers the support",
      "Shortcuts taken come back to haunt PCs"
    ]
  }
];

// =============================================================================
// VILLAIN MOTIVATIONS
// =============================================================================

export interface VillainMotivation {
  category: string;
  questions: string[];
  examples: string[];
}

export const VILLAIN_MOTIVATIONS: VillainMotivation[] = [
  {
    category: "What does the opposition want?",
    questions: [
      "What is their ultimate goal?",
      "What would success look like for them?",
      "What are they willing to sacrifice to achieve it?"
    ],
    examples: [
      "Control over a specific resource or location",
      "Revenge against those who wronged them",
      "Power to reshape society according to their vision",
      "Protection of something they value above all else",
      "Ascension to godhood or transcendence"
    ]
  },
  {
    category: "Who or what does the opposition fear?",
    questions: [
      "What keeps them up at night?",
      "What would they do anything to prevent?",
      "Who could actually stop them?"
    ],
    examples: [
      "Discovery of their true nature or past",
      "A prophecy that predicts their downfall",
      "Loss of the one thing that gives them power",
      "Betrayal by those closest to them",
      "Return of an ancient enemy"
    ]
  },
  {
    category: "Why is the opposition sure to succeed?",
    questions: [
      "If PCs do nothing, what makes them unstoppable?",
      "What advantages do they have?",
      "Why hasn't anyone stopped them already?"
    ],
    examples: [
      "Vast resources and loyal followers",
      "Knowledge no one else possesses",
      "Political protection or legitimate authority",
      "Magical or technological superiority",
      "No one believes they exist or are a threat"
    ]
  },
  {
    category: "What are the opposition's weaknesses?",
    questions: [
      "How can they be bribed or tricked?",
      "What do they ignore that might be used against them?",
      "What would make them abandon their plan?"
    ],
    examples: [
      "Arrogance that blinds them to certain threats",
      "Emotional attachment that can be exploited",
      "Reliance on specific resources or allies",
      "Internal divisions that can be widened",
      "A code or principle they won't violate"
    ]
  }
];

// =============================================================================
// NPC ARCHETYPES FOR ADVENTURES
// =============================================================================

export interface NPCArchetype {
  role: string;
  description: string;
  variations: string[];
  connectionToTheme: Record<string, string>;
}

export const NPC_ARCHETYPES: NPCArchetype[] = [
  {
    role: "The Ally",
    description: "Someone who genuinely wants to help the PCs, though their methods or information might be imperfect.",
    variations: [
      "The mentor who knows more than they're saying",
      "The rookie who needs protection but provides unique insight",
      "The reformed enemy seeking redemption",
      "The professional with useful skills and contacts"
    ],
    connectionToTheme: {
      corruption: "Fighting against the corruption, possibly already compromised",
      devastation: "Survivor trying to rebuild, can guide PCs to resources",
      extremism: "Moderate voice being drowned out by radicals",
      mayhem: "Tracker or hunter who can help find the source",
      subjugation: "Resistance member with inside information"
    }
  },
  {
    role: "The Questgiver",
    description: "The NPC who provides missions, whether as employer, authority figure, or desperate petitioner.",
    variations: [
      "The wealthy patron with resources and secrets",
      "The government official walking political tightropes",
      "The desperate civilian with nothing to offer but gratitude",
      "The faction representative advancing their agenda"
    ],
    connectionToTheme: {
      corruption: "May be corrupted themselves or fighting it",
      devastation: "Trying to prevent further destruction",
      extremism: "Caught between factions, needs neutral help",
      mayhem: "Suffering from the chaos, offers what they can",
      subjugation: "Either enforcing or resisting control"
    }
  },
  {
    role: "The Rival",
    description: "Not quite an enemy, but someone competing with the PCs for the same goals or resources.",
    variations: [
      "The professional competitor with grudging respect",
      "The jealous peer who sees PCs as threat to their status",
      "The mirror image with similar methods but different values",
      "The former ally turned competitor by circumstance"
    ],
    connectionToTheme: {
      corruption: "Racing to expose OR profit from the corruption",
      devastation: "Competing for salvage or survival resources",
      extremism: "Caught up in the cause, might be turned",
      mayhem: "Hunting the same target for different reasons",
      subjugation: "Trying to claim power in the new order"
    }
  },
  {
    role: "The Wild Card",
    description: "An unpredictable element whose allegiances and actions can swing the story in unexpected directions.",
    variations: [
      "The trickster who helps and hinders based on whim",
      "The information broker who sells to all sides",
      "The neutral power broker maintaining balance",
      "The chaotic entity following incomprehensible logic"
    ],
    connectionToTheme: {
      corruption: "Spreads truth and lies equally",
      devastation: "Profits from chaos while secretly working to end it",
      extremism: "Sees through all ideologies, helps expose hypocrisy",
      mayhem: "Might be causing it, stopping it, or just enjoying the show",
      subjugation: "Undermines all authority equally"
    }
  },
  {
    role: "The Innocent",
    description: "Someone caught up in events beyond their control, giving PCs something to protect and humanizing stakes.",
    variations: [
      "The child who saw something they shouldn't",
      "The worker just trying to survive",
      "The true believer manipulated by the opposition",
      "The bystander in the wrong place at the wrong time"
    ],
    connectionToTheme: {
      corruption: "Unknowingly serving the corrupt, or first victim",
      devastation: "Refugee or survivor representing what's at stake",
      extremism: "Family member of extremist, torn between loyalty and doubt",
      mayhem: "Potential victim the PCs can save or fail to save",
      subjugation: "The face of the oppressed population"
    }
  }
];

// =============================================================================
// SCENE TEMPLATES BY STYLE
// =============================================================================

export interface SceneTemplate {
  style: string;
  sceneTypes: {
    type: string;
    count: string;
    examples: string[];
  }[];
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    style: "exploration",
    sceneTypes: [
      { type: "voyage", count: "1 long", examples: ["Journey through uncharted space", "Navigation through asteroid field", "Drift travel with strange encounters"] },
      { type: "dungeon_crawl", count: "3", examples: ["Trapped corridors of derelict station", "Maze-like alien ruins", "Security-locked corporate facility"] },
      { type: "safe_zone", count: "1", examples: ["Secure hangar to regroup", "Hidden camp within the site", "Friendly outpost at the edge"] },
      { type: "discovery", count: "2", examples: ["Secret room with lore", "Hidden cache of treasure", "Unexpected ally or prisoner"] }
    ]
  },
  {
    style: "horror",
    sceneTypes: [
      { type: "approach", count: "1 short", examples: ["Voyage filled with ill omens", "Travel through dead space", "Arrival at suspiciously quiet location"] },
      { type: "investigation", count: "2-4", examples: ["Haunted reactor core", "Cursed magitech laboratory", "Infested cargo hold", "Abandoned medical bay"] },
      { type: "revelation", count: "1", examples: ["Discovery of horrible truth", "Confrontation with the real threat", "Moment of no return"] }
    ]
  },
  {
    style: "intrigue",
    sceneTypes: [
      { type: "competition", count: "3-4", examples: ["Public debate or trial", "Performance or exhibition", "Formal duel or contest", "Social gathering with hidden agendas"] },
      { type: "infiltration", count: "1-2", examples: ["Sneaking into restricted area", "Escaping compromised position", "Eavesdropping on secret meeting"] },
      { type: "battle_of_wits", count: "2-3", examples: ["Negotiation with stakes", "Verbal sparring at party", "Interrogation or interview"] }
    ]
  },
  {
    style: "spaceOpera",
    sceneTypes: [
      { type: "space_voyage", count: "2 long", examples: ["Dramatic journey between systems", "Chase through dangerous space", "Exploration of cosmic phenomena"] },
      { type: "action_setpiece", count: "1", examples: ["Starship race", "Boarding action", "Ground vehicle chase", "Zero-G combat in debris field"] },
      { type: "ally_recruitment", count: "4", examples: ["Convincing neutral party to help", "Reuniting with old friend", "Making deal with dubious ally", "Earning respect of powerful figure"] }
    ]
  }
];

// =============================================================================
// LINKING ADVENTURES GUIDANCE
// =============================================================================

export const ADVENTURE_LINKING_TIPS = [
  "Use NPCs who appear in both adventures",
  "Treasure or clue from one adventure becomes important later",
  "Fallout from PC choices causes next adventure or creates complications",
  "Adventures in same/neighboring regions have inherent link",
  "Journey between distant locations can be short interstitial adventure",
  "Random encounters during Drift travel or deep space",
  "Use similar locations and related creatures to form connections",
  "Recurring enemy types who evolve from minions to led by powerful boss",
  "Consider how each adventure's theme plays into campaign as whole",
  "Show established world elements changing to reflect new themes"
];
