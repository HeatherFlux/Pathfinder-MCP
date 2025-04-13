import { Client } from "@elastic/elasticsearch";
import { config, AonCategory } from "../config/config.js";
import { AonItem } from "../config/types.js";

/**
 * Error class for invalid category errors
 * @class InvalidCategoryError
 * @augments Error
 */
export class InvalidCategoryError extends Error {
  /**
   * Creates a new InvalidCategoryError
   * @param {string} category - The invalid category that was provided
   */
  constructor(category: string) {
    super(`Invalid category: ${category}`);
    this.name = "InvalidCategoryError";
  }
}

/**
 * Client for interacting with the Archives of Nethys (AON) Elasticsearch instance.
 * Provides methods to search and retrieve Pathfinder 2e game data.
 * 
 * @example
 * ```typescript
 * const client = new AonClient();
 * 
 * // Search for spells
 * const spells = await client.searchCategory('spell', 'fireball');
 * 
 * // Get a specific item
 * const item = await client.getItem('feat', 'Power Attack');
 * ```
 */
export class AonClient {
  /** The Elasticsearch client instance */
  private client: Client;

  /**
   * Creates a new AonClient instance
   * @param {Client} [mockClient] - Optional mock client for testing
   * @throws {Error} if unable to connect to Elasticsearch with details about the connection failure
   */
  constructor(mockClient?: Client) {
    try {
      this.client = mockClient || new Client({
        node: config.root,
        maxRetries: 3,
        requestTimeout: 10000
      });
    } catch (error) {
      throw new Error(`Failed to initialize Elasticsearch client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates if a category is valid
   * @param {string} category - The category to validate
   * @throws {InvalidCategoryError} if the category is not one of the valid AON categories
   */
  private validateCategory(category: string): void {
    if (!config.targets.includes(category as AonCategory)) {
      throw new InvalidCategoryError(`Category '${category}' is not valid. Valid categories are: ${config.targets.join(', ')}`);
    }
  }

  /**
   * Search for items in a specific category
   * @param {AonCategory} category - The category to search in (e.g., spell, feat, class)
   * @param {string} query - The search query from the user
   * @returns {Promise<AonItem[]>} Promise resolving to an array of matching items
   * @throws {InvalidCategoryError} if the category is not valid
   * @throws {Error} if the search operation fails or returns invalid results
   * 
   * @example
   * ```typescript
   * // Search for spells containing "fire"
   * const fireSpells = await client.searchCategory('spell', 'fire');
   * 
   * // Search for feats related to "strike"
   * const strikeFeats = await client.searchCategory('feat', 'strike');
   * ```
   */
  async searchCategory(category: AonCategory, query: string): Promise<AonItem[]> {
    this.validateCategory(category);

    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    try {
      // Clean up the query by removing common prefixes and suffixes
      const cleanQuery = query.replace(/^What is the |^Tell me about the |^Tell me about |spell\??|feat\??$/gi, '').trim();

      // Construct the search query based on category
      const searchQuery = this.buildSearchQuery(category, cleanQuery);

      const search = await this.client.search({
        index: config.index,
        from: 0,
        size: 100,
        query: searchQuery,
        min_score: 5 // Filter out poor quality matches
      });

      if (!search.hits?.hits) {
        throw new Error('Invalid response from Elasticsearch');
      }

      return search.hits.hits.map((hit) => hit._source as AonItem);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error searching ${category} for "${query}":`, errorMessage);
      throw new Error(`Failed to search ${category}: ${errorMessage}`);
    }
  }

  /**
   * Builds an optimized search query based on category and user input
   * @param {AonCategory} category - The category to search in
   * @param {string} query - The cleaned search query
   * @returns {Record<string, unknown>} Elasticsearch query object
   * 
   * For spells and feats, we use a more complex query structure that:
   * 1. Heavily boosts exact name matches (boost: 100)
   * 2. Includes fuzzy matching on name, description, and text fields
   * 3. Requires at least 60% of terms to match
   * 
   * This is a private method used internally by the class.
   */
  private buildSearchQuery(category: AonCategory, query: string): Record<string, unknown> {
    // Special handling for spells and feats
    if (category === "spell" || category === "feat") {
      return {
        bool: {
          should: [
            {
              match_phrase: {
                name: {
                  query,
                  boost: 100 // Very high boost for exact name matches
                }
              }
            },
            {
              multi_match: {
                query,
                fields: ["name^3", "description", "text"],
                fuzziness: "AUTO",
                minimum_should_match: "60%",
                tie_breaker: 0.3
              }
            }
          ],
          filter: [{ term: { category } }],
          minimum_should_match: 1
        }
      };
    }

    // For other categories, use a simpler but still effective query
    return {
      bool: {
        must: [
          { term: { category } },
          {
            multi_match: {
              query,
              fields: ["name^3", "description", "text"],
              fuzziness: "AUTO",
              minimum_should_match: "60%",
              tie_breaker: 0.3
            }
          }
        ]
      }
    };
  }

  /**
   * Retrieves a specific item by name from a category
   * @param {AonCategory} category - The category to search in (e.g., spell, feat)
   * @param {string} name - The exact name of the item to retrieve
   * @returns {Promise<AonItem | null>} Promise resolving to the item if found, null otherwise
   * @throws {InvalidCategoryError} if the category is not valid
   * @throws {Error} if the retrieval operation fails
   * 
   * @example
   * ```typescript
   * // Get a specific spell
   * const spell = await client.getItem('spell', 'Fireball');
   * if (spell) {
   *   console.log(spell.name, spell.description);
   * }
   * ```
   */
  async getItem(category: AonCategory, name: string): Promise<AonItem | null> {
    this.validateCategory(category);

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Item name cannot be empty');
    }

    try {
      // First try an exact match
      const exactSearch = await this.client.search({
        index: config.index,
        query: {
          bool: {
            must: [
              { term: { category } },
              { match_phrase: { name: trimmedName } }
            ]
          }
        },
        size: 1
      });

      if (exactSearch.hits?.hits && exactSearch.hits.hits.length > 0) {
        return exactSearch.hits.hits[0]._source as AonItem;
      }

      // If no exact match, try a more lenient search
      const fuzzySearch = await this.client.search({
        index: config.index,
        query: {
          bool: {
            must: [
              { term: { category } },
              {
                match: {
                  name: {
                    query: trimmedName,
                    fuzziness: "AUTO",
                    operator: "and"
                  }
                }
              }
            ]
          }
        },
        size: 1
      });

      if (!fuzzySearch.hits?.hits || fuzzySearch.hits.hits.length === 0) {
        return null;
      }

      return fuzzySearch.hits.hits[0]._source as AonItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving ${category} item "${name}":`, errorMessage);
      throw new Error(`Failed to retrieve ${category} item: ${errorMessage}`);
    }
  }

  /**
   * Retrieves all items in a specific category
   * @param {AonCategory} category - The category to retrieve (e.g., spell, feat)
   * @param {object} options - Optional parameters for pagination and filtering
   * @param {number} [options.from=0] - Starting index for pagination
   * @param {number} [options.size=100] - Number of items to return per page
   * @returns {Promise<AonItem[]>} Promise resolving to an array of items
   * @throws {InvalidCategoryError} if the category is not valid
   * @throws {Error} if the retrieval operation fails or returns invalid results
   * 
   * @example
   * ```typescript
   * // Get first 50 spells
   * const spells = await client.getAllInCategory('spell', { size: 50 });
   * 
   * // Get next 50 spells
   * const moreSpells = await client.getAllInCategory('spell', { from: 50, size: 50 });
   * ```
   */
  async getAllInCategory(
    category: AonCategory,
    options: { from?: number; size?: number } = {}
  ): Promise<AonItem[]> {
    this.validateCategory(category);

    const { from = 0, size = 100 } = options;

    if (from < 0) {
      throw new Error('Starting index cannot be negative');
    }

    if (size <= 0 || size > 1000) {
      throw new Error('Size must be between 1 and 1000');
    }

    try {
      const search = await this.client.search({
        index: config.index,
        query: {
          term: { category }
        },
        from,
        size,
        sort: [{ "name.keyword": { order: "asc" } }]
      });

      if (!search.hits?.hits) {
        throw new Error('Invalid response from Elasticsearch');
      }

      return search.hits.hits.map((hit) => hit._source as AonItem);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving all ${category} items:`, errorMessage);
      throw new Error(`Failed to retrieve ${category} items: ${errorMessage}`);
    }
  }

  /**
   * Additional information about the search functionality
   * @description This method performs an exact match search first, then falls back to fuzzy search
   */
  /**
   * Search for items in a category
   * @param {object} options - The search options
   * @param {string} options.category - The category to search in
   * @param {string} options.query - The search query
   * @param {number} [options.size=10] - The number of results to return
   * @param {number} [options.from=0] - The starting index for pagination
   * @returns {Promise<SearchResult[]>} The search results
   */
} 