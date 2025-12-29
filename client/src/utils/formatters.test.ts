import * as fc from 'fast-check';
import { formatPrice } from './formatters';

// Feature: used-trucks-marketplace, Property 7: Price Formatting Consistency
// Validates: Requirements 3.3, 6.4
describe('Property 7: Price Formatting Consistency', () => {
  test('for any numeric price value, the frontend formats it with ¥ symbol and Japanese number formatting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100000000 }),
        async (price: number) => {
          const formatted = formatPrice(price);

          // Verify it starts with ¥ symbol
          expect(formatted).toMatch(/^¥/);

          // Verify it contains the price value with Japanese formatting
          const expectedFormat = `¥${price.toLocaleString('ja-JP')}`;
          expect(formatted).toBe(expectedFormat);

          // Verify thousands separator is present for numbers >= 1000
          if (price >= 1000) {
            expect(formatted).toContain(',');
          }

          // Verify no decimal places (Japanese Yen doesn't use decimals)
          expect(formatted).not.toContain('.');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('price formatting is consistent across multiple calls with same value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100000000 }),
        async (price: number) => {
          const formatted1 = formatPrice(price);
          const formatted2 = formatPrice(price);
          const formatted3 = formatPrice(price);

          // All calls should return identical results
          expect(formatted1).toBe(formatted2);
          expect(formatted2).toBe(formatted3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
