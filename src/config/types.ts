/**
 * Represents an item from the Archives of Nethys
 */
export interface AonItem {
  /** The name of the item */
  name: string;
  /** The category this item belongs to */
  category: string;
  /** Optional description of the item */
  description?: string;
  /** Optional detailed text content of the item */
  text?: string;
  /** Additional properties that may be present in the item */
  [key: string]: unknown;
}

/**
 * Represents the response structure from the AON Elasticsearch API
 */
export interface AonSearchResponse {
  /** The search results */
  hits: {
    /** Array of matching items */
    hits: Array<{
      /** The source data of the item */
      _source: AonItem;
    }>;
  };
} 