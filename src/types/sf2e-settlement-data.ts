/**
 * Starfinder 2e Settlement Building Reference Data
 * Based on SF2e GM Core - Building Settlements
 */

// =============================================================================
// SETTLEMENT ROLES (Campaign Purpose)
// =============================================================================

export interface SettlementRole {
  name: string;
  description: string;
  examples: string[];
  typicalFeatures: string[];
}

export const SETTLEMENT_ROLES: Record<string, SettlementRole> = {
  homeBase: {
    name: "Home Base",
    description: "A major location the heroes visit again and again during their adventures. The party's primary hub for rest, resupply, and relationships.",
    examples: [
      "The station where the party docks between missions",
      "A city where they have contacts and allies",
      "The colony they're helping to establish"
    ],
    typicalFeatures: [
      "Reliable lodging and ship berth",
      "Trusted merchants and services",
      "Recurring NPCs with developing relationships",
      "Personal stakes in the settlement's wellbeing",
      "Safe haven from enemies (usually)"
    ]
  },
  questHub: {
    name: "Quest Hub",
    description: "A settlement that provides missions and jobs. The party visits to find work, gather information, and receive assignments.",
    examples: [
      "Mercenary guild headquarters",
      "Starfinder Society lodge",
      "Corporate employment center",
      "Frontier outpost with constant needs"
    ],
    typicalFeatures: [
      "Job boards or quest-giving NPCs",
      "Faction representatives",
      "Information brokers",
      "Rumor mills and cantinas",
      "Diverse clientele with varied needs"
    ]
  },
  adventureOrigin: {
    name: "Adventure Origin",
    description: "Where the party's adventures begin. Often a backwater outpost or frontier settlement that launches them into the wider galaxy.",
    examples: [
      "Small colony where PCs grew up or met",
      "Remote outpost that receives a distress signal",
      "Station where the party is stranded",
      "Settlement under threat that hires the party"
    ],
    typicalFeatures: [
      "Limited resources driving party outward",
      "Personal connections to NPCs",
      "Local threats that escalate to larger plots",
      "Modest but meaningful stakes",
      "Room to grow beyond"
    ]
  },
  distantCapital: {
    name: "Distant Capital",
    description: "A remote seat of power that issues edicts, commands armies, or threatens the party from afar. May be visited late in the campaign.",
    examples: [
      "The emperor's palace on a core world",
      "Corpse Fleet command station",
      "Corporate headquarters of the megacorp",
      "Pact Worlds government center"
    ],
    typicalFeatures: [
      "Extreme wealth and power on display",
      "Heavy security and bureaucracy",
      "High-stakes political intrigue",
      "Access requires significant effort",
      "Consequences for actions are severe"
    ]
  },
  waystation: {
    name: "Waystation",
    description: "A settlement visited briefly between adventures. Provides services and flavor but isn't central to the story.",
    examples: [
      "Fuel depot on a trade route",
      "Border checkpoint between systems",
      "Tourist destination for shore leave",
      "Trading post in the Vast"
    ],
    typicalFeatures: [
      "Basic services available",
      "Interesting but brief encounters",
      "Potential side quests or complications",
      "Local color and worldbuilding",
      "Easy to leave behind"
    ]
  },
  hostileTerritory: {
    name: "Hostile Territory",
    description: "An enemy settlement the party must infiltrate, assault, or navigate carefully. Every interaction carries risk.",
    examples: [
      "Pirate haven where the party is unwelcome",
      "Authoritarian city under martial law",
      "Xenophobic colony suspicious of outsiders",
      "Corporate arcology with strict access controls"
    ],
    typicalFeatures: [
      "Constant threat of discovery or conflict",
      "Limited access to normal services",
      "Need for disguises or false identities",
      "Valuable information or targets within",
      "Escape routes are important"
    ]
  },
  mysteryLocation: {
    name: "Mystery Location",
    description: "A settlement shrouded in secrets, perfect for investigation adventures. Something is wrong here, and the party must discover what.",
    examples: [
      "Colony that stopped communicating",
      "Station with strange customs and hidden rituals",
      "City where people keep disappearing",
      "Outpost built on ancient ruins"
    ],
    typicalFeatures: [
      "Surface normalcy hiding dark secrets",
      "Uncooperative or fearful locals",
      "Clues scattered throughout the settlement",
      "Escalating danger as truth is uncovered",
      "A revelation that changes everything"
    ]
  }
};

// =============================================================================
// SETTLEMENT SIZES
// =============================================================================

export interface SettlementSize {
  name: string;
  population: string;
  description: string;
  typicalFeatures: string[];
  serviceLevel: string;
}

export const SETTLEMENT_SIZES: Record<string, SettlementSize> = {
  outpost: {
    name: "Outpost",
    population: "Fewer than 1,000",
    description: "A small frontier settlement, research station, or mining camp. Everyone knows everyone, and resources are limited.",
    typicalFeatures: [
      "Single general store or trading post",
      "Basic medical facilities",
      "Limited lodging options",
      "No dedicated security (militia only)",
      "One or two notable landmarks"
    ],
    serviceLevel: "Basic supplies, limited selection"
  },
  village: {
    name: "Village/Station",
    population: "1,000 - 10,000",
    description: "A small but established community. Has basic services and some specialization.",
    typicalFeatures: [
      "Multiple shops and services",
      "Dedicated security or law enforcement",
      "Several lodging options",
      "One or two districts",
      "Local government structure"
    ],
    serviceLevel: "Common items available, some specialty goods"
  },
  town: {
    name: "Town/Large Station",
    population: "10,000 - 100,000",
    description: "A significant settlement with diverse services and notable economic activity.",
    typicalFeatures: [
      "Commercial district with varied shops",
      "Professional security forces",
      "Multiple entertainment venues",
      "Several distinct districts",
      "Notable local industries"
    ],
    serviceLevel: "Most common items, specialty shops for specific needs"
  },
  city: {
    name: "City",
    population: "100,000 - 1 million",
    description: "A major population center with comprehensive services and significant political importance.",
    typicalFeatures: [
      "Multiple commercial centers",
      "Organized law enforcement",
      "Diverse entertainment options",
      "Many specialized districts",
      "Important in regional politics"
    ],
    serviceLevel: "Wide variety of goods and services"
  },
  metropolis: {
    name: "Metropolis",
    population: "1 million - 10 million",
    description: "A massive urban center dominating its region. Nearly anything can be found here.",
    typicalFeatures: [
      "Sprawling commercial infrastructure",
      "Multiple law enforcement agencies",
      "World-famous landmarks",
      "Dozens of distinct districts",
      "Major political and economic power"
    ],
    serviceLevel: "Almost anything available, including rare items"
  },
  megacity: {
    name: "Megacity",
    population: "10 million - 50 million",
    description: "A continent-spanning or station-sized city of staggering scale and complexity.",
    typicalFeatures: [
      "Multiple government layers",
      "Distinct sub-cities within the whole",
      "Incredible wealth disparity",
      "Iconic landmarks known galaxy-wide",
      "Major galactic influence"
    ],
    serviceLevel: "Everything available somewhere, if you know where to look"
  },
  megaplex: {
    name: "Megaplex",
    population: "50 million+",
    description: "Multiple megacities merged into a planet-spanning urban environment. The ultimate expression of civilization.",
    typicalFeatures: [
      "Planetary-scale infrastructure",
      "Bureaucracy beyond comprehension",
      "Vast underground and orbital extensions",
      "Lost districts and forgotten areas",
      "Center of galactic politics or commerce"
    ],
    serviceLevel: "Anything exists here, but finding it is the challenge"
  }
};

// =============================================================================
// DISTRICT TYPES
// =============================================================================

export interface DistrictType {
  name: string;
  description: string;
  typicalLocations: string[];
  atmosphere: string;
  encounterTypes: string[];
}

export const DISTRICT_TYPES: Record<string, DistrictType> = {
  oldTown: {
    name: "Old Town/Historic District",
    description: "The original heart of the settlement, possibly predating spaceflight. May be preserved as a tourist attraction or fallen into disrepair.",
    typicalLocations: [
      "Ancient temples or monuments",
      "Historic government buildings",
      "Traditional markets and craftshops",
      "Museums and cultural centers",
      "Old fortifications or walls"
    ],
    atmosphere: "Echoes of history, either preserved grandeur or faded glory",
    encounterTypes: ["Historical mysteries", "Cultural conflicts", "Preservation vs. development", "Hidden passages"]
  },
  commercial: {
    name: "Commercial/Downtown",
    description: "The economic heart of the settlement. Shopping centers, corporate offices, and financial institutions dominate.",
    typicalLocations: [
      "Shopping malls and markets",
      "Corporate headquarters",
      "Banks and financial centers",
      "Business hotels",
      "Trade exchanges"
    ],
    atmosphere: "Bustling commerce, corporate sterility, consumer excess",
    encounterTypes: ["Corporate intrigue", "Theft and heists", "Economic manipulation", "Consumer culture clashes"]
  },
  industrial: {
    name: "Industrial Zone",
    description: "Manufacturing, processing, and heavy industry. Often polluted, dangerous, and home to the working class.",
    typicalLocations: [
      "Factories and refineries",
      "Warehouses and storage facilities",
      "Worker housing blocks",
      "Waste processing plants",
      "Transport hubs and freight yards"
    ],
    atmosphere: "Gritty, dangerous, working-class solidarity or exploitation",
    encounterTypes: ["Labor disputes", "Industrial accidents", "Smuggling operations", "Underground movements"]
  },
  residential: {
    name: "Residential District",
    description: "Where people live. May range from luxury arcologies to cramped apartment blocks depending on the area.",
    typicalLocations: [
      "Apartment complexes",
      "Family homes or pods",
      "Community centers",
      "Local schools and clinics",
      "Neighborhood parks"
    ],
    atmosphere: "Varies widely from affluent comfort to desperate poverty",
    encounterTypes: ["Neighborhood mysteries", "Family dramas", "Home invasions", "Community organizing"]
  },
  entertainment: {
    name: "Entertainment District",
    description: "Nightlife, recreation, and vice. Casinos, clubs, theaters, and less reputable establishments.",
    typicalLocations: [
      "Nightclubs and bars",
      "Casinos and gambling halls",
      "Theaters and arenas",
      "Restaurants and cafes",
      "Less reputable establishments"
    ],
    atmosphere: "Hedonistic, exciting, potentially dangerous after dark",
    encounterTypes: ["Information gathering", "Criminal contacts", "Romantic encounters", "Public spectacles"]
  },
  spaceport: {
    name: "Spaceport/Docking",
    description: "Where ships arrive and depart. A constant flow of travelers, goods, and opportunities.",
    typicalLocations: [
      "Landing pads and hangars",
      "Customs and security checkpoints",
      "Traveler services and hotels",
      "Ship supply and repair shops",
      "Freight handling facilities"
    ],
    atmosphere: "Transient, cosmopolitan, gateway to the galaxy",
    encounterTypes: ["Arrival and departure scenes", "Smuggling", "Chance encounters", "Ship-related adventures"]
  },
  government: {
    name: "Government/Administrative",
    description: "Seat of local power. Courts, government offices, and official institutions.",
    typicalLocations: [
      "Government headquarters",
      "Courts and legal offices",
      "Law enforcement headquarters",
      "Bureaucratic offices",
      "Official residences"
    ],
    atmosphere: "Formal, bureaucratic, powerful",
    encounterTypes: ["Political intrigue", "Legal battles", "Corruption", "Official missions"]
  },
  scientific: {
    name: "Research/Academic",
    description: "Universities, research facilities, and centers of learning and innovation.",
    typicalLocations: [
      "Universities and academies",
      "Research laboratories",
      "Libraries and archives",
      "Museums and observatories",
      "Tech incubators"
    ],
    atmosphere: "Intellectual, curious, sometimes dangerously experimental",
    encounterTypes: ["Scientific discoveries", "Dangerous experiments", "Academic rivalries", "Knowledge theft"]
  },
  underworld: {
    name: "Underworld/Slums",
    description: "The forgotten parts of the settlement. Criminal havens, desperate poverty, and those who've fallen through the cracks.",
    typicalLocations: [
      "Black markets",
      "Gang headquarters",
      "Abandoned structures",
      "Illegal establishments",
      "Refuge camps"
    ],
    atmosphere: "Dangerous, desperate, but with its own code",
    encounterTypes: ["Criminal dealings", "Social injustice", "Underground resistance", "Survival challenges"]
  },
  alien: {
    name: "Alien Quarter",
    description: "District dominated by non-human species or specific ancestry groups. Often has unique architecture and customs.",
    typicalLocations: [
      "Species-specific businesses",
      "Cultural centers and temples",
      "Specialty food and goods",
      "Community organizations",
      "Embassy or consulate"
    ],
    atmosphere: "Foreign, exotic, potentially unwelcoming to outsiders",
    encounterTypes: ["Cultural misunderstandings", "Discrimination issues", "Unique species problems", "Cross-cultural connections"]
  }
};

// =============================================================================
// LANDMARK TEMPLATES
// =============================================================================

export interface LandmarkTemplate {
  type: string;
  namePatterns: string[];
  descriptions: string[];
  hookPotential: string[];
}

export const LANDMARK_TEMPLATES: LandmarkTemplate[] = [
  {
    type: "Observatory/Sensor Array",
    namePatterns: [
      "The [Celestial Object]'s Eye",
      "[Founder]'s Observatory",
      "The Stellar [Noun]",
      "The [Adjective] Watch"
    ],
    descriptions: [
      "A massive sensor array that monitors the surrounding space",
      "An ancient observatory predating the Gap, still operational",
      "A converted weapons platform now used for stellar research"
    ],
    hookPotential: [
      "Detected something unusual in deep space",
      "Records contain pre-Gap mysteries",
      "Someone is using it to spy on the settlement"
    ]
  },
  {
    type: "Monument/Memorial",
    namePatterns: [
      "The [Event] Memorial",
      "[Hero]'s Monument",
      "The [Adjective] Spire",
      "The Column of [Abstract Concept]"
    ],
    descriptions: [
      "A towering memorial to those lost in a great conflict",
      "A controversial monument to a historical figure",
      "An ancient structure whose original purpose is forgotten"
    ],
    hookPotential: [
      "Contains hidden chambers or secrets",
      "Vandalized or threatened by extremists",
      "Scheduled for demolition, sparking protests"
    ]
  },
  {
    type: "Religious Site",
    namePatterns: [
      "The Temple of [Deity/Concept]",
      "[Deity]'s [Building Type]",
      "The [Adjective] Shrine",
      "The Cathedral of [Domain]"
    ],
    descriptions: [
      "A grand temple to a major deity, dominating the skyline",
      "A humble shrine visited by pilgrims from across the galaxy",
      "An interfaith center representing multiple traditions"
    ],
    hookPotential: [
      "Relic stolen or discovered",
      "Schism threatening to split the congregation",
      "Dark rituals discovered in the basement"
    ]
  },
  {
    type: "Corporate Headquarters",
    namePatterns: [
      "[Corporation] Tower",
      "The [Industry] Center",
      "[Founder]'s Legacy Building",
      "The [Adjective] Spire"
    ],
    descriptions: [
      "A gleaming skyscraper dominating the commercial district",
      "A fortress-like complex with legendary security",
      "An architectural marvel that houses thousands of employees"
    ],
    hookPotential: [
      "Whistleblower needs extraction",
      "Secret project requires infiltration",
      "CEO hosting event that's actually a trap"
    ]
  },
  {
    type: "Entertainment Venue",
    namePatterns: [
      "The [Adjective] [Venue Type]",
      "[Famous Performer]'s [Venue Type]",
      "The [Color/Material] Stage",
      "[Exotic Location] Gardens"
    ],
    descriptions: [
      "A legendary performance hall known across the system",
      "An infamous gambling den where fortunes are won and lost",
      "A fighting arena where legal and illegal matches occur"
    ],
    hookPotential: [
      "Famous performer threatened or kidnapped",
      "High-stakes game with unusual wagers",
      "Underground fights lead to criminal conspiracy"
    ]
  },
  {
    type: "Historical Site",
    namePatterns: [
      "The [Adjective] Ruins",
      "[Civilization]'s Last [Building]",
      "The [Time Period] Quarter",
      "The [Event] Site"
    ],
    descriptions: [
      "Preserved ruins from before the Gap, purpose unknown",
      "The site of a famous battle or historical event",
      "An archaeological dig revealing disturbing discoveries"
    ],
    hookPotential: [
      "Artifacts being stolen by collectors",
      "Excavation awakened something",
      "Historical records don't match reality"
    ]
  },
  {
    type: "Transit Hub",
    namePatterns: [
      "[Direction/Destination] Station",
      "The [Adjective] Terminal",
      "[Founder]'s Hub",
      "The [Industry] Exchange"
    ],
    descriptions: [
      "A massive transit station connecting multiple districts",
      "A space elevator terminus reaching to orbit",
      "An ancient hyperloop station still in operation"
    ],
    hookPotential: [
      "Bomb threat or terrorist attack",
      "Missing person last seen here",
      "Smuggling operation using the transit system"
    ]
  },
  {
    type: "Natural Feature",
    namePatterns: [
      "The [Adjective] [Natural Feature]",
      "[Creature]'s [Natural Feature]",
      "The [Color] [Natural Feature]",
      "[Founder]'s [Natural Feature]"
    ],
    descriptions: [
      "A preserved natural wonder within the urban environment",
      "A terraformed park featuring imported ecosystems",
      "A dangerous natural feature the city was built around"
    ],
    hookPotential: [
      "Rare creature sighted or escaped",
      "Development threatens the preserve",
      "Hidden within the natural area: an ancient secret"
    ]
  }
];

// =============================================================================
// CULTURAL HALLMARKS
// =============================================================================

export interface CulturalHallmark {
  category: string;
  examples: string[];
  questHooks: string[];
}

export const CULTURAL_HALLMARKS: CulturalHallmark[] = [
  {
    category: "Religious Stance",
    examples: [
      "Devoutly religious, with one faith dominant",
      "Secular society that restricts religious practice",
      "Tolerant multifaith society with interfaith councils",
      "Cult-controlled settlement hiding dark practices",
      "Post-religious society that reveres technology instead"
    ],
    questHooks: [
      "Religious persecution drives refugees to the party",
      "Competing faiths threaten civil unrest",
      "Secret cult discovered within the government"
    ]
  },
  {
    category: "Species Demographics",
    examples: [
      "Human-dominated with alien minorities",
      "Species-specific enclave (shirren, vesk, etc.)",
      "True melting pot with no majority species",
      "Constructed being majority (androids, SROs)",
      "Species with unusual needs (aquatic, zero-G adapted)"
    ],
    questHooks: [
      "Species-based discrimination sparks conflict",
      "Unique species needs create unusual problems",
      "Cultural exchange event goes wrong"
    ]
  },
  {
    category: "Political Structure",
    examples: [
      "Corporate-controlled company town",
      "Democratic republic with elected officials",
      "Authoritarian regime with strict controls",
      "Anarchist collective with consensus decision-making",
      "Theocratic rule by religious leaders"
    ],
    questHooks: [
      "Election fraud needs investigation",
      "Resistance movement needs support",
      "Power vacuum creates chaos"
    ]
  },
  {
    category: "Economic Focus",
    examples: [
      "Mining and resource extraction",
      "Manufacturing and heavy industry",
      "Trade hub and commercial center",
      "Tourism and entertainment destination",
      "Research and development center"
    ],
    questHooks: [
      "Resource depletion threatens the settlement",
      "Labor disputes escalate to violence",
      "Economic downturn creates desperation"
    ]
  },
  {
    category: "Historical Legacy",
    examples: [
      "Founded by refugees fleeing disaster",
      "Built on ruins of earlier civilization",
      "Site of famous battle or treaty",
      "Survivor of the Gap with pre-Gap memories",
      "Recently established frontier settlement"
    ],
    questHooks: [
      "Ancient secrets uncovered during construction",
      "Descendants of founders claim special rights",
      "Historical trauma haunts current residents"
    ]
  },
  {
    category: "Unique Feature",
    examples: [
      "Unusual gravity or atmospheric conditions",
      "Extreme weather patterns",
      "Bioluminescent or exotic environment",
      "Built into/around massive creature or structure",
      "Temporal or dimensional anomalies"
    ],
    questHooks: [
      "Environmental systems failing",
      "Unique feature being exploited dangerously",
      "Adaptation to conditions creates social division"
    ]
  }
];

// =============================================================================
// SETTLEMENT EXISTENCE REASONS
// =============================================================================

export interface SettlementExistence {
  reason: string;
  description: string;
  implications: string[];
  vulnerabilities: string[];
}

export const SETTLEMENT_EXISTENCE_REASONS: SettlementExistence[] = [
  {
    reason: "Resource Extraction",
    description: "The settlement exists to extract valuable resources: minerals, gases, biological materials, or energy.",
    implications: [
      "Economy entirely dependent on the resource",
      "Environmental damage likely",
      "Corporate or government control of extraction",
      "Boom-and-bust economic cycles"
    ],
    vulnerabilities: [
      "Resource depletion threatens existence",
      "Price fluctuations cause instability",
      "Worker exploitation creates unrest"
    ]
  },
  {
    reason: "Strategic Location",
    description: "The settlement controls a vital location: trade route, jump point, or military chokepoint.",
    implications: [
      "Military or political importance",
      "Constant traffic and transient population",
      "Target for conquest or sabotage",
      "Diverse services for travelers"
    ],
    vulnerabilities: [
      "New routes could bypass it",
      "Conflict over control threatens stability",
      "Dependence on external powers"
    ]
  },
  {
    reason: "Historical Continuity",
    description: "The settlement has existed for so long that it persists through institutional momentum, even if its original purpose is gone.",
    implications: [
      "Deep cultural traditions",
      "Old families and power structures",
      "Resistance to change",
      "Hidden historical secrets"
    ],
    vulnerabilities: [
      "Declining relevance",
      "Inability to adapt to change",
      "Old conflicts resurfacing"
    ]
  },
  {
    reason: "Refuge/Sanctuary",
    description: "The settlement was founded by or for those fleeing something: persecution, disaster, or enemies.",
    implications: [
      "Strong community bonds",
      "Defensive architecture or location",
      "Trauma in collective memory",
      "Suspicion of outsiders"
    ],
    vulnerabilities: [
      "Original threat could find them",
      "Isolation creates stagnation",
      "Internal divisions between old and new refugees"
    ]
  },
  {
    reason: "Scientific/Research",
    description: "The settlement exists to study something: a natural phenomenon, ancient ruins, or unique conditions.",
    implications: [
      "High education levels",
      "Experimental or dangerous activities",
      "Corporate or academic funding",
      "Small permanent population, many transients"
    ],
    vulnerabilities: [
      "Funding cuts threaten existence",
      "Research could go catastrophically wrong",
      "Ethics violations attract attention"
    ]
  },
  {
    reason: "Manufacturing/Industry",
    description: "The settlement produces goods for export, taking advantage of local conditions, labor, or resources.",
    implications: [
      "Working-class majority",
      "Pollution and industrial hazards",
      "Corporate influence or control",
      "Union activity and labor politics"
    ],
    vulnerabilities: [
      "Automation replacing workers",
      "Competition from cheaper locations",
      "Environmental disasters"
    ]
  },
  {
    reason: "Tourism/Entertainment",
    description: "The settlement exists to provide experiences: natural wonders, casinos, resorts, or unique attractions.",
    implications: [
      "Service economy dominates",
      "Wealth disparity between tourists and workers",
      "Image management is critical",
      "Seasonal population fluctuations"
    ],
    vulnerabilities: [
      "Reputation damage is devastating",
      "Economic downturns reduce visitors",
      "Criminal elements exploit visitors"
    ]
  }
];

// =============================================================================
// MAPPING STEPS
// =============================================================================

export const SETTLEMENT_MAPPING_STEPS = [
  {
    step: 1,
    name: "Layout",
    description: "Determine the basic shape and organization of the settlement based on its origin and terrain.",
    considerations: [
      "Pre-spaceflight settlements often developed along rivers or trade routes",
      "Modern cities typically center on spaceports, often near water for emergency landings",
      "Space elevator anchors create natural hubs",
      "Space stations expand outward from central cores"
    ]
  },
  {
    step: 2,
    name: "Districts",
    description: "Define the major areas of the settlement and their functions.",
    considerations: [
      "Archaic settlements often have a central district once defended by walls",
      "Old town might be expensive tourist area or run-down criminal den",
      "Districts specialize over time into dominant industries",
      "Residential districts often replace agrarian plots in post-scarcity societies"
    ]
  },
  {
    step: 3,
    name: "Markets and Commerce",
    description: "Designate commercial spaces where trade occurs.",
    considerations: [
      "Marketplaces typically grow in downtown areas",
      "Ground floors of office buildings often become retail",
      "Mix traditional bazaars with corporate strip malls",
      "Provide flexibility for exotic goods alongside standard equipment"
    ]
  },
  {
    step: 4,
    name: "Lodging",
    description: "Determine where visitors and residents rest and socialize.",
    considerations: [
      "Bars, clubs, and restaurants for introductions and quest initiation",
      "Hotels near entertainment districts or spaceports",
      "Alternative lodging: sleeping pods, cyber cafes, hostels, house rentals",
      "Party might bunk in their starship to save credits"
    ]
  },
  {
    step: 5,
    name: "Landmarks",
    description: "Create iconic locations that give the settlement personality.",
    considerations: [
      "Memorable names make landmarks more interesting",
      "Evocative names hint toward themes and story beats",
      "Landmarks can serve as adventure hooks",
      "Each landmark should feel unique to this settlement"
    ]
  }
];

// =============================================================================
// ECONOMY AND POLITICS
// =============================================================================

export interface EconomicFactor {
  factor: string;
  questions: string[];
  implications: string[];
}

export const ECONOMIC_FACTORS: EconomicFactor[] = [
  {
    factor: "Key Resources",
    questions: [
      "What natural resources are available?",
      "What does the settlement export?",
      "What must be imported?",
      "Who controls resource access?"
    ],
    implications: [
      "Resource scarcity creates conflict",
      "Resource abundance attracts attention",
      "Control of resources equals political power",
      "Trade relationships define foreign policy"
    ]
  },
  {
    factor: "Labor and Skills",
    questions: [
      "What skills are common among residents?",
      "Is labor plentiful or scarce?",
      "Are there labor organizations?",
      "What is the employment situation?"
    ],
    implications: [
      "Skill shortages create opportunities",
      "Labor disputes can paralyze the settlement",
      "Automation displaces traditional jobs",
      "Education determines economic mobility"
    ]
  },
  {
    factor: "Trade Relationships",
    questions: [
      "Who are the settlement's trading partners?",
      "What trade routes pass through?",
      "Are there trade disputes or embargoes?",
      "What is the balance of trade?"
    ],
    implications: [
      "Trade creates interdependence",
      "Disrupted trade routes cause crises",
      "Trade agreements involve political compromise",
      "Smuggling thrives where legal trade is restricted"
    ]
  },
  {
    factor: "Wealth Distribution",
    questions: [
      "How unequal is the wealth distribution?",
      "Is there a middle class?",
      "How do the poor survive?",
      "What do the wealthy control?"
    ],
    implications: [
      "Inequality breeds resentment",
      "Wealthy neighborhoods require security",
      "Poverty creates crime and desperation",
      "Economic mobility affects social stability"
    ]
  }
];

// =============================================================================
// CONSCIENTIOUS DESIGN REMINDERS
// =============================================================================

export const CULTURE_DESIGN_GUIDANCE = [
  "Avoid creating species or cultures based on harmful stereotypes",
  "Don't reduce real-world cultures to simplistic caricatures",
  "Avoid tropes like 'primitive nomad' or 'noble samurai' as entire cultural identities",
  "Take inspiration from real cultures with care and respect",
  "Create multifaceted cultures with internal diversity",
  "Consider how different groups within a culture might disagree",
  "Avoid making entire species act as a monolith",
  "Include positive and negative aspects to avoid idealization or demonization"
];
