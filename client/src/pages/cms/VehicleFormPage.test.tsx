import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import VehicleFormPage from './VehicleFormPage';
import { getCategories } from '../../api/categories';
import { Category } from '../../api/types';

// Mock the API modules
jest.mock('../../api/categories');
jest.mock('../../api/client');
jest.mock('../../api/auth', () => ({
  authApi: {
    getToken: () => 'mock-token',
  },
}));

const mockGetCategories = getCategories as jest.MockedFunction<typeof getCategories>;

// Feature: used-trucks-marketplace, Property 6: Bilingual Category Display (CMS)
// Validates: Requirements 2.4
describe('Property 6: Bilingual Category Display (CMS)', () => {
  // Generator for valid categories with both Japanese and English names
  const categoryArbitrary = fc.record({
    id: fc.integer({ min: 1, max: 100 }),
    nameJa: fc.string({ minLength: 1, maxLength: 50 }),
    nameEn: fc.string({ minLength: 1, maxLength: 50 }),
    slug: fc.string({ minLength: 1, maxLength: 30 }),
  });

  const categoriesArrayArbitrary = fc.array(categoryArbitrary, { minLength: 1, maxLength: 20 });

  test('CMS should display category names in English', async () => {
    await fc.assert(
      fc.asyncProperty(categoriesArrayArbitrary, async (categories: Category[]) => {
        // Mock the API to return the generated categories
        mockGetCategories.mockResolvedValue(categories);

        // Render the vehicle form page
        render(
          <BrowserRouter>
            <VehicleFormPage />
          </BrowserRouter>
        );

        // Wait for categories to load
        await waitFor(() => {
          const categorySelect = screen.getByLabelText(/category/i);
          expect(categorySelect).toBeInTheDocument();
        });

        // Verify that all category options display English names
        categories.forEach(category => {
          const option = screen.getByRole('option', { name: category.nameEn });
          expect(option).toBeInTheDocument();
          expect(option).toHaveTextContent(category.nameEn);
          
          // Verify Japanese name is NOT displayed in CMS
          const allText = screen.queryByText(category.nameJa);
          // If Japanese text appears, it should not be in the category dropdown
          if (allText) {
            expect(allText.closest('select')).toBeNull();
          }
        });
      }),
      { numRuns: 100 }
    );
  });

  test('CMS category dropdown should use English names for all categories', async () => {
    await fc.assert(
      fc.asyncProperty(categoriesArrayArbitrary, async (categories: Category[]) => {
        mockGetCategories.mockResolvedValue(categories);

        render(
          <BrowserRouter>
            <VehicleFormPage />
          </BrowserRouter>
        );

        await waitFor(() => {
          expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        });

        const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
        const options = Array.from(categorySelect.options).filter(opt => opt.value !== '');

        // Verify the number of options matches the number of categories
        expect(options.length).toBe(categories.length);

        // Verify each option displays the English name
        options.forEach((option, index) => {
          const matchingCategory = categories.find(cat => cat.slug === option.value);
          if (matchingCategory) {
            expect(option.textContent).toBe(matchingCategory.nameEn);
          }
        });
      }),
      { numRuns: 100 }
    );
  });
});
