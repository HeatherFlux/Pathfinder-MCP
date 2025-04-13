/**
 * Configuration for the Archives of Nethys (AON) API client.
 * Contains the Elasticsearch endpoint and available data categories.
 */
export const config = {
  /**
   * The root URL for the AON Elasticsearch instance
   */
  root: "https://elasticsearch.aonprd.com/",

  /**
   * The Elasticsearch index name for AON data
   */
  index: "aon",

  /**
   * Available data categories from AON that can be queried
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
 * Type representing a valid AON category
 */
export type AonCategory = typeof config.targets[number]; 