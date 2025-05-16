import TreasureGenerator from './treasure-generator';

describe('TreasureGenerator', () => {
  describe('generateTreasureBudget', () => {
    it('should generate budget for level 5 party of 4', () => {
      const result = TreasureGenerator.generateTreasureBudget('Generate treasure for a level 5 party of 4 players');
      expect(result).toContain('Treasure Budget for Level 5 Party (4 Players)');
      expect(result).toContain('1350 gold pieces');
      expect(result).toContain('2× level 6 items, 2× level 5 items');
      expect(result).toContain('2× level 6 items, 2× level 5 items, 2× level 4 items');
      expect(result).toContain('320 gold pieces');
    });

    it('should generate budget for level 10 party of 5 (larger party)', () => {
      const result = TreasureGenerator.generateTreasureBudget('Generate treasure for a party of 5 level 10 players');
      expect(result).toContain('Treasure Budget for Level 10 Party (5 Players)');
      expect(result).toContain('8000 gold pieces');
      expect(result).toContain('2500 gold pieces'); // 2000 + 500 for additional player
    });

    it('should generate budget for level 3 party of 3 (smaller party)', () => {
      const result = TreasureGenerator.generateTreasureBudget('Generate treasure for 3 players at level 3');
      expect(result).toContain('Treasure Budget for Level 3 Party (3 Players)');
      expect(result).toContain('90 gold pieces'); // 120 - 30 for fewer player
    });

    it('should detect sandbox campaigns', () => {
      const result = TreasureGenerator.generateTreasureBudget('Generate treasure for a level 6 party in a sandbox campaign');
      expect(result).toContain('Treasure Budget for Level 6 Party (4 Players)');
      expect(result).toContain('increased for sandbox campaign');
      expect(result).toContain('625 gold pieces'); // 500 + 125 sandbox adjustment
    });

    it('should handle level variations in prompt text', () => {
      const result1 = TreasureGenerator.generateTreasureBudget('Generate treasure for a lvl 7 party');
      expect(result1).toContain('Treasure Budget for Level 7 Party');

      const result2 = TreasureGenerator.generateTreasureBudget('Generate treasure for a 8th level party');
      expect(result2).toContain('Treasure Budget for Level 8 Party');
    });

    it('should handle edge cases with min and max levels', () => {
      const result1 = TreasureGenerator.generateTreasureBudget('Generate treasure for level 0 party');
      expect(result1).toContain('Treasure Budget for Level 1 Party'); // Should default to min level 1
      
      const result2 = TreasureGenerator.generateTreasureBudget('Generate treasure for level 30 party');
      expect(result2).toContain('Treasure Budget for Level 20 Party'); // Should cap at level 20
    });
  });
  
  describe('calculateTreasureBudget', () => {
    it('should calculate budget for standard party', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(5, 4, false);
      expect(budget).not.toBeNull();
      expect(budget?.level).toBe(5);
      expect(budget?.totalValue).toBe(1350);
      expect(budget?.partyCurrency).toBe(320);
      expect(budget?.permanentItems).toHaveLength(2);
      expect(budget?.consumables).toHaveLength(3);
    });
    
    it('should adjust currency for larger party', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(10, 6, false);
      expect(budget).not.toBeNull();
      expect(budget?.partyCurrency).toBe(3000); // 2000 + (2 * 500)
    });
    
    it('should adjust currency for smaller party', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(3, 2, false);
      expect(budget).not.toBeNull();
      expect(budget?.partyCurrency).toBe(60); // 120 - (2 * 30)
    });
    
    it('should adjust for sandbox campaigns', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(6, 4, true);
      expect(budget).not.toBeNull();
      expect(budget?.partyCurrency).toBe(625); // 500 + 125 sandbox adjustment
    });
    
    it('should return null for invalid level', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(99, 4, false);
      expect(budget).toBeNull();
    });
  });
  
  describe('formatTreasureBudget', () => {
    it('should format a budget correctly', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(5, 4, false);
      const result = TreasureGenerator.formatTreasureBudget(budget!, {partyLevel: 5, partySize: 4, isSandbox: false});
      
      expect(result).toContain('Treasure Budget for Level 5 Party (4 Players)');
      expect(result).toContain('1350 gold pieces');
      expect(result).not.toContain('increased for sandbox campaign');
      expect(result).toContain('320 gold pieces');
    });
    
    it('should note sandbox campaigns in formatting', () => {
      const budget = TreasureGenerator.calculateTreasureBudget(6, 4, true);
      const result = TreasureGenerator.formatTreasureBudget(budget!, {partyLevel: 6, partySize: 4, isSandbox: true});
      
      expect(result).toContain('Treasure Budget for Level 6 Party (4 Players)');
      expect(result).toContain('increased for sandbox campaign');
      expect(result).toContain('625 gold pieces');
    });
    
    it('should handle null budget', () => {
      const result = TreasureGenerator.formatTreasureBudget(null as any, {partyLevel: 99, partySize: 4, isSandbox: false});
      expect(result).toContain('Could not generate a treasure budget');
    });
  });
}); 