
/**
 * Interface representing treasure budget for a specific level
 */
export interface TreasureBudget {
    level: number;
    totalValue: number;
    permanentItems: { level: number; quantity: number }[];
    consumables: { level: number; quantity: number }[];
    partyCurrency: number;
    currencyPerAdditionalPC: number;
  }
  

/**
 * Treasure budgets by character level for a party of 4 PCs
 * Based on Table 10-9: Party Treasure by Level from the Core Rulebook
 */
export const TREASURE_BY_LEVEL: TreasureBudget[] = [
    {
      level: 1,
      totalValue: 175,
      permanentItems: [
        { level: 2, quantity: 2 },
        { level: 1, quantity: 2 }
      ],
      consumables: [
        { level: 2, quantity: 2 },
        { level: 1, quantity: 3 }
      ],
      partyCurrency: 40,
      currencyPerAdditionalPC: 10
    },
    {
      level: 2,
      totalValue: 300,
      permanentItems: [
        { level: 3, quantity: 2 },
        { level: 2, quantity: 2 }
      ],
      consumables: [
        { level: 3, quantity: 2 },
        { level: 2, quantity: 2 },
        { level: 1, quantity: 2 }
      ],
      partyCurrency: 70,
      currencyPerAdditionalPC: 18
    },
    {
      level: 3,
      totalValue: 500,
      permanentItems: [
        { level: 4, quantity: 2 },
        { level: 3, quantity: 2 }
      ],
      consumables: [
        { level: 4, quantity: 2 },
        { level: 3, quantity: 2 },
        { level: 2, quantity: 2 }
      ],
      partyCurrency: 120,
      currencyPerAdditionalPC: 30
    },
    {
      level: 4,
      totalValue: 850,
      permanentItems: [
        { level: 5, quantity: 2 },
        { level: 4, quantity: 2 }
      ],
      consumables: [
        { level: 5, quantity: 2 },
        { level: 4, quantity: 2 },
        { level: 3, quantity: 2 }
      ],
      partyCurrency: 200,
      currencyPerAdditionalPC: 50
    },
    {
      level: 5,
      totalValue: 1350,
      permanentItems: [
        { level: 6, quantity: 2 },
        { level: 5, quantity: 2 }
      ],
      consumables: [
        { level: 6, quantity: 2 },
        { level: 5, quantity: 2 },
        { level: 4, quantity: 2 }
      ],
      partyCurrency: 320,
      currencyPerAdditionalPC: 80
    },
    {
      level: 6,
      totalValue: 2000,
      permanentItems: [
        { level: 7, quantity: 2 },
        { level: 6, quantity: 2 }
      ],
      consumables: [
        { level: 7, quantity: 2 },
        { level: 6, quantity: 2 },
        { level: 5, quantity: 2 }
      ],
      partyCurrency: 500,
      currencyPerAdditionalPC: 125
    },
    {
      level: 7,
      totalValue: 2900,
      permanentItems: [
        { level: 8, quantity: 2 },
        { level: 7, quantity: 2 }
      ],
      consumables: [
        { level: 8, quantity: 2 },
        { level: 7, quantity: 2 },
        { level: 6, quantity: 2 }
      ],
      partyCurrency: 720,
      currencyPerAdditionalPC: 180
    },
    {
      level: 8,
      totalValue: 4000,
      permanentItems: [
        { level: 9, quantity: 2 },
        { level: 8, quantity: 2 }
      ],
      consumables: [
        { level: 9, quantity: 2 },
        { level: 8, quantity: 2 },
        { level: 7, quantity: 2 }
      ],
      partyCurrency: 1000,
      currencyPerAdditionalPC: 250
    },
    {
      level: 9,
      totalValue: 5700,
      permanentItems: [
        { level: 10, quantity: 2 },
        { level: 9, quantity: 2 }
      ],
      consumables: [
        { level: 10, quantity: 2 },
        { level: 9, quantity: 2 },
        { level: 8, quantity: 2 }
      ],
      partyCurrency: 1400,
      currencyPerAdditionalPC: 350
    },
    {
      level: 10,
      totalValue: 8000,
      permanentItems: [
        { level: 11, quantity: 2 },
        { level: 10, quantity: 2 }
      ],
      consumables: [
        { level: 11, quantity: 2 },
        { level: 10, quantity: 2 },
        { level: 9, quantity: 2 }
      ],
      partyCurrency: 2000,
      currencyPerAdditionalPC: 500
    },
    {
      level: 11,
      totalValue: 11500,
      permanentItems: [
        { level: 12, quantity: 2 },
        { level: 11, quantity: 2 }
      ],
      consumables: [
        { level: 12, quantity: 2 },
        { level: 11, quantity: 2 },
        { level: 10, quantity: 2 }
      ],
      partyCurrency: 2800,
      currencyPerAdditionalPC: 700
    },
    {
      level: 12,
      totalValue: 16500,
      permanentItems: [
        { level: 13, quantity: 2 },
        { level: 12, quantity: 2 }
      ],
      consumables: [
        { level: 13, quantity: 2 },
        { level: 12, quantity: 2 },
        { level: 11, quantity: 2 }
      ],
      partyCurrency: 4000,
      currencyPerAdditionalPC: 1000
    },
    {
      level: 13,
      totalValue: 25000,
      permanentItems: [
        { level: 14, quantity: 2 },
        { level: 13, quantity: 2 }
      ],
      consumables: [
        { level: 14, quantity: 2 },
        { level: 13, quantity: 2 },
        { level: 12, quantity: 2 }
      ],
      partyCurrency: 6000,
      currencyPerAdditionalPC: 1500
    },
    {
      level: 14,
      totalValue: 36500,
      permanentItems: [
        { level: 15, quantity: 2 },
        { level: 14, quantity: 2 }
      ],
      consumables: [
        { level: 15, quantity: 2 },
        { level: 14, quantity: 2 },
        { level: 13, quantity: 2 }
      ],
      partyCurrency: 9000,
      currencyPerAdditionalPC: 2250
    },
    {
      level: 15,
      totalValue: 54500,
      permanentItems: [
        { level: 16, quantity: 2 },
        { level: 15, quantity: 2 }
      ],
      consumables: [
        { level: 16, quantity: 2 },
        { level: 15, quantity: 2 },
        { level: 14, quantity: 2 }
      ],
      partyCurrency: 13000,
      currencyPerAdditionalPC: 3250
    },
    {
      level: 16,
      totalValue: 82500,
      permanentItems: [
        { level: 17, quantity: 2 },
        { level: 16, quantity: 2 }
      ],
      consumables: [
        { level: 17, quantity: 2 },
        { level: 16, quantity: 2 },
        { level: 15, quantity: 2 }
      ],
      partyCurrency: 20000,
      currencyPerAdditionalPC: 5000
    },
    {
      level: 17,
      totalValue: 128000,
      permanentItems: [
        { level: 18, quantity: 2 },
        { level: 17, quantity: 2 }
      ],
      consumables: [
        { level: 18, quantity: 2 },
        { level: 17, quantity: 2 },
        { level: 16, quantity: 2 }
      ],
      partyCurrency: 30000,
      currencyPerAdditionalPC: 7500
    },
    {
      level: 18,
      totalValue: 208000,
      permanentItems: [
        { level: 19, quantity: 2 },
        { level: 18, quantity: 2 }
      ],
      consumables: [
        { level: 19, quantity: 2 },
        { level: 18, quantity: 2 },
        { level: 17, quantity: 2 }
      ],
      partyCurrency: 48000,
      currencyPerAdditionalPC: 12000
    },
    {
      level: 19,
      totalValue: 355000,
      permanentItems: [
        { level: 20, quantity: 2 },
        { level: 19, quantity: 2 }
      ],
      consumables: [
        { level: 20, quantity: 2 },
        { level: 19, quantity: 2 },
        { level: 18, quantity: 2 }
      ],
      partyCurrency: 80000,
      currencyPerAdditionalPC: 20000
    },
    {
      level: 20,
      totalValue: 490000,
      permanentItems: [
        { level: 20, quantity: 4 }
      ],
      consumables: [
        { level: 20, quantity: 4 },
        { level: 19, quantity: 2 }
      ],
      partyCurrency: 140000,
      currencyPerAdditionalPC: 35000
    }
  ];
  