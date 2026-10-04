import { describe, expect, it } from 'vitest';
import { itemSchema, shoppingListSchema } from './schemas';

const validItem = {
  id: 'item-1',
  name: 'Greek yogurt',
  quantity: 1,
  unitPrice: 18900,
  isBought: false,
};

describe('itemSchema', () => {
  it('accepts a valid item', () => {
    const result = itemSchema.safeParse(validItem);

    expect(result.success).toBe(true);
  });

  it('cleans up extra spaces in the name', () => {
    const result = itemSchema.safeParse({
      ...validItem,
      name: '  Greek    yogurt ',
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Greek yogurt');
  });

  it('rejects a name that is only spaces', () => {
    const result = itemSchema.safeParse({ ...validItem, name: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['name']);
  });

  it('accepts a price of exactly 1,000,000', () => {
    const result = itemSchema.safeParse({
      ...validItem,
      unitPrice: 100_000_000,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a price above 1,000,000', () => {
    const result = itemSchema.safeParse({
      ...validItem,
      unitPrice: 100_000_001,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['unitPrice']);
  });

  it('accepts an item whose price is unknown (null)', () => {
    const result = itemSchema.safeParse({ ...validItem, unitPrice: null });

    expect(result.success).toBe(true);
  });
});

describe('shoppingListSchema', () => {
  const validList = {
    id: 'list-1',
    title: 'Weekly groceries',
    items: [validItem],
    budget: null,
    status: 'active',
    createdAt: '2026-10-04T10:00:00.000Z',
    updatedAt: '2026-10-04T10:00:00.000Z',
  };

  it('accepts a valid active list', () => {
    expect(shoppingListSchema.safeParse(validList).success).toBe(true);
  });

  it('rejects a completed list without a completedAt date', () => {
    const result = shoppingListSchema.safeParse({
      ...validList,
      status: 'completed',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['completedAt']);
  });
});
