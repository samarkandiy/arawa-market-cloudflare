import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import VehicleDetailPage from './VehicleDetailPage';
import { getVehicle } from '../api/vehicles';
import { Vehicle } from '../api/types';

// Mock the API and router
jest.mock('../api/vehicles');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

const mockGetVehicle = getVehicle as jest.MockedFunction<typeof getVehicle>;

// Feature: used-trucks-marketplace, Property 11: Vehicle Detail Completeness
// Validates: Requirements 6.1, 6.3, 6.5
describe('Property 11: Vehicle Detail Completeness', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('for any vehicle, the detail page displays all core vehicle information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          category: fc.constantFrom('flatbed', 'dump', 'crane'),
          make: fc.constantFrom('いすゞ', '日野', '三菱ふそう'),
          model: fc.constantFrom('エルフ', 'レンジャー', 'キャンター'),
          year: fc.integer({ min: 2000, max: 2024 }),
          mileage: fc.integer({ min: 0, max: 500000 }),
          price: fc.integer({ min: 500000, max: 10000000 }),
          engineType: fc.constantFrom('ディーゼル', 'ガソリン'),
          length: fc.float({ min: 3, max: 12, noNaN: true }),
          width: fc.float({ min: 1.5, max: 2.5, noNaN: true }),
          height: fc.float({ min: 2, max: 4, noNaN: true }),
          condition: fc.constantFrom('良好', '普通', '要修理'),
          features: fc.array(fc.constantFrom('エアコン', 'パワステ', 'ABS'), {
            minLength: 0,
            maxLength: 3,
          }),
          descriptionJa: fc.string({ minLength: 10, maxLength: 100 }),
          images: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 100 }),
              vehicleId: fc.integer({ min: 1, max: 1000 }),
              filename: fc.string({ minLength: 5, maxLength: 20 }),
              url: fc.constant('/images/test.jpg'),
              thumbnailUrl: fc.constant('/images/test-thumb.jpg'),
              order: fc.integer({ min: 0, max: 10 }),
              uploadedAt: fc.constant('2024-01-01T00:00:00Z'),
            }),
            { minLength: 0, maxLength: 3 }
          ),
          createdAt: fc.constant('2024-01-01T00:00:00Z'),
          updatedAt: fc.constant('2024-01-01T00:00:00Z'),
        }),
        async (vehicle: Vehicle) => {
          // Setup mock
          mockGetVehicle.mockResolvedValue(vehicle);

          // Render component
          const { unmount } = render(
            <BrowserRouter>
              <VehicleDetailPage />
            </BrowserRouter>
          );

          try {
            // Wait for vehicle to load
            await waitFor(
              () => {
                // Verify make is displayed
                const elements = screen.getAllByText(new RegExp(vehicle.make));
                expect(elements.length).toBeGreaterThan(0);
              },
              { timeout: 2000 }
            );

            // Verify all core fields are displayed
            expect(screen.getAllByText(new RegExp(vehicle.make)).length).toBeGreaterThan(0);
            expect(screen.getAllByText(new RegExp(vehicle.model)).length).toBeGreaterThan(0);
            expect(
              screen.getAllByText(new RegExp(`${vehicle.year}年`)).length
            ).toBeGreaterThan(0);
            expect(
              screen.getAllByText(new RegExp(vehicle.mileage.toLocaleString('ja-JP'))).length
            ).toBeGreaterThan(0);
            expect(
              screen.getAllByText(new RegExp(`¥${vehicle.price.toLocaleString('ja-JP')}`)).length
            ).toBeGreaterThan(0);
            expect(screen.getAllByText(vehicle.engineType).length).toBeGreaterThan(0);
            expect(screen.getAllByText(vehicle.condition).length).toBeGreaterThan(0);

            // Verify dimensions if present
            if (vehicle.length && vehicle.width && vehicle.height) {
              expect(
                screen.getByText(new RegExp(`${vehicle.length}m`))
              ).toBeInTheDocument();
            }

            // Verify features if present
            if (vehicle.features && vehicle.features.length > 0) {
              vehicle.features.forEach((feature) => {
                expect(screen.getByText(new RegExp(feature))).toBeInTheDocument();
              });
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
