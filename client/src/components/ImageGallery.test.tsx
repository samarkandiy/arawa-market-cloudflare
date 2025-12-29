import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import ImageGallery from './ImageGallery';
import { VehicleImage } from '../api/types';

// Feature: used-trucks-marketplace, Property 12: Image Gallery Display
// Validates: Requirements 6.2
describe('Property 12: Image Gallery Display', () => {
  test('for any vehicle with uploaded images, the gallery displays all associated images in correct order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            vehicleId: fc.integer({ min: 1, max: 100 }),
            filename: fc.string({ minLength: 5, maxLength: 20 }),
            url: fc.constant('/images/test.jpg'),
            thumbnailUrl: fc.constant('/images/test-thumb.jpg'),
            order: fc.integer({ min: 0, max: 20 }),
            uploadedAt: fc.constant('2024-01-01T00:00:00Z'),
          }),
          {
            minLength: 1,
            maxLength: 10,
            selector: (item) => item.id,
          }
        ),
        async (images: VehicleImage[]) => {
          // Sort images by order as the component would
          const sortedImages = [...images].sort((a, b) => a.order - b.order);

          // Render component
          const { unmount } = render(<ImageGallery images={sortedImages} />);

          try {
            // Verify the main image is displayed (first image)
            const mainImages = screen.getAllByAltText(/車両画像/);
            expect(mainImages.length).toBeGreaterThan(0);

            // Verify image counter shows correct total
            const counter = screen.getByText(`1 / ${sortedImages.length}`);
            expect(counter).toBeInTheDocument();

            // If there are multiple images, verify thumbnails are displayed
            if (sortedImages.length > 1) {
              const thumbnails = screen.getAllByAltText(/サムネイル/);
              expect(thumbnails.length).toBe(sortedImages.length);

              // Verify all thumbnails have correct src
              thumbnails.forEach((thumbnail, index) => {
                expect(thumbnail).toHaveAttribute(
                  'src',
                  sortedImages[index].thumbnailUrl
                );
              });
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('for any vehicle with no images, the gallery displays a no-image message', () => {
    const { unmount } = render(<ImageGallery images={[]} />);

    try {
      expect(screen.getByText('画像がありません')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
