import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import VehicleFormPage from './VehicleFormPage';
import InquiriesPage from './InquiriesPage';
import apiClient from '../../api/client';
import { authApi } from '../../api/auth';
import { getCategories } from '../../api/categories';

// Mock modules
jest.mock('../../api/client');
jest.mock('../../api/categories');
jest.mock('../../api/auth', () => ({
  authApi: {
    login: jest.fn(),
    setToken: jest.fn(),
    getToken: jest.fn(() => 'mock-token'),
    logout: jest.fn(),
    isAuthenticated: jest.fn(() => true),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockGetCategories = getCategories as jest.MockedFunction<typeof getCategories>;

describe('CMS Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Test login flow - Requirements: 8.1
  describe('Login Flow', () => {
    test('should successfully login with valid credentials', async () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      mockAuthApi.login.mockResolvedValue({
        token: 'test-token-123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        userId: 1,
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await userEvent.type(usernameInput, 'admin');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(mockAuthApi.login).toHaveBeenCalledWith({
          username: 'admin',
          password: 'password123',
        });
        expect(mockAuthApi.setToken).toHaveBeenCalledWith('test-token-123');
      });
    });

    test('should display error message with invalid credentials', async () => {
      mockAuthApi.login.mockRejectedValue({
        response: {
          data: {
            error: {
              message: 'Invalid username or password',
            },
          },
        },
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await userEvent.type(usernameInput, 'wrong');
      await userEvent.type(passwordInput, 'wrong');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });
  });

  // Test vehicle creation with images - Requirements: 1.2, 1.5
  describe('Vehicle Creation Flow', () => {
    test('should create a new vehicle with all required fields', async () => {
      const mockCategories = [
        { id: 1, nameJa: '平ボディ', nameEn: 'Flatbed', slug: 'flatbed' },
        { id: 2, nameJa: 'ダンプ', nameEn: 'Dump', slug: 'dump' },
      ];

      mockGetCategories.mockResolvedValue(mockCategories);
      mockApiClient.post.mockResolvedValue({ data: { id: 1 } });

      render(
        <BrowserRouter>
          <VehicleFormPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(1); // More than just "Select Category"
      });

      // Fill in the form
      const categorySelect = screen.getByLabelText(/category/i);
      const makeInput = screen.getByLabelText(/make/i);
      const modelInput = screen.getByLabelText(/model/i);
      const yearInput = screen.getByLabelText(/year/i);
      const mileageInput = screen.getByLabelText(/mileage/i);
      const priceInput = screen.getByLabelText(/price/i);
      const conditionInput = screen.getByLabelText(/condition/i);
      const descriptionJaInput = screen.getByLabelText(/description \(japanese\)/i);

      fireEvent.change(categorySelect, { target: { value: 'flatbed' } });
      await userEvent.type(makeInput, 'Isuzu');
      await userEvent.type(modelInput, 'Forward');
      await userEvent.clear(yearInput);
      await userEvent.type(yearInput, '2020');
      await userEvent.clear(mileageInput);
      await userEvent.type(mileageInput, '50000');
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, '5000000');
      await userEvent.type(conditionInput, 'Good');
      await userEvent.type(descriptionJaInput, 'テスト車両');

      const submitButton = screen.getByRole('button', { name: /create vehicle/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/vehicles',
          expect.objectContaining({
            category: 'flatbed',
            make: 'Isuzu',
            model: 'Forward',
            year: 2020,
            mileage: 50000,
            price: 5000000,
            condition: 'Good',
            descriptionJa: 'テスト車両',
          }),
          expect.any(Object)
        );
      });
    });

    test('should validate required fields before submission', async () => {
      mockGetCategories.mockResolvedValue([]);

      render(
        <BrowserRouter>
          <VehicleFormPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create vehicle/i });
      await userEvent.click(submitButton);

      // Form should not submit without required fields
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  // Test inquiry management - Requirements: 4.3
  describe('Inquiry Management Flow', () => {
    test('should display list of inquiries', async () => {
      const mockInquiries = [
        {
          id: 1,
          vehicleId: 1,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '123-456-7890',
          message: 'Interested in this vehicle',
          inquiryType: 'email' as const,
          status: 'new' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          vehicleId: 2,
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          message: 'Can I schedule a viewing?',
          inquiryType: 'phone' as const,
          status: 'contacted' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockInquiries });

      render(
        <BrowserRouter>
          <InquiriesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/inquiries',
        expect.objectContaining({
          headers: { Authorization: 'Bearer mock-token' },
        })
      );
    });

    test('should update inquiry status', async () => {
      const mockInquiries = [
        {
          id: 1,
          vehicleId: 1,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          message: 'Interested in this vehicle',
          inquiryType: 'email' as const,
          status: 'new' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockInquiries });
      mockApiClient.put.mockResolvedValue({ data: { ...mockInquiries[0], status: 'contacted' } });

      render(
        <BrowserRouter>
          <InquiriesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click on the inquiry to select it
      const inquiryItem = screen.getByText('John Doe').closest('.inquiry-item');
      if (inquiryItem) {
        fireEvent.click(inquiryItem);
      }

      await waitFor(() => {
        const detailHeaders = screen.getAllByText('Inquiry Details');
        expect(detailHeaders.length).toBeGreaterThan(0);
      });

      // Click the "Contacted" status button
      const contactedButton = screen.getAllByText('Contacted').find(
        el => el.tagName === 'BUTTON'
      );
      if (contactedButton) {
        fireEvent.click(contactedButton);
      }

      await waitFor(() => {
        expect(mockApiClient.put).toHaveBeenCalledWith(
          '/inquiries/1',
          { status: 'contacted' },
          expect.objectContaining({
            headers: { Authorization: 'Bearer mock-token' },
          })
        );
      });
    });

    test('should filter inquiries by status', async () => {
      const mockInquiries = [
        {
          id: 1,
          vehicleId: 1,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          message: 'Test message 1',
          inquiryType: 'email' as const,
          status: 'new' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          vehicleId: 2,
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          message: 'Test message 2',
          inquiryType: 'phone' as const,
          status: 'closed' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockInquiries });

      render(
        <BrowserRouter>
          <InquiriesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Filter by "new" status
      const filterSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(filterSelect, 'new');

      // Only "new" inquiries should be visible
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  // Test authentication flow - Requirements: 8.1, 8.2
  describe('Authentication Flow', () => {
    test('should include auth token in protected requests', async () => {
      mockAuthApi.getToken.mockReturnValue('test-auth-token');
      mockApiClient.get.mockResolvedValue({ data: [] });

      render(
        <BrowserRouter>
          <InquiriesPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/inquiries',
          expect.objectContaining({
            headers: { Authorization: 'Bearer test-auth-token' },
          })
        );
      });
    });
  });
});
