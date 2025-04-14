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
        min_score: 5, // Filter out poor quality matches
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits"]
      });

      if (!search.hits?.hits) {
        throw new Error('Invalid response from Elasticsearch');
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        
        // Add URL to the item
        if (!item.url) {
          item.url = this.constructAonUrl(item);
        }
        
        // Add formatted URL with Markdown link
        if (item.url && !item.formatted_url) {
          item.formatted_url = `[${item.name}](${item.url})`;
        }
        
        // Ensure price is present and formatted consistently
        if (item.price === undefined) {
          item.price = "—";
        } else if (typeof item.price === 'number') {
          item.price = `${item.price} gp`;
        }
        
        return item;
      });
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
        size: 1,
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits"]
      });

      let result: AonItem | null = null;

      if (exactSearch.hits?.hits && exactSearch.hits.hits.length > 0) {
        result = exactSearch.hits.hits[0]._source as AonItem;
        
        // Add URL if not present
        if (!result.url) {
          result.url = this.constructAonUrl(result);
        }
        
        // Add formatted URL with Markdown link
        if (result.url && !result.formatted_url) {
          result.formatted_url = `[${result.name}](${result.url})`;
        }
      } else {
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
          size: 1,
          _source: ["name", "category", "description", "text", "level", "price", "id", "traits"]
        });

        if (!fuzzySearch.hits?.hits || fuzzySearch.hits.hits.length === 0) {
          return null;
        }

        result = fuzzySearch.hits.hits[0]._source as AonItem;
      }

      // Add URL and format price
      if (result) {
        if (!result.url) {
          result.url = this.constructAonUrl(result);
        }
        
        if (result.price === undefined) {
          result.price = "—";
        } else if (typeof result.price === 'number') {
          result.price = `${result.price} gp`;
        }
      }

      return result;
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
        sort: [{ "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits"]
      });

      if (!search.hits?.hits) {
        throw new Error('Invalid response from Elasticsearch');
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        
        // Add URL to the item
        if (!item.url) {
          item.url = this.constructAonUrl(item);
        }
        
        // Add formatted URL with Markdown link
        if (item.url && !item.formatted_url) {
          item.formatted_url = `[${item.name}](${item.url})`;
        }
        
        // Ensure price is present and formatted consistently
        if (item.price === undefined) {
          item.price = "—";
        } else if (typeof item.price === 'number') {
          item.price = `${item.price} gp`;
        }
        
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving all ${category} items:`, errorMessage);
      throw new Error(`Failed to retrieve ${category} items: ${errorMessage}`);
    }
  }

  /**
   * Constructs a URL to the Archives of Nethys page for an item
   * @param {AonItem} item - The item to generate a URL for
   * @returns {string} The URL to the item on Archives of Nethys
   * @private
   */
  private constructAonUrl(item: AonItem): string {
    // If the item already has a URL in the data, use it (but ensure it's absolute)
    if (typeof item.url === 'string' && item.url.startsWith('/')) {
      return `https://2e.aonprd.com${item.url}`;
    }
    
    // Map category to AoN URL paths
    const categoryMap: Record<string, string> = {
      'spell': 'spells',
      'feat': 'feats',
      'equipment': 'equipment',
      'weapon': 'equipment',
      'armor': 'equipment',
      'shield': 'equipment',
      'vehicle': 'equipment',
      'siege-weapon': 'equipment',
      'class': 'classes',
      'ancestry': 'ancestries',
      'background': 'backgrounds',
      'archetype': 'archetypes',
      'creature': 'monsters'
    };
    
    // Extract item ID from the data if available
    let itemId = '';
    if (typeof item.id === 'string' && item.id.includes('-')) {
      const idParts = item.id.split('-');
      if (idParts.length >= 2) {
        itemId = idParts[idParts.length - 1];
      }
    }
    
    // Get URL path from map or use generic 'rules' for unknown categories
    const urlPath = categoryMap[item.category] || 'rules';
    
    // Format the name for URL (lowercase, spaces to hyphens)
    const formattedName = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    return `https://2e.aonprd.com/${urlPath}.aspx?ID=${itemId}&Name=${formattedName}`;
  }

  /**
   * Retrieves all items of a specific level for treasure generation
   * 
   * @param {number} level - The item level to search for
   * @param {AonCategory[]} [itemCategories] - Optional categories to restrict the search to.
   *                                          If not provided, returns items of all categories.
   *                                          Common equipment categories include: "armor", "equipment", 
   *                                          "shield", "weapon", "siege-weapon", and "vehicle".
   * @returns {Promise<AonItem[]>} Promise resolving to an array of all items at the specified level
   * @throws {Error} if the retrieval operation fails
   * 
   * @example
   * ```typescript
   * // Get all level 5 items (including creatures, spells, etc.)
   * const level5Items = await client.getItemsByLevel(5);
   * 
   * // Get only level 3 weapons and armor
   * const combatItems = await client.getItemsByLevel(3, ['weapon', 'armor']);
   * 
   * // Get only equipment-related items
   * const equipmentItems = await client.getItemsByLevel(4, ['armor', 'equipment', 'shield', 'weapon']);
   * ```
   */
  async getItemsByLevel(
    level: number, 
    itemCategories?: AonCategory[]
  ): Promise<AonItem[]> {
    if (level < 0 || level > 25) {
      throw new Error('Item level must be between 0 and 25');
    }

    const allItems: AonItem[] = [];
    const pageSize = 250; // Fetch more items per request to minimize API calls
    
    try {
      // Build the query with proper typing
      interface ElasticsearchQuery {
        bool: {
          must: Array<Record<string, unknown>>;
          must_not?: Array<Record<string, unknown>>;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      }

      const query: ElasticsearchQuery = {
        bool: {
          must: [
            { term: { level } }
          ],
          must_not: [
            // Exclude non-equipment categories by default unless explicitly requested
            ...(!itemCategories ? [
              { term: { category: 'creature' } },
              { term: { category: 'spell' } },
              { term: { category: 'feat' } },
              { term: { category: 'hazard' } },
              { term: { category: 'ritual' } },
              { term: { category: 'class-feature' } },
              { term: { category: 'ancestry' } },
              { term: { category: 'class' } },
              { term: { category: 'archetype' } },
              { term: { category: 'background' } },
              { term: { category: 'curse' } },
              { term: { category: 'disease' } },
              { term: { category: 'kingdom-structure' } },
              { term: { category: 'kingdom-event' } },
              { term: { category: 'weather-hazard' } }
            ] : [
              // If categories are specified, only exclude creatures unless explicitly included
              ...(!itemCategories.includes('creature') ? [{ term: { category: 'creature' } }] : [])
            ])
          ]
        }
      };

      // If categories are provided, add them to the query
      if (itemCategories && itemCategories.length > 0) {
        // Validate all categories first
        itemCategories.forEach(category => this.validateCategory(category));
        
        // If only one category, use a simple term query
        if (itemCategories.length === 1) {
          query.bool.must.push({ term: { category: itemCategories[0] } });
        } else {
          // If multiple categories, use a terms query (OR condition)
          query.bool.must.push({ 
            terms: { 
              category: itemCategories 
            } 
          });
        }
      } else {
        // If no categories provided, default to equipment-related categories
        query.bool.must.push({
          terms: {
            category: ['armor', 'equipment', 'shield', 'weapon', 'siege-weapon', 'vehicle']
          }
        });
      }

      // Handle pagination
      let from = 0;
      let hasMoreItems = true;
      
      while (hasMoreItems) {
        const search = await this.client.search({
          index: config.index,
          query,
          from,
          size: pageSize,
          sort: [{ "name.keyword": { order: "asc" } }],
          // Request specific fields including price and id
          _source: ["name", "category", "description", "text", "level", "price", "id", "traits"]
        });
        
        if (!search.hits?.hits || search.hits.hits.length === 0) {
          hasMoreItems = false;
          continue;
        }
        
        const items = search.hits.hits.map((hit) => {
          const item = hit._source as AonItem;
          
          // Add URL to the item if it's not already present
          if (!item.url) {
            item.url = this.constructAonUrl(item);
          }
          
          // Add formatted URL with Markdown link
          if (item.url && !item.formatted_url) {
            item.formatted_url = `[${item.name}](${item.url})`;
          }
          
          // Ensure price is present and formatted consistently
          if (item.price === undefined) {
            // Default price format if not available in the data
            item.price = "—";
          } else if (typeof item.price === 'number') {
            // Format price as "X gp" if it's a number
            item.price = `${item.price} gp`;
          }
          
          return item;
        });
        
        allItems.push(...items);
        
        // Check if we got fewer items than requested, meaning we've reached the end
        if (items.length < pageSize) {
          hasMoreItems = false;
        } else {
          from += pageSize;
        }
      }
      
      return allItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving items of level ${level}:`, errorMessage);
      throw new Error(`Failed to retrieve items of level ${level}: ${errorMessage}`);
    }
  }

  /**
   * Additional information about the search functionality
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