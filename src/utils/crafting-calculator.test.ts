import CraftingCalculator, { CraftingOptions } from './crafting-calculator.js';
import { AonItem } from '../config/types.js';

describe('CraftingCalculator', () => {
  // Mock items
  const mockSword: AonItem = {
    name: 'Longsword',
    category: 'weapon',
    level: 1,
    price: '10 gp',
    traits: ['common'],
    url: 'https://2e.aonprd.com/Weapons.aspx?ID=12'
  };

  const mockPotion: AonItem = {
    name: 'Healing Potion (Lesser)',
    category: 'potion',
    level: 3,
    price: '12 gp',
    traits: ['consumable', 'healing', 'magical', 'necromancy', 'positive'],
    url: 'https://2e.aonprd.com/Equipment.aspx?ID=186'
  };

  const mockRareItem: AonItem = {
    name: 'Staff of Power',
    category: 'staff',
    level: 16,
    price: '10000 gp',
    traits: ['rare', 'magical', 'staff'],
    url: 'https://2e.aonprd.com/Equipment.aspx?ID=1294'
  };

  // Test basic item information extraction
  test('correctly extracts item information', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const result = CraftingCalculator.calculateRequirements(mockSword, options);
    
    expect(result.item.name).toBe('Longsword');
    expect(result.item.level).toBe(1);
    expect(result.item.price).toBe(10);
    expect(result.item.rarity).toBe('common');
    expect(result.item.category).toBe('weapon');
    expect(result.item.isConsumable).toBe(false);
  });

  // Test consumable items
  test('correctly identifies consumable items', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const result = CraftingCalculator.calculateRequirements(mockPotion, options);
    
    expect(result.item.isConsumable).toBe(true);
    expect(result.item.price).toBe(12);
  });

  // Test prerequisites
  test('checks prerequisites correctly', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const result = CraftingCalculator.calculateRequirements(mockSword, options);
    
    expect(result.prerequisites.meetsLevelRequirement).toBe(true);
    expect(result.prerequisites.meetsProficiencyRequirement).toBe(true);
    expect(result.prerequisites.requiredFeats).toContain('Magical Crafting');
    expect(result.prerequisites.hasRequiredFeats).toBe(true);
    expect(result.prerequisites.missingFeats).toHaveLength(0);
  });

  // Test prerequisites for high-level items
  test('checks high-level item requirements correctly', () => {
    const options: CraftingOptions = {
      characterLevel: 16,
      proficiency: 'master',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const result = CraftingCalculator.calculateRequirements(mockRareItem, options);
    
    expect(result.prerequisites.meetsLevelRequirement).toBe(true);
    expect(result.prerequisites.meetsProficiencyRequirement).toBe(false); // Level 16 requires legendary
    expect(result.prerequisites.requiredFeats).toContain('Magical Crafting');
    expect(result.prerequisites.hasRequiredFeats).toBe(true);
  });

  // Test missing prerequisites
  test('identifies missing prerequisites', () => {
    const options: CraftingOptions = {
      characterLevel: 2,
      proficiency: 'trained',
      feats: [],
      useComplexCrafting: false,
      rushDays: 0
    };

    const result = CraftingCalculator.calculateRequirements(mockPotion, options);
    
    expect(result.prerequisites.meetsLevelRequirement).toBe(false); // Level 2 < potion level 3
    expect(result.prerequisites.hasRequiredFeats).toBe(false);
    expect(result.prerequisites.missingFeats).toContain('Magical Crafting');
  });

  // Test crafting time calculation - standard
  test('calculates standard crafting time correctly', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const result = CraftingCalculator.calculateRequirements(mockSword, options);
    
    expect(result.crafting.initialDays).toBe(4); // Standard 4 days
    expect(result.crafting.materialCost).toBe(5); // Half of 10gp
    expect(result.crafting.rushPenalty).toBe(0);
  });

  // Test crafting time calculation - complex crafting
  test('calculates complex crafting time correctly', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: true,
      rushDays: 0
    };

    const resultPermanent = CraftingCalculator.calculateRequirements(mockSword, options);
    // Level 1 sword is 3+ levels below character level 5, so it's 4 days for permanent item
    expect(resultPermanent.crafting.initialDays).toBe(4); 
    
    const resultConsumable = CraftingCalculator.calculateRequirements(mockPotion, options);
    // Level 3 potion is 2 levels below character level 5, so it's 3 days for consumable
    expect(resultConsumable.crafting.initialDays).toBe(3);
  });

  // Test rushing with expert
  test('handles rushing correctly with expert', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 1
    };

    const result = CraftingCalculator.calculateRequirements(mockSword, options);
    
    expect(result.crafting.initialDays).toBe(3); // 4 standard days - 1 rush day
    expect(result.crafting.rushPenalty).toBe(5); // +5 DC for expert rushing 1 day
    expect(result.crafting.dc).toBe(20); // Level 1 DC (15) + rush penalty (5) + rarity (0)
  });

  // Test rushing with master
  test('handles rushing correctly with master', () => {
    const options: CraftingOptions = {
      characterLevel: 10,
      proficiency: 'master',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 2
    };

    const result = CraftingCalculator.calculateRequirements(mockPotion, options);
    
    expect(result.crafting.initialDays).toBe(2); // 4 standard days - 2 rush days
    expect(result.crafting.rushPenalty).toBe(20); // +20 DC for master rushing 2 days
    expect(result.crafting.dc).toBe(38); // Level 3 DC (18) + rush penalty (20)
  });

  // Test complex crafting + rushing combination
  test('handles complex crafting with rushing correctly', () => {
    const options: CraftingOptions = {
      characterLevel: 10,
      proficiency: 'legendary',
      feats: ['Magical Crafting'],
      useComplexCrafting: true,
      rushDays: 2
    };

    const result = CraftingCalculator.calculateRequirements(mockPotion, options);
    
    // Level 3 potion is 7 levels below character level 10, so it's 2 days for consumable
    // With 2 days of rush reduction, it should be 4 hours (0.5 days)
    expect(result.crafting.initialDays).toBe(0.5);
    expect(result.crafting.rushPenalty).toBe(30); // +30 DC for 2 days rushing
    expect(result.crafting.dc).toBe(48); // Level 3 DC (18) + rush penalty (30)
  });

  // Test daily cost reduction calculation
  test('calculates daily cost reduction correctly', () => {
    const expertOptions: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const masterOptions: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'master',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };

    const expertResult = CraftingCalculator.calculateRequirements(mockSword, expertOptions);
    const masterResult = CraftingCalculator.calculateRequirements(mockSword, masterOptions);
    
    // Based on income earned table for level 5
    expect(expertResult.crafting.dailyReduction).toBe(1); // 100 cp = 1 gp
    expect(masterResult.crafting.dailyReduction).toBe(1); // 100 cp = 1 gp
    
    // Critical success gives bonuses
    expect(expertResult.crafting.criticalDailyReduction).toBeGreaterThan(expertResult.crafting.dailyReduction);
  });

  // Test price parsing
  test('parses different price formats correctly', () => {
    const options: CraftingOptions = {
      characterLevel: 5,
      proficiency: 'expert',
      feats: ['Magical Crafting'],
      useComplexCrafting: false,
      rushDays: 0
    };
    
    // Test different price formats
    const itemGold: AonItem = { ...mockSword, price: '15 gp' };
    const itemSilver: AonItem = { ...mockSword, price: '50 sp' };
    const itemCopper: AonItem = { ...mockSword, price: '200 cp' };
    const itemNumber: AonItem = { ...mockSword, price: 25 };
    
    const resultGold = CraftingCalculator.calculateRequirements(itemGold, options);
    const resultSilver = CraftingCalculator.calculateRequirements(itemSilver, options);
    const resultCopper = CraftingCalculator.calculateRequirements(itemCopper, options);
    const resultNumber = CraftingCalculator.calculateRequirements(itemNumber, options);
    
    expect(resultGold.crafting.materialCost).toBe(7.5); // Half of 15gp
    expect(resultSilver.crafting.materialCost).toBe(2.5); // Half of 5gp (50sp)
    expect(resultCopper.crafting.materialCost).toBe(1); // Half of 2gp (200cp)
    expect(resultNumber.crafting.materialCost).toBe(12.5); // Half of 25gp
  });
}); 