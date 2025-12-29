import { Client } from "@elastic/elasticsearch";
import { sf2eConfig, Sf2eCategory } from "../types/config.js";
import { AonItem } from "../types/types.js";

/**
 * Error class for invalid category errors
 */
export class InvalidSf2eCategoryError extends Error {
  constructor(category: string) {
    super(`Invalid SF2e category: ${category}`);
    this.name = "InvalidSf2eCategoryError";
  }
}

/**
 * Client for interacting with the Archives of Nethys Starfinder 2e Elasticsearch instance.
 * Provides methods to search and retrieve SF2e game data.
 *
 * @example
 * ```typescript
 * const client = new Sf2eClient();
 *
 * // Search for spells
 * const spells = await client.searchCategory('spell', 'laser');
 *
 * // Get a specific item
 * const item = await client.getItem('class', 'Operative');
 * ```
 */
export class Sf2eClient {
  private client: Client;

  constructor(mockClient?: Client) {
    try {
      this.client = mockClient || new Client({
        node: sf2eConfig.root,
        maxRetries: 3,
        requestTimeout: 10000
      });
    } catch (error) {
      throw new Error(`Failed to initialize SF2e Elasticsearch client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateCategory(category: string): void {
    if (!sf2eConfig.targets.includes(category as Sf2eCategory)) {
      throw new InvalidSf2eCategoryError(`Category '${category}' is not valid. Valid SF2e categories are: ${sf2eConfig.targets.join(', ')}`);
    }
  }

  /**
   * Search for items in a specific category
   */
  async searchCategory(category: Sf2eCategory, query: string): Promise<AonItem[]> {
    this.validateCategory(category);

    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    try {
      const cleanQuery = query.replace(/^What is the |^Tell me about the |^Tell me about |spell\??|feat\??$/gi, '').trim();
      const searchQuery = this.buildSearchQuery(category, cleanQuery);

      const search = await this.client.search({
        index: sf2eConfig.index,
        from: 0,
        size: 100,
        query: searchQuery,
        min_score: 5,
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits", "url"]
      });

      if (!search.hits?.hits) {
        throw new Error('Invalid response from Elasticsearch');
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;

        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }

        if (item.url && !item.formatted_url) {
          item.formatted_url = `[${item.name}](${item.url})`;
        }

        if (item.price === undefined) {
          item.price = "—";
        } else if (typeof item.price === 'number') {
          item.price = `${item.price} credits`;
        }

        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error searching SF2e ${category} for "${query}":`, errorMessage);
      throw new Error(`Failed to search SF2e ${category}: ${errorMessage}`);
    }
  }

  private buildSearchQuery(category: Sf2eCategory, query: string): Record<string, unknown> {
    if (category === "spell" || category === "feat") {
      return {
        bool: {
          should: [
            {
              match_phrase: {
                name: {
                  query,
                  boost: 100
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
   */
  async getItem(category: Sf2eCategory, name: string): Promise<AonItem | null> {
    this.validateCategory(category);

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Item name cannot be empty');
    }

    try {
      const exactSearch = await this.client.search({
        index: sf2eConfig.index,
        query: {
          bool: {
            must: [
              { term: { category } },
              { match_phrase: { name: trimmedName } }
            ]
          }
        },
        size: 1,
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits", "url"]
      });

      let mainResult: AonItem | null = null;

      if (exactSearch.hits?.hits && exactSearch.hits.hits.length > 0) {
        mainResult = exactSearch.hits.hits[0]._source as AonItem;

        if (mainResult.url && !mainResult.url.startsWith('http')) {
          mainResult.url = `${sf2eConfig.baseUrl}${mainResult.url}`;
        }

        if (mainResult.price !== undefined && typeof mainResult.price === 'number') {
          mainResult.price = `${mainResult.price} credits`;
        }
      }

      const fuzzySearch = await this.client.search({
        index: sf2eConfig.index,
        query: {
          bool: {
            must: [
              { term: { category } },
              {
                multi_match: {
                  query: trimmedName,
                  fields: ["name^5", "description", "text"],
                  fuzziness: "AUTO",
                  minimum_should_match: "60%"
                }
              }
            ]
          }
        },
        size: 5,
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits", "url"]
      });

      if (!fuzzySearch.hits?.hits || fuzzySearch.hits.hits.length === 0) {
        return mainResult;
      }

      const similarItems = fuzzySearch.hits.hits.map(hit => {
        const item = hit._source as AonItem;

        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }

        if (item.price !== undefined && typeof item.price === 'number') {
          item.price = `${item.price} credits`;
        }

        return item;
      });

      if (mainResult) {
        const uniqueSimilarItems = similarItems.filter(item =>
          item.name.toLowerCase() !== mainResult!.name.toLowerCase()
        );

        if (uniqueSimilarItems.length > 0) {
          mainResult.similar_items = uniqueSimilarItems.slice(0, 4);
        }

        return mainResult;
      } else {
        const result = similarItems[0];
        if (similarItems.length > 1) {
          result.similar_items = similarItems.slice(1, 5);
        }

        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving SF2e ${category} item "${name}":`, errorMessage);
      throw new Error(`Failed to retrieve SF2e ${category} item "${name}": ${errorMessage}`);
    }
  }

  /**
   * Retrieves all items in a specific category
   */
  async getAllInCategory(
    category: Sf2eCategory,
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
        index: sf2eConfig.index,
        query: {
          term: { category }
        },
        from,
        size,
        sort: [{ "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "price", "id", "traits", "url"]
      });

      if (!search.hits?.hits) {
        throw new Error('Invalid response from Elasticsearch');
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;

        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }

        if (item.url && !item.formatted_url) {
          item.formatted_url = `[${item.name}](${item.url})`;
        }

        if (item.price === undefined) {
          item.price = "—";
        } else if (typeof item.price === 'number') {
          item.price = `${item.price} credits`;
        }

        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving all SF2e ${category} items:`, errorMessage);
      throw new Error(`Failed to retrieve SF2e ${category} items: ${errorMessage}`);
    }
  }

  /**
   * Retrieves all items of a specific level
   */
  async getItemsByLevel(
    level: number,
    itemCategories?: Sf2eCategory[]
  ): Promise<AonItem[]> {
    if (level < -1 || level > 25) {
      throw new Error('Item level must be between -1 and 25');
    }

    const allItems: AonItem[] = [];
    const pageSize = 250;

    try {
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
              { term: { category: 'rules' } },
              { term: { category: 'sidebar' } },
            ] : [
              ...(!itemCategories.includes('creature') ? [{ term: { category: 'creature' } }] : [])
            ])
          ]
        }
      };

      if (itemCategories && itemCategories.length > 0) {
        itemCategories.forEach(category => this.validateCategory(category));

        if (itemCategories.length === 1) {
          query.bool.must.push({ term: { category: itemCategories[0] } });
        } else {
          query.bool.must.push({
            terms: {
              category: itemCategories
            }
          });
        }
      } else {
        query.bool.must.push({
          terms: {
            category: ['armor', 'equipment', 'shield', 'weapon', 'vehicle', 'ammunition', 'computer']
          }
        });
      }

      let from = 0;
      let hasMoreItems = true;

      while (hasMoreItems) {
        const search = await this.client.search({
          index: sf2eConfig.index,
          query,
          from,
          size: pageSize,
          sort: [{ "name.keyword": { order: "asc" } }],
          _source: ["name", "category", "description", "text", "level", "price", "id", "traits", "url"]
        });

        if (!search.hits?.hits || search.hits.hits.length === 0) {
          hasMoreItems = false;
          continue;
        }

        const items = search.hits.hits.map((hit) => {
          const item = hit._source as AonItem;

          if (item.url && !item.url.startsWith('http')) {
            item.url = `${sf2eConfig.baseUrl}${item.url}`;
          }

          if (item.url && !item.formatted_url) {
            item.formatted_url = `[${item.name}](${item.url})`;
          }

          if (item.price === undefined) {
            item.price = "—";
          } else if (typeof item.price === 'number') {
            item.price = `${item.price} credits`;
          }

          return item;
        });

        allItems.push(...items);

        if (items.length < pageSize) {
          hasMoreItems = false;
        } else {
          from += pageSize;
        }
      }

      return allItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error retrieving SF2e items of level ${level}:`, errorMessage);
      throw new Error(`Failed to retrieve SF2e items of level ${level}: ${errorMessage}`);
    }
  }

  /**
   * Search for creatures by level range
   */
  async searchCreaturesByLevel(
    minLevel: number,
    maxLevel: number,
    options: { traits?: string[]; creatureType?: string; limit?: number } = {}
  ): Promise<AonItem[]> {
    const { traits, creatureType, limit = 20 } = options;

    try {
      const must: Record<string, unknown>[] = [
        { term: { category: 'creature' } },
        { range: { level: { gte: minLevel, lte: maxLevel } } }
      ];

      if (traits && traits.length > 0) {
        must.push({ terms: { traits: traits.map(t => t.toLowerCase()) } });
      }

      if (creatureType) {
        must.push({
          multi_match: {
            query: creatureType,
            fields: ["traits", "description", "text"],
            fuzziness: "AUTO"
          }
        });
      }

      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { bool: { must } },
        size: limit,
        sort: [{ level: { order: "asc" } }, { "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to search SF2e creatures: ${errorMessage}`);
    }
  }

  /**
   * Search for creatures by traits
   */
  async searchCreaturesByTrait(
    traits: string[],
    options: { minLevel?: number; maxLevel?: number; limit?: number } = {}
  ): Promise<AonItem[]> {
    const { minLevel, maxLevel, limit = 30 } = options;

    try {
      const must: Record<string, unknown>[] = [
        { term: { category: 'creature' } }
      ];

      // Search for traits in the traits field or text
      const should: Record<string, unknown>[] = traits.map(trait => ({
        multi_match: {
          query: trait,
          fields: ["traits^3", "text", "description"],
          fuzziness: "AUTO"
        }
      }));

      if (minLevel !== undefined || maxLevel !== undefined) {
        const range: Record<string, number> = {};
        if (minLevel !== undefined) range.gte = minLevel;
        if (maxLevel !== undefined) range.lte = maxLevel;
        must.push({ range: { level: range } });
      }

      const search = await this.client.search({
        index: sf2eConfig.index,
        query: {
          bool: {
            must,
            should,
            minimum_should_match: 1
          }
        },
        size: limit,
        sort: [{ level: { order: "asc" } }, { "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to search SF2e creatures by trait: ${errorMessage}`);
    }
  }

  /**
   * Search for hazards
   */
  async searchHazards(
    options: {
      query?: string;
      minLevel?: number;
      maxLevel?: number;
      hazardType?: 'trap' | 'environmental' | 'haunt' | 'all';
      complexity?: 'simple' | 'complex' | 'all';
      limit?: number;
    } = {}
  ): Promise<AonItem[]> {
    const { query, minLevel, maxLevel, hazardType = 'all', complexity = 'all', limit = 25 } = options;

    try {
      const must: Record<string, unknown>[] = [
        { term: { category: 'hazard' } }
      ];

      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ["name^3", "description", "text"],
            fuzziness: "AUTO"
          }
        });
      }

      if (minLevel !== undefined || maxLevel !== undefined) {
        const range: Record<string, number> = {};
        if (minLevel !== undefined) range.gte = minLevel;
        if (maxLevel !== undefined) range.lte = maxLevel;
        must.push({ range: { level: range } });
      }

      if (hazardType !== 'all') {
        must.push({
          multi_match: {
            query: hazardType,
            fields: ["traits", "text"],
            fuzziness: "AUTO"
          }
        });
      }

      if (complexity !== 'all') {
        must.push({
          multi_match: {
            query: complexity,
            fields: ["traits", "text"],
            fuzziness: "AUTO"
          }
        });
      }

      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { bool: { must } },
        size: limit,
        sort: [{ level: { order: "asc" } }, { "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to search SF2e hazards: ${errorMessage}`);
    }
  }

  /**
   * Get hazards by level
   */
  async getHazardsByLevel(
    level: number,
    includeAdjacent: boolean = true
  ): Promise<AonItem[]> {
    const minLevel = includeAdjacent ? level - 2 : level;
    const maxLevel = includeAdjacent ? level + 2 : level;

    return this.searchHazards({ minLevel, maxLevel, limit: 50 });
  }

  /**
   * Get deity information
   */
  async getDeityInfo(
    options: { name?: string; domain?: string; alignment?: string } = {}
  ): Promise<AonItem[]> {
    const { name, domain, alignment } = options;

    try {
      const must: Record<string, unknown>[] = [
        { term: { category: 'deity' } }
      ];

      if (name) {
        must.push({
          match_phrase: {
            name: {
              query: name,
              boost: 10
            }
          }
        });
      }

      if (domain) {
        must.push({
          multi_match: {
            query: domain,
            fields: ["text", "description"],
            fuzziness: "AUTO"
          }
        });
      }

      if (alignment) {
        must.push({
          multi_match: {
            query: alignment,
            fields: ["traits", "text"],
            fuzziness: "AUTO"
          }
        });
      }

      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { bool: { must } },
        size: 30,
        sort: [{ "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get SF2e deity info: ${errorMessage}`);
    }
  }

  /**
   * Get starship scenes (SF2e unique)
   */
  async getStarshipScenes(
    options: { minLevel?: number; maxLevel?: number; limit?: number } = {}
  ): Promise<AonItem[]> {
    const { minLevel, maxLevel, limit = 20 } = options;

    try {
      const must: Record<string, unknown>[] = [
        { term: { category: 'starship-scene' } }
      ];

      if (minLevel !== undefined || maxLevel !== undefined) {
        const range: Record<string, number> = {};
        if (minLevel !== undefined) range.gte = minLevel;
        if (maxLevel !== undefined) range.lte = maxLevel;
        must.push({ range: { level: range } });
      }

      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { bool: { must } },
        size: limit,
        sort: [{ level: { order: "asc" } }, { "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get SF2e starship scenes: ${errorMessage}`);
    }
  }

  /**
   * Get computers (SF2e unique)
   */
  async getComputers(limit: number = 20): Promise<AonItem[]> {
    try {
      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { term: { category: 'computer' } },
        size: limit,
        sort: [{ "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "level", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get SF2e computers: ${errorMessage}`);
    }
  }

  /**
   * Get planets (SF2e unique)
   */
  async getPlanets(limit: number = 50): Promise<AonItem[]> {
    try {
      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { term: { category: 'planet' } },
        size: limit,
        sort: [{ "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get SF2e planets: ${errorMessage}`);
    }
  }

  /**
   * Get factions (SF2e unique)
   */
  async getFactions(limit: number = 50): Promise<AonItem[]> {
    try {
      const search = await this.client.search({
        index: sf2eConfig.index,
        query: { term: { category: 'faction' } },
        size: limit,
        sort: [{ "name.keyword": { order: "asc" } }],
        _source: ["name", "category", "description", "text", "traits", "url"]
      });

      if (!search.hits?.hits) {
        return [];
      }

      return search.hits.hits.map((hit) => {
        const item = hit._source as AonItem;
        if (item.url && !item.url.startsWith('http')) {
          item.url = `${sf2eConfig.baseUrl}${item.url}`;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get SF2e factions: ${errorMessage}`);
    }
  }
}
