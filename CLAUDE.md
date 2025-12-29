# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathfinder-MCP is a Model Context Protocol (MCP) server that provides **Pathfinder 2e** and **Starfinder 2e** game data and DM tools by connecting to the Archives of Nethys (AON) Elasticsearch API. It enables AI assistants to search, retrieve, and work with PF2e/SF2e rules content.

## Common Commands

```bash
# Build (clean rebuild)
pnpm run build

# Development with watch mode
pnpm run dev

# Run tests
pnpm test

# Lint
pnpm run lint
pnpm run lint:fix

# Format code
pnpm run format

# Test with MCP Inspector
pnpm run inspect
pnpm run inspect:dev   # Development mode with ts-node
```

## Architecture

### Layer Structure

```
src/
├── index.ts              # MCP server entry point - registers all tools
├── clients/
│   ├── aon-client.ts     # PF2e Elasticsearch client
│   └── sf2e-client.ts    # SF2e Elasticsearch client
├── mcp/                  # MCP tool implementations
│   ├── search/           # Search and item retrieval tools
│   ├── treasure/         # Treasure generation tools
│   ├── crafting/         # Crafting calculator tools
│   ├── encounter/        # Encounter building tools
│   ├── creatures/        # Creature search tools
│   ├── hazards/          # Hazard search tools
│   ├── lore/             # Deity and lore tools
│   └── story/            # Story generation (secrets, scenes)
├── services/             # Business logic
│   ├── crafting-calculator.ts
│   ├── treasure-generator.ts
│   └── treasure-by-level.ts
└── types/
    ├── config.ts               # API config for both PF2e and SF2e
    ├── types.ts                # Core interfaces (AonItem, etc.)
    ├── crafting-data.ts        # PF2e crafting rule constants
    ├── sf2e-adventure-data.ts  # SF2e GM Core campaign/adventure reference data
    ├── sf2e-settlement-data.ts # SF2e GM Core settlement building reference data
    └── sf2e-hacking-data.ts    # SF2e GM Core hacking subsystem reference data
```

### Key Patterns

**MCP Tool Registration**: All tools are registered in `src/index.ts` using the `@modelcontextprotocol/sdk` pattern:
```typescript
server.tool(
  'toolName',
  'Tool description',
  { /* Zod schema */ },
  async (args) => { /* implementation */ }
);
```

**Dual-System Architecture**: Both PF2e and SF2e use the **same Elasticsearch server** with different indices:
- PF2e: `AonClient` → index `aon`
- SF2e: `Sf2eClient` → index `aonsf`

## Archives of Nethys API Configuration

### Pathfinder 2e
```typescript
const pf2eConfig = {
  root: "https://elasticsearch.aonprd.com/",
  index: "aon",
  baseUrl: "https://2e.aonprd.com"
};
```

**PF2e Categories** (21): action, ancestry, archetype, armor, article, background, class, creature, creature-family, deity, equipment, feat, hazard, rules, skill, shield, spell, source, trait, weapon, weapon-group

### Starfinder 2e
```typescript
const sf2eConfig = {
  root: "https://elasticsearch.aonprd.com/",  // Same server!
  index: "aonsf",                              // Different index
  baseUrl: "https://2e.aonsrd.com"
};
```

**SF2e Categories** (49): action, ammunition, anchor, ancestry, archetype, armor, armor-group, background, category-page, class, class-feature, computer, condition, connection, creature, creature-family, curse, deity, deity-category, disease, domain, equipment, faction, feat, fighting-style, hazard, heritage, item-bonus, language, leadership-style, paradox, planet, plane, ritual, rules, shield, sidebar, skill, skill-general-action, solar-manifestation, source, specialization, spell, starship-scene, tradition, trait, vehicle, weapon, weapon-group

## Available MCP Tools

### Pathfinder 2e Tools
**Search**: searchPathfinder, getPathfinderItem, getAllPathfinderItems, getItemsByLevel
**DM Tools**: buildEncounter, calculateEncounterXP, generateTreasure
**Creatures**: searchCreaturesByLevel, searchCreaturesByTrait, getCreatureFamily
**Hazards**: searchHazards, getHazardsByLevel
**Lore**: getDeityInfo
**Story**: generateSecrets, generateSceneIdeas
**Crafting**: getPathfinderCraftingRequirements

### Starfinder 2e Tools
**Search**: searchStarfinder, getStarfinderItem, getAllStarfinderItems, getSF2eItemsByLevel
**DM Tools**: buildSF2eEncounter, calculateSF2eEncounterXP, generateSF2eTreasure
**Creatures**: searchSF2eCreaturesByLevel, searchSF2eCreaturesByTrait
**Hazards**: searchSF2eHazards, getSF2eHazardsByLevel
**Lore**: getSF2eDeityInfo
**Story**: generateSF2eSceneIdeas, generateSF2eSecrets
**Campaign Planning**: planSF2eCampaign, planSF2eAdventure, generateSF2eStoryArc, suggestSF2eNPCs
**Settlement Building**: planSF2eSettlement, generateSF2eDistricts, generateSF2eLandmarks, generateSF2eSettlementHooks
**Hacking Subsystem**: buildSF2eComputer, generateSF2eVulnerabilities, generateSF2eCountermeasures, planSF2eHackingEncounter
**SF2e Unique**: getSF2eStarshipScenes, getSF2eComputers, getSF2ePlanets, getSF2eFactions

## Game System Rules

### Encounter XP Budgets (Both Systems)
- Trivial: 40 XP, Low: 60 XP, Moderate: 80 XP, Severe: 120 XP, Extreme: 160 XP
- Adjust by +20 XP per player beyond 4

### Creature XP by Level Difference
Party level ±: -4=10, -3=15, -2=20, -1=30, 0=40, +1=60, +2=80, +3=120, +4=160

### PF2e Treasure Rules
- See `src/services/treasure-notes.md` for complete PF2e treasure tables
- Permanent items: level+1 and level+2 relative to party
- Consumables: across 3 level tiers
- Base assumes 4 players; adjust currency per additional/fewer PC
- Currency: Gold pieces (gp)

### SF2e Treasure Rules
- Similar structure to PF2e
- Currency: Credits (≈1:1 with gp)
- Item types: Weapons, armor, augmentations, hybrid items, tech items
- Consumables: Serums, spell gems, grenades, ammunition

### SF2e Unique Mechanics
- **Starship Scenes**: Structured encounters with crew roles (pilot, gunner, engineer, science officer, captain)
- **Computers**: Tier-based hacking systems
- **Planets**: Setting locations for worldbuilding
- **Factions**: Organizations for political intrigue (Stewards, Xenowardens, Corpse Fleet, etc.)

### SF2e Campaign Planning (GM Core)

**Campaign Structures** (planSF2eCampaign):
- One-Shot: 1 adventure, 1 session
- Brief: 2 adventures, levels 1→4-5, ~3 months weekly
- Extended: 5 adventures, levels 1→11-13, ~1 year weekly
- Epic: 6 adventures, levels 1→20, ~1.5 years weekly

**Adventure Styles** (planSF2eAdventure):
- Exploration, Dystopian, Horror, Infiltration, Intrigue
- Military, Mystery, Planar, Romantic, Space Opera
- Each style has session count, encounter distribution, roleplay encounters, and tropes

**Threat Types** (for secrets, NPCs, and story arcs):
- Corruption: Weaken or change a place/person/institution
- Devastation: Destroy or lay waste
- Extremism: Violent means for believed good cause
- Mayhem: Chaos without greater plan
- Subjugation: Control and rule over others

**NPC Archetypes** (suggestSF2eNPCs):
- Ally, Questgiver, Rival, Wild Card, Innocent
- Each has variations and threat-specific connections

### SF2e Settlement Building (GM Core)

**Settlement Roles** (planSF2eSettlement):
- Home Base, Quest Hub, Adventure Origin, Distant Capital
- Waystation, Hostile Territory, Mystery Location

**Settlement Sizes**:
- Outpost (<1,000), Village (1k-10k), Town (10k-100k)
- City (100k-1M), Metropolis (1M-10M), Megacity (10M-50M), Megaplex (50M+)

**Existence Reasons**:
- Resource Extraction, Strategic Location, Historical Continuity
- Refuge/Sanctuary, Scientific/Research, Manufacturing, Tourism

**District Types** (generateSF2eDistricts):
- Old Town, Commercial, Industrial, Residential, Entertainment
- Spaceport, Government, Scientific, Underworld, Alien Quarter

**Landmark Templates** (generateSF2eLandmarks):
- Generates evocative names like "The Tapestry's Eye" or "Korrin's Observatory"
- Types: Observatory, Monument, Religious Site, Corporate HQ, Entertainment, Historical, Transit Hub, Natural Feature

### SF2e Hacking Subsystem (GM Core)

**Computer Types**:
- Tech: Hacked with Computers, Crafting, Thievery
- Magic: Hacked with Arcana, Nature, Occultism, Religion
- Hybrid: Multiple access points for tech and magic components

**Complexity Levels**:
- Simple: Quick 2-action activity, 1 access point, no vulnerabilities
- Complex: Multi-round encounter, multiple access points, vulnerabilities lower DCs

**DCs by Level** (based on hazard tables):
- Low DC: Notice countermeasures, easy vulnerabilities (–1 reduction)
- High DC: Standard Hack DC, disable countermeasures (–2 reduction)
- Elite DC: Hard access points, severe countermeasures (–3 reduction)

**Vulnerability Categories**:
- Social: Deception, Diplomacy, social engineering
- Technical: Computers, Crafting, phishing, exploits
- Physical: Athletics, Stealth, Thievery, physical access
- Magical: Arcana, Occultism, divination, rituals

**Countermeasure Severities**:
- Minor: Admin alerts, account warnings
- Moderate: Account lockouts, misleading data, security response
- Severe: Data deletion, EMP wipe, pursuit by authorities
- Persistent: Trigger each round until disabled

## Query Examples

```bash
# Search SF2e spells
curl -X POST "https://elasticsearch.aonprd.com/aonsf/_search" \
  -H "Content-Type: application/json" \
  -d '{"query": {"bool": {"must": [{"term": {"category": "spell"}}, {"match": {"name": "laser"}}]}}}'

# Get all SF2e classes
curl -X POST "https://elasticsearch.aonprd.com/aonsf/_search" \
  -H "Content-Type: application/json" \
  -d '{"query": {"term": {"category": "class"}}}'

# List all categories with counts
curl -X POST "https://elasticsearch.aonprd.com/aonsf/_search" \
  -H "Content-Type: application/json" \
  -d '{"size": 0, "aggs": {"categories": {"terms": {"field": "category", "size": 100}}}}'
```

## External Resources

- [Archives of Nethys - PF2e](https://2e.aonprd.com/)
- [Archives of Nethys - SF2e](https://2e.aonsrd.com/)
- [Scraping AON Guide](https://dev.to/lukehagar/scraping-archives-of-nethys-for-fun-and-profit-3ll3) - Elasticsearch query patterns
