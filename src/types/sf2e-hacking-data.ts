/**
 * Starfinder 2e Hacking Subsystem Reference Data
 * Based on SF2e GM Core - Hacking Subsystem
 */

// =============================================================================
// COMPUTER TYPES
// =============================================================================

export interface ComputerType {
  name: string;
  traits: string[];
  description: string;
  typicalHackingSkills: string[];
  examples: string[];
}

export const COMPUTER_TYPES: Record<string, ComputerType> = {
  tech: {
    name: "Technological",
    traits: ["tech"],
    description: "Standard technological computers hacked using technical skills.",
    typicalHackingSkills: ["Computers", "Crafting", "Thievery"],
    examples: [
      "Security terminal",
      "Corporate database",
      "Starship navigation console",
      "Personal comm unit",
      "Automated defense system"
    ]
  },
  magic: {
    name: "Magical",
    traits: ["magic"],
    description: "Magical computers incorporating programmable aeon stones, bound spirits, or arcane constructs.",
    typicalHackingSkills: ["Arcana", "Nature", "Occultism", "Religion"],
    examples: [
      "Aeon stone computer",
      "Bound machine spirit",
      "Arcane construct controller",
      "Telepathic data crystal",
      "Living computational organism"
    ]
  },
  hybrid: {
    name: "Hybrid",
    traits: ["tech", "magic"],
    description: "Computers combining technological and magical elements, often with separate access points for each.",
    typicalHackingSkills: ["Computers", "Crafting", "Arcana", "Occultism"],
    examples: [
      "Password-protected spell chip",
      "Arcane barrier with console control",
      "Magitech security system",
      "Technomancer's encrypted grimoire",
      "Divine-tech navigation beacon"
    ]
  }
};

// =============================================================================
// COMPLEXITY LEVELS
// =============================================================================

export interface ComplexityLevel {
  name: string;
  description: string;
  accessPoints: string;
  vulnerabilities: string;
  timing: string;
  recommendations: string[];
}

export const COMPLEXITY_LEVELS: Record<string, ComplexityLevel> = {
  simple: {
    name: "Simple",
    description: "Quick, streamlined hacking that functions like a simple hazard. One access point, no vulnerabilities.",
    accessPoints: "1",
    vulnerabilities: "None (or 1 custom)",
    timing: "Two-action activity",
    recommendations: [
      "Use when hacking isn't the primary obstacle",
      "Allow up to 2 additional failures if no time pressure",
      "Good for door locks, basic terminals, simple security",
      "Adding more than 1 vulnerability makes it complex"
    ]
  },
  complex: {
    name: "Complex",
    description: "Multi-round hacking encounter where each PC can act once per round to exploit vulnerabilities, disable countermeasures, or Hack access points.",
    accessPoints: "1-3",
    vulnerabilities: "Multiple per access point",
    timing: "Multiple rounds (variable)",
    recommendations: [
      "Use when hacking IS the primary obstacle",
      "Each round without attempting Hack accrues 1 failure",
      "Character attempting Hack usually goes last",
      "Provide multiple paths to success"
    ]
  }
};

// =============================================================================
// DC GUIDELINES (Based on Hazard Tables)
// =============================================================================

export interface HackingDCsByLevel {
  level: number;
  low: number;
  high: number;
  elite: number;
}

// DCs based on hazard Stealth/Disable tables
export const HACKING_DCS_BY_LEVEL: HackingDCsByLevel[] = [
  { level: 0, low: 14, high: 18, elite: 20 },
  { level: 1, low: 15, high: 19, elite: 21 },
  { level: 2, low: 16, high: 20, elite: 22 },
  { level: 3, low: 18, high: 22, elite: 24 },
  { level: 4, low: 19, high: 23, elite: 25 },
  { level: 5, low: 20, high: 24, elite: 26 },
  { level: 6, low: 22, high: 26, elite: 28 },
  { level: 7, low: 23, high: 27, elite: 29 },
  { level: 8, low: 24, high: 28, elite: 30 },
  { level: 9, low: 26, high: 30, elite: 32 },
  { level: 10, low: 27, high: 31, elite: 33 },
  { level: 11, low: 28, high: 32, elite: 34 },
  { level: 12, low: 30, high: 34, elite: 36 },
  { level: 13, low: 31, high: 35, elite: 37 },
  { level: 14, low: 32, high: 36, elite: 38 },
  { level: 15, low: 34, high: 38, elite: 40 },
  { level: 16, low: 35, high: 39, elite: 41 },
  { level: 17, low: 36, high: 40, elite: 42 },
  { level: 18, low: 38, high: 42, elite: 44 },
  { level: 19, low: 39, high: 43, elite: 45 },
  { level: 20, low: 40, high: 44, elite: 46 }
];

// DC reduction values based on vulnerability difficulty
export const VULNERABILITY_DC_REDUCTION = {
  low: 1,    // Low DC vulnerabilities reduce Hack DC by 1
  high: 2,   // High DC vulnerabilities reduce Hack DC by 2
  elite: 3   // Elite DC vulnerabilities reduce Hack DC by 3
};

// =============================================================================
// SAMPLE VULNERABILITIES
// =============================================================================

export interface VulnerabilityTemplate {
  name: string;
  description: string;
  skills: string[];
  category: string;
  difficultyTier: 'low' | 'high' | 'elite';
}

export const VULNERABILITY_TEMPLATES: VulnerabilityTemplate[] = [
  // Social Engineering
  {
    name: "Deduce username or password",
    description: "Figure out login credentials through research or observation",
    skills: ["Perception", "Society", "Lore (relevant to target)"],
    category: "social",
    difficultyTier: "low"
  },
  {
    name: "Call customer service for access",
    description: "Social engineer support staff into providing access",
    skills: ["Deception", "Diplomacy"],
    category: "social",
    difficultyTier: "high"
  },
  {
    name: "Bribe or threaten server administrator",
    description: "Convince an admin to grant access through persuasion or coercion",
    skills: ["Diplomacy", "Intimidation"],
    category: "social",
    difficultyTier: "elite"
  },
  {
    name: "Pretend to be investor, partner, or regulator",
    description: "Impersonate someone with legitimate access",
    skills: ["Deception", "Lore (relevant to target)"],
    category: "social",
    difficultyTier: "high"
  },
  {
    name: "Find another hacker to give you access",
    description: "Locate traces of another intrusion and convince that hacker to help",
    skills: ["Diplomacy", "Society"],
    category: "social",
    difficultyTier: "elite"
  },
  {
    name: "Join cleaning crew to gain building access",
    description: "Infiltrate support staff to reach physical terminals",
    skills: ["Deception", "Society"],
    category: "social",
    difficultyTier: "high"
  },
  // Technical
  {
    name: "Steal or spoof two-factor authentication",
    description: "Bypass secondary authentication through theft or forgery",
    skills: ["Crafting", "Thievery"],
    category: "technical",
    difficultyTier: "elite"
  },
  {
    name: "Program keylogger in music file",
    description: "Hide malicious code in an innocuous file",
    skills: ["Computers", "Performance"],
    category: "technical",
    difficultyTier: "high"
  },
  {
    name: "Create fake site to phish for password",
    description: "Set up a convincing fake login page",
    skills: ["Computers", "Society"],
    category: "technical",
    difficultyTier: "high"
  },
  {
    name: "Phreak server with a whistle",
    description: "Use audio frequencies to manipulate old systems",
    skills: ["Crafting", "Performance"],
    category: "technical",
    difficultyTier: "elite"
  },
  {
    name: "Denial-of-service attack",
    description: "Overwhelm the system to create an opening",
    skills: ["Computers", "Diplomacy", "Performance"],
    category: "technical",
    difficultyTier: "high"
  },
  {
    name: "Jury-rig electromagnetic winch",
    description: "Use improvised tech to wipe backup servers",
    skills: ["Crafting", "Piloting"],
    category: "technical",
    difficultyTier: "elite"
  },
  // Physical
  {
    name: "Survey outside server farm for buried cable",
    description: "Find physical access points through environmental observation",
    skills: ["Nature", "Survival"],
    category: "physical",
    difficultyTier: "low"
  },
  {
    name: "Physically retrieve data from autopilot module",
    description: "Reach a physically challenging access point",
    skills: ["Acrobatics", "Piloting"],
    category: "physical",
    difficultyTier: "elite"
  },
  {
    name: "Steal comm unit from employee on lunch break",
    description: "Pickpocket or snatch an authorized device",
    skills: ["Stealth", "Thievery"],
    category: "physical",
    difficultyTier: "high"
  },
  {
    name: "Scale communication tower for cable access",
    description: "Climb to reach physical network infrastructure",
    skills: ["Acrobatics", "Athletics"],
    category: "physical",
    difficultyTier: "high"
  },
  {
    name: "Fake fingerprint authentication",
    description: "Create biometric forgery to bypass scanners",
    skills: ["Deception", "Medicine"],
    category: "physical",
    difficultyTier: "elite"
  },
  // Magical
  {
    name: "Use divination to determine password",
    description: "Magically discern authentication information",
    skills: ["Occultism", "Religion"],
    category: "magical",
    difficultyTier: "high"
  },
  {
    name: "Cast ritual to access magitech components",
    description: "Use magical means to interface with hybrid systems",
    skills: ["Arcana", "Nature", "Occultism", "Religion"],
    category: "magical",
    difficultyTier: "elite"
  },
  // Unusual
  {
    name: "Play vidgame to discover hidden zone",
    description: "Navigate virtual environment to find backup data",
    skills: ["Piloting", "Vidgame Lore"],
    category: "unusual",
    difficultyTier: "high"
  }
];

// =============================================================================
// SAMPLE COUNTERMEASURES
// =============================================================================

export interface CountermeasureTemplate {
  name: string;
  description: string;
  effect: string;
  noticeSkills: string[];
  disableSkills: string[];
  persistent: boolean;
  severity: 'minor' | 'moderate' | 'severe';
}

export const COUNTERMEASURE_TEMPLATES: CountermeasureTemplate[] = [
  {
    name: "Account Lockout",
    description: "System admin bans or locks the account",
    effect: "No further Hack attempts on this access point until lockout is cleared",
    noticeSkills: ["Computers", "Perception"],
    disableSkills: ["Deception", "Intimidation"],
    persistent: false,
    severity: "moderate"
  },
  {
    name: "Misleading Information",
    description: "You think you've succeeded but find false data or attract authorities",
    effect: "Information gained is incorrect; authorities may be alerted",
    noticeSkills: ["Computers", "Crafting", "Perception"],
    disableSkills: ["Stealth", "Thievery"],
    persistent: false,
    severity: "moderate"
  },
  {
    name: "Data Corruption",
    description: "Files are a mess and being deleted quickly",
    effect: "Success provides incomplete or corrupted information",
    noticeSkills: ["Society", "Survival"],
    disableSkills: ["Computers", "Crafting"],
    persistent: true,
    severity: "severe"
  },
  {
    name: "Two-Factor Lock",
    description: "Account locked until physical dongle or comm unit authorizes",
    effect: "Must obtain physical authentication device to continue",
    noticeSkills: ["Perception"],
    disableSkills: ["Crafting", "Thievery", "Lore (relevant)"],
    persistent: false,
    severity: "moderate"
  },
  {
    name: "Admin Alert",
    description: "An administrator notices attempts and blocks access",
    effect: "Current session terminated; may need to find new approach",
    noticeSkills: ["Perception"],
    disableSkills: ["Computers", "Diplomacy", "Intimidation"],
    persistent: false,
    severity: "minor"
  },
  {
    name: "Physical Security Alert",
    description: "A security guard notices you and asks for identification",
    effect: "Must deal with physical security presence",
    noticeSkills: ["Perception"],
    disableSkills: ["Deception", "Stealth"],
    persistent: false,
    severity: "moderate"
  },
  {
    name: "Hellknight Trace",
    description: "A Hellknight hacker notices your vigilantism and attempts to track you",
    effect: "Your location may be compromised; pursuit possible",
    noticeSkills: ["Society"],
    disableSkills: ["Stealth", "Survival"],
    persistent: true,
    severity: "severe"
  },
  {
    name: "Reporting Threat",
    description: "Administrator catches activity and threatens to report you",
    effect: "Must convince admin not to report or face consequences",
    noticeSkills: ["Perception"],
    disableSkills: ["Deception", "Diplomacy", "Intimidation"],
    persistent: false,
    severity: "minor"
  },
  {
    name: "Hypnotic Virus",
    description: "Magitech virus flashes hypnotic visuals to confuse you",
    effect: "Mental effects may impair further attempts",
    noticeSkills: ["Arcana", "Occultism"],
    disableSkills: ["Arcana", "Occultism", "Will save"],
    persistent: true,
    severity: "moderate"
  },
  {
    name: "First World Curse",
    description: "Computer sprouts plants as a viral curse takes hold",
    effect: "Physical hazard emerges; system becomes unstable",
    noticeSkills: ["Perception"],
    disableSkills: ["Nature", "Survival"],
    persistent: true,
    severity: "severe"
  },
  {
    name: "EMP Wipe",
    description: "An EMP takes out the entire database",
    effect: "All data destroyed; no Success benefits possible",
    noticeSkills: ["Perception"],
    disableSkills: ["Athletics", "Thievery"],
    persistent: false,
    severity: "severe"
  },
  {
    name: "Counter-Scam",
    description: "You fall for a counter-scam and lose credits",
    effect: "Lose 500 credits (scales with level)",
    noticeSkills: ["Computers"],
    disableSkills: ["Thievery", "Computers"],
    persistent: true,
    severity: "minor"
  },
  {
    name: "Silent Alarm",
    description: "Alarm triggered without your knowledge",
    effect: "Authorities dispatched; time pressure begins",
    noticeSkills: ["Crafting", "Perception"],
    disableSkills: ["Stealth", "Thievery"],
    persistent: false,
    severity: "moderate"
  }
];

// =============================================================================
// ACCESS POINT TYPES
// =============================================================================

export interface AccessPointType {
  name: string;
  type: 'physical' | 'remote';
  description: string;
  requirements: string;
}

export const ACCESS_POINT_TYPES: AccessPointType[] = [
  {
    name: "Terminal Console",
    type: "physical",
    description: "A physical terminal requiring direct access",
    requirements: "Must be adjacent to the terminal"
  },
  {
    name: "Network Port",
    type: "physical",
    description: "A hardwired network connection point",
    requirements: "Must physically connect to the port"
  },
  {
    name: "Biometric Scanner",
    type: "physical",
    description: "Requires biological authentication",
    requirements: "Must provide or fake biometric data"
  },
  {
    name: "Remote Server",
    type: "remote",
    description: "Accessible over the infosphere",
    requirements: "Requires network access and credentials"
  },
  {
    name: "Personal Account",
    type: "remote",
    description: "A user's personal access credentials",
    requirements: "Requires username and authentication"
  },
  {
    name: "Backdoor Exploit",
    type: "remote",
    description: "An unpatched vulnerability in the system",
    requirements: "Requires knowledge of the exploit"
  },
  {
    name: "Wireless Access Point",
    type: "remote",
    description: "A wireless network connection",
    requirements: "Must be within wireless range"
  },
  {
    name: "Aeon Stone Interface",
    type: "physical",
    description: "A magical crystal requiring attunement",
    requirements: "Must physically hold and attune to the stone"
  }
];

// =============================================================================
// SUCCESS REWARDS
// =============================================================================

export interface SuccessReward {
  category: string;
  examples: string[];
  valueGuidance: string;
}

export const SUCCESS_REWARDS: SuccessReward[] = [
  {
    category: "System Control",
    examples: [
      "Control doors, turrets, and alarms",
      "Disable security systems",
      "Manipulate environmental controls",
      "Access restricted areas"
    ],
    valueGuidance: "Primary reward for infiltration scenarios"
  },
  {
    category: "Information",
    examples: [
      "Schedules and itineraries",
      "Personnel files and contact information",
      "Corporate secrets and financial data",
      "Evidence of crimes"
    ],
    valueGuidance: "Can provide circumstance bonuses (+1 to +2) to relevant checks"
  },
  {
    category: "Financial",
    examples: [
      "Drain funds from credstick",
      "Route funds to burner account",
      "Access encrypted payment info",
      "Counterfeit credentials"
    ],
    valueGuidance: "Scale with level; up to 25,000 credits for high-level critical success"
  },
  {
    category: "Credentials",
    examples: [
      "Steal or counterfeit access badges",
      "Clone authentication tokens",
      "Create fake identities",
      "Forge official documents"
    ],
    valueGuidance: "Opens doors for future encounters"
  },
  {
    category: "Intelligence",
    examples: [
      "Military intelligence",
      "Secret magic rituals",
      "Crafting formulas",
      "Proprietary technology specs"
    ],
    valueGuidance: "May be valuable to sell to interested parties"
  },
  {
    category: "Digital Assets",
    examples: [
      "Transfer proprietary vidgame items",
      "Steal software or media",
      "Copy restricted databases",
      "Acquire rare digital collectibles"
    ],
    valueGuidance: "Can supplement character income"
  }
];

// =============================================================================
// COMPUTER CONCEPTS
// =============================================================================

export interface ComputerConcept {
  name: string;
  description: string;
  suggestedType: 'tech' | 'magic' | 'hybrid';
  suggestedComplexity: 'simple' | 'complex';
  thematicVulnerabilities: string[];
  thematicCountermeasures: string[];
}

export const COMPUTER_CONCEPTS: ComputerConcept[] = [
  {
    name: "Corporate Database",
    description: "A secure server containing sensitive business information",
    suggestedType: "tech",
    suggestedComplexity: "complex",
    thematicVulnerabilities: ["Social engineering customer service", "Phishing attacks", "Insider threats"],
    thematicCountermeasures: ["Account lockout", "Admin alerts", "Legal threats"]
  },
  {
    name: "Security Terminal",
    description: "A console controlling doors, cameras, and alarms",
    suggestedType: "tech",
    suggestedComplexity: "simple",
    thematicVulnerabilities: ["Stolen credentials", "Physical access"],
    thematicCountermeasures: ["Silent alarm", "Physical security response"]
  },
  {
    name: "Aeon Stone Computer",
    description: "A magical crystal programmed as a computer and comm unit",
    suggestedType: "magic",
    suggestedComplexity: "simple",
    thematicVulnerabilities: ["Attunement rituals", "Divination"],
    thematicCountermeasures: ["False attunement", "Magical backlash"]
  },
  {
    name: "Media Server",
    description: "A server containing unreleased entertainment content",
    suggestedType: "tech",
    suggestedComplexity: "complex",
    thematicVulnerabilities: ["Celebrity social engineering", "Fan community exploitation", "Backdoor exploits"],
    thematicCountermeasures: ["Content deletion", "Account blocking", "Legal action"]
  },
  {
    name: "Military Command System",
    description: "A secure system controlling military assets and intelligence",
    suggestedType: "hybrid",
    suggestedComplexity: "complex",
    thematicVulnerabilities: ["Rank impersonation", "Physical infiltration", "Encrypted backdoors"],
    thematicCountermeasures: ["Hellknight trace", "EMP wipe", "Physical security"]
  },
  {
    name: "Personal Comm Unit",
    description: "An individual's personal device with private data",
    suggestedType: "tech",
    suggestedComplexity: "simple",
    thematicVulnerabilities: ["Physical theft", "Password guessing", "Social engineering"],
    thematicCountermeasures: ["Remote wipe", "Location tracking"]
  },
  {
    name: "Interdimensional Data Tree",
    description: "A living computer storing data in fruits across realities",
    suggestedType: "magic",
    suggestedComplexity: "complex",
    thematicVulnerabilities: ["Lucid dreaming access", "Planar rituals", "Fey bargaining"],
    thematicCountermeasures: ["First World curse", "Reality instability", "Fey trickery"]
  },
  {
    name: "Starship Navigation Console",
    description: "The primary navigation and control system of a starship",
    suggestedType: "tech",
    suggestedComplexity: "simple",
    thematicVulnerabilities: ["Bridge access", "Engineering override"],
    thematicCountermeasures: ["Lockout", "Self-destruct warning"]
  },
  {
    name: "Bank Account Server",
    description: "A financial institution's customer data system",
    suggestedType: "tech",
    suggestedComplexity: "complex",
    thematicVulnerabilities: ["Credential theft", "Cross-site attacks", "Insider access"],
    thematicCountermeasures: ["Account freeze", "Counter-scam", "Legal investigation"]
  },
  {
    name: "Cult Ritual Database",
    description: "A secret repository of forbidden magical knowledge",
    suggestedType: "hybrid",
    suggestedComplexity: "complex",
    thematicVulnerabilities: ["Occult rituals", "Cult infiltration", "Bound spirit negotiation"],
    thematicCountermeasures: ["Hypnotic virus", "Magical backlash", "Cult response"]
  }
];

// =============================================================================
// STAT BLOCK GENERATION HELPERS
// =============================================================================

export function getDCsForLevel(level: number): HackingDCsByLevel {
  const clamped = Math.max(0, Math.min(20, level));
  return HACKING_DCS_BY_LEVEL[clamped];
}

export function getVulnerabilityReduction(difficulty: 'low' | 'high' | 'elite'): number {
  return VULNERABILITY_DC_REDUCTION[difficulty];
}

export function formatStatBlock(
  name: string,
  level: number,
  complexity: 'simple' | 'complex',
  traits: string[],
  description: string,
  accessPoints: Array<{
    name: string;
    type: 'physical' | 'remote';
    successes: number;
    hackDC: number;
    skills: string[];
    proficiency?: string;
    vulnerabilities: Array<{ name: string; dc: number; skills: string[]; reduction: number }>;
    countermeasures: Array<{ failures: number; effect: string; noticeDC: number; noticeSkills: string[]; disableDC: number; disableSkills: string[]; persistent?: boolean }>;
  }>,
  criticalSuccess?: string,
  success?: string
): string {
  const traitsStr = traits.map(t => t.toUpperCase()).join(' ');

  let output = `## ${name.toUpperCase()} COMPUTER ${level}\n`;
  output += `${complexity.toUpperCase()} ${traitsStr}\n\n`;
  output += `${description}\n\n`;

  for (const ap of accessPoints) {
    const profReq = ap.proficiency ? ` (${ap.proficiency})` : '';
    output += `**${ap.name}** (${ap.type}; ${ap.successes} Success${ap.successes > 1 ? 'es' : ''}) `;
    output += `DC ${ap.hackDC} ${ap.skills.join(' or ')}${profReq}\n\n`;

    if (ap.vulnerabilities.length > 0) {
      output += `**Vulnerabilities** `;
      output += ap.vulnerabilities.map(v =>
        `${v.name} (DC ${v.dc} ${v.skills.join(' or ')}; –${v.reduction})`
      ).join('; ') + '\n\n';
    }

    for (const cm of ap.countermeasures) {
      const persistentTag = cm.persistent ? '; persistent' : '';
      output += `**Countermeasures** (${cm.failures} Failures${persistentTag}) ${cm.effect}; `;
      output += `Notice DC ${cm.noticeDC} ${cm.noticeSkills.join(' or ')}; `;
      output += `Disable DC ${cm.disableDC} ${cm.disableSkills.join(' or ')}\n\n`;
    }
  }

  if (criticalSuccess) {
    output += `**Critical Success** ${criticalSuccess}\n\n`;
  }

  if (success) {
    output += `**Success** ${success}\n`;
  }

  return output;
}
