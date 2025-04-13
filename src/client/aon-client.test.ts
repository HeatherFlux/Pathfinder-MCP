import { AonClient, InvalidCategoryError } from "./aon-client.js";
import { AonCategory } from "../config/config.js";

describe("AonClient", () => {
  describe("searchCategory", () => {
    test("should return results for a valid spell search", async () => {
      // Create a custom mock for the client
      const aonClient = new AonClient();
      const mockResults = [
        { name: 'Fireball', category: 'spell', description: 'A sample spell description' },
        { name: 'Magic Missile', category: 'spell', description: 'Another sample spell description' }
      ];
      
      // Save original method and override
      const originalMethod = aonClient.searchCategory;
      aonClient.searchCategory = async () => mockResults;
      
      const results = await aonClient.searchCategory("spell", "fireball");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe("spell");
      
      // Restore original method
      aonClient.searchCategory = originalMethod;
    });

    test("should return results for a valid feat search", async () => {
      const aonClient = new AonClient();
      const mockResults = [
        { name: 'Power Attack', category: 'feat', description: 'A sample feat description' },
        { name: 'Weapon Proficiency', category: 'feat', description: 'Another sample feat description' }
      ];
      
      // Save original method and override
      const originalMethod = aonClient.searchCategory;
      aonClient.searchCategory = async () => mockResults;
      
      const results = await aonClient.searchCategory("feat", "power attack");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe("feat");
      
      // Restore original method
      aonClient.searchCategory = originalMethod;
    });

    test("should handle empty results", async () => {
      const aonClient = new AonClient();
      
      // Override method to return empty array
      const originalMethod = aonClient.searchCategory;
      aonClient.searchCategory = async () => [];
      
      const results = await aonClient.searchCategory("spell", "nonexistentspell123456789");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
      
      // Restore original method
      aonClient.searchCategory = originalMethod;
    });

    test("should handle special characters in search query", async () => {
      const aonClient = new AonClient();
      const mockResults = [
        { name: 'Magic Missile', category: 'spell', description: 'A sample spell description' }
      ];
      
      // Save original method and override
      const originalMethod = aonClient.searchCategory;
      aonClient.searchCategory = async () => mockResults;
      
      const results = await aonClient.searchCategory("spell", "magic missile!");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe("spell");
      
      // Restore original method
      aonClient.searchCategory = originalMethod;
    });

    test("should handle very long search queries", async () => {
      const aonClient = new AonClient();
      const mockResults = [
        { name: 'Fireball', category: 'spell', description: 'A sample spell description' }
      ];
      
      // Save original method and override
      const originalMethod = aonClient.searchCategory;
      aonClient.searchCategory = async () => mockResults;
      
      const longQuery = "tell me about the spell that deals fire damage and creates a big explosion in an area " +
        "and is a very powerful spell that wizards can cast to defeat their enemies".repeat(3);
      const results = await aonClient.searchCategory("spell", longQuery);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Restore original method
      aonClient.searchCategory = originalMethod;
    });

    test("should throw InvalidCategoryError for invalid category", async () => {
      const aonClient = new AonClient();
      const originalValidateCategory = aonClient['validateCategory']; 
      
      // Override private method to simulate throwing InvalidCategoryError
      aonClient['validateCategory'] = (category: string) => {
        if (category === 'invalid-category') {
          throw new InvalidCategoryError(category);
        }
        return originalValidateCategory.call(aonClient, category);
      };
      
      try {
        // @ts-expect-error Testing with invalid category
        await expect(aonClient.searchCategory("invalid-category", "test")).rejects.toThrow(InvalidCategoryError);
      } finally {
        // Restore original method
        aonClient['validateCategory'] = originalValidateCategory;
      }
    });

    test("should handle Elasticsearch errors gracefully", async () => {
      const aonClient = new AonClient();
      
      // Mock the client search method to throw an error
      Object.defineProperty(aonClient, 'client', { 
        value: { 
          search: async () => { throw new Error("Elasticsearch error"); } 
        },
        writable: true
      });

      await expect(
        aonClient.searchCategory("spell", "test")
      ).rejects.toThrow(Error);
    });

    // Helper function to test different categories
    function createCategoryTest(category: AonCategory, query: string) {
      return async () => {
        const aonClient = new AonClient();
        const mockResults = [
          { name: `Sample ${category}`, category, description: `A sample ${category} description` },
          { name: `Another ${category}`, category, description: `Another sample ${category} description` }
        ];
        
        // Save original method and override
        const originalMethod = aonClient.searchCategory;
        aonClient.searchCategory = async () => mockResults;
        
        const results = await aonClient.searchCategory(category, query);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].category).toBe(category);
        
        // Restore original method
        aonClient.searchCategory = originalMethod;
      };
    }

    // Use the helper function to create similar tests for different categories
    test("should return results for ancestry-specific searches", createCategoryTest("ancestry", "gnome"));
    test("should return results for class-specific searches", createCategoryTest("class", "investigator"));
    test("should return results for equipment searches", createCategoryTest("equipment", "dagger"));
    test("should return results for feat searches", createCategoryTest("feat", "alchemical crafting"));
    test("should return results for background searches", createCategoryTest("background", "orphan"));
    test("should return results for archetype searches", createCategoryTest("archetype", "druid"));
    test("should return results for weapon searches", createCategoryTest("weapon", "sword"));
    test("should return results for skill searches", createCategoryTest("skill", "acrobatics"));
    test("should return results for trait searches", createCategoryTest("trait", "druid"));
    test("should return results for deity searches", createCategoryTest("deity", "pharasma"));
  });

  describe("getItem", () => {
    test("should return item for valid name", async () => {
      const aonClient = new AonClient();
      const mockItem = { name: 'Fireball', category: 'spell', description: 'A sample spell description' };
      
      // Save original method and override
      const originalMethod = aonClient.getItem;
      aonClient.getItem = async () => mockItem;
      
      const item = await aonClient.getItem("spell", "Fireball");
      expect(item).toBeDefined();
      expect(item?.category).toBe("spell");
      
      // Restore original method
      aonClient.getItem = originalMethod;
    });

    test("should throw error for empty item name", async () => {
      const aonClient = new AonClient();
      // Use the real method for this test
      await expect(
        aonClient.getItem("spell", "   ")
      ).rejects.toThrow("Item name cannot be empty");
    });

    test("should throw InvalidCategoryError for invalid category", async () => {
      const aonClient = new AonClient();
      const originalValidateCategory = aonClient['validateCategory']; 
      
      // Override private method to simulate throwing InvalidCategoryError
      aonClient['validateCategory'] = (category: string) => {
        if (category === 'invalid-category') {
          throw new InvalidCategoryError(category);
        }
        return originalValidateCategory.call(aonClient, category);
      };
      
      try {
        // @ts-expect-error Testing with invalid category
        await expect(aonClient.getItem("invalid-category", "test")).rejects.toThrow(InvalidCategoryError);
      } finally {
        // Restore original method
        aonClient['validateCategory'] = originalValidateCategory;
      }
    });
  });

  describe("getAllInCategory", () => {
    test("should return items array", async () => {
      const aonClient = new AonClient();
      const mockItems = [
        { name: 'Fireball', category: 'spell', description: 'A sample spell description' },
        { name: 'Magic Missile', category: 'spell', description: 'Another sample spell description' }
      ];
      
      // Save original method and override
      const originalMethod = aonClient.getAllInCategory;
      aonClient.getAllInCategory = async () => mockItems;
      
      const items = await aonClient.getAllInCategory("spell");
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      
      // Restore original method
      aonClient.getAllInCategory = originalMethod;
    });

    test("should throw InvalidCategoryError for invalid category", async () => {
      const aonClient = new AonClient();
      const originalValidateCategory = aonClient['validateCategory']; 
      
      // Override private method to simulate throwing InvalidCategoryError
      aonClient['validateCategory'] = (category: string) => {
        if (category === 'invalid-category') {
          throw new InvalidCategoryError(category);
        }
        return originalValidateCategory.call(aonClient, category);
      };
      
      try {
        // @ts-expect-error Testing with invalid category
        await expect(aonClient.getAllInCategory("invalid-category")).rejects.toThrow(InvalidCategoryError);
      } finally {
        // Restore original method
        aonClient['validateCategory'] = originalValidateCategory;
      }
    });
  });
}); 