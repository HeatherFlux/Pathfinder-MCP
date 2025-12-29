/**
 * Configuration for the Archives of Nethys (AON) API client.
 * Contains the Elasticsearch endpoint and available data categories for both PF2e and SF2e.
 */

/**
 * Pathfinder 2e configuration
 */
export const config = {
  /**
   * The root URL for the AON Elasticsearch instance
   */
  root: "https://elasticsearch.aonprd.com/",

  /**
   * The Elasticsearch index name for PF2e data
   */
  index: "aon",

  /**
   * Base URL for PF2e Archives of Nethys
   */
  baseUrl: "https://2e.aonprd.com",

  /**
   * Available data categories from AON that can be queried for PF2e
   */
  targets: [
    "action",
    "ancestry",
    "archetype",
    "armor",
    "article",
    "background",
    "class",
    "creature",
    "creature-family",
    "deity",
    "equipment",
    "feat",
    "hazard",
    "rules",
    "skill",
    "shield",
    "spell",
    "source",
    "trait",
    "weapon",
    "weapon-group",
  ],
} as const;

/**
 * Starfinder 2e configuration
 */
export const sf2eConfig = {
  /**
   * The root URL for the AON Elasticsearch instance (same as PF2e)
   */
  root: "https://elasticsearch.aonprd.com/",

  /**
   * The Elasticsearch index name for SF2e data
   */
  index: "aonsf",

  /**
   * Base URL for SF2e Archives of Nethys
   */
  baseUrl: "https://2e.aonsrd.com",

  /**
   * Available data categories from AON that can be queried for SF2e
   */
  targets: [
    "action",
    "ammunition",
    "anchor",
    "ancestry",
    "archetype",
    "armor",
    "armor-group",
    "background",
    "category-page",
    "class",
    "class-feature",
    "computer",
    "condition",
    "connection",
    "creature",
    "creature-family",
    "curse",
    "deity",
    "deity-category",
    "disease",
    "domain",
    "equipment",
    "faction",
    "feat",
    "fighting-style",
    "hazard",
    "heritage",
    "item-bonus",
    "language",
    "leadership-style",
    "paradox",
    "planet",
    "plane",
    "ritual",
    "rules",
    "shield",
    "sidebar",
    "skill",
    "skill-general-action",
    "solar-manifestation",
    "source",
    "specialization",
    "spell",
    "starship-scene",
    "tradition",
    "trait",
    "vehicle",
    "weapon",
    "weapon-group",
  ],
} as const;

/**
 * Type representing a valid PF2e AON category
 */
export type AonCategory = typeof config.targets[number];

/**
 * Type representing a valid SF2e AON category
 */
export type Sf2eCategory = typeof sf2eConfig.targets[number];

/**
 * Game system type
 */
export type GameSystem = "pf2e" | "sf2e";

/**
 * Get config for a specific game system
 */
export function getSystemConfig(system: GameSystem) {
  return system === "sf2e" ? sf2eConfig : config;
}
