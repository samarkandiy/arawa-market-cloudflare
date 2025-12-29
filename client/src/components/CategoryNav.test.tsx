import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import CategoryNav from './CategoryNav';
import { getCategories } from '../api/categories';
import { Category } from '../api/types';

// Mock the API
jest.mock('../api/categories');
const mockGetCategories = getCategories as jest.MockedFunction<typeof getCategories>;

// Feature: used-trucks-marketplace, Property 6: Bilingual Category Display
// Validates: Requirements 2.3
describe('Property 6: Bilingual Category Display (Frontend)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('for any category, the frontend displays the Japanese name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(
          fc.record({
            id: fc.integer({ min: 1, max: 100 }),
            nameJa: fc.constantFrom('平ボディ', 'ダンプ', 'クレーン', 'バン'),
            nameEn: fc.constantFrom('Flatbed', 'Dump', 'Crane', 'Van'),
            slug: fc.constantFrom('flatbed', 'dump', 'crane', 'van'),
          }),
          {
            minLength: 1,
            maxLength: 4,
            selector: (item) => item.id,
          }
        ),
        async (categories: Category[]) => {
          // Setup mock
          mockGetCategories.mockResolvedValue(categories);

          // Render component
          const { unmount } = render(
            <BrowserRouter>
              <CategoryNav />
            </BrowserRouter>
          );

          try {
            // Wait for categories to load
            await waitFor(
              () => {
                // Verify at least one Japanese name is displayed
                const firstCategory = categories[0];
                const elements = screen.getAllByText(firstCategory.nameJa);
                expect(elements.length).toBeGreaterThan(0);
              },
              { timeout: 1000 }
            );

            // Verify all Japanese names are displayed
            categories.forEach((category) => {
              const elements = screen.getAllByText(category.nameJa);
              expect(elements.length).toBeGreaterThan(0);
            });

            // Verify English names are NOT displayed
            categories.forEach((category) => {
              expect(screen.queryByText(category.nameEn)).not.toBeInTheDocument();
            });
          } finally {
            // Cleanup
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
