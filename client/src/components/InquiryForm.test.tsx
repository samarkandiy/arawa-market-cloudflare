import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InquiryForm from './InquiryForm';
import { submitInquiry } from '../api/inquiries';

// Mock the API
jest.mock('../api/inquiries');
const mockSubmitInquiry = submitInquiry as jest.MockedFunction<typeof submitInquiry>;

describe('InquiryForm Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show error when both email and phone are missing', async () => {
    render(<InquiryForm vehicleId={1} />);

    const nameInput = screen.getByLabelText(/お名前/);
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);

    await userEvent.type(nameInput, '山田太郎');
    await userEvent.type(messageInput, 'お問い合わせです');

    const submitButton = screen.getByText('送信する');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('メールアドレスまたは電話番号を入力してください。')
      ).toBeInTheDocument();
    });

    expect(mockSubmitInquiry).not.toHaveBeenCalled();
  });

  test('should show error for invalid email format', async () => {
    render(<InquiryForm vehicleId={1} />);

    const nameInput = screen.getByLabelText(/お名前/);
    const emailInput = screen.getByLabelText(/メールアドレス/);
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);

    await userEvent.type(nameInput, '山田太郎');
    await userEvent.type(emailInput, 'notanemail');
    await userEvent.type(messageInput, 'お問い合わせです');

    const submitButton = screen.getByText('送信する');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('有効なメールアドレスを入力してください。')
      ).toBeInTheDocument();
    });

    expect(mockSubmitInquiry).not.toHaveBeenCalled();
  });

  test('should accept valid email formats', async () => {
    mockSubmitInquiry.mockResolvedValue();

    render(<InquiryForm vehicleId={1} />);

    const nameInput = screen.getByLabelText(/お名前/);
    const emailInput = screen.getByLabelText(/メールアドレス/);
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);

    await userEvent.type(nameInput, '山田太郎');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(messageInput, 'お問い合わせです');

    const submitButton = screen.getByText('送信する');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitInquiry).toHaveBeenCalledWith({
        vehicleId: 1,
        customerName: '山田太郎',
        customerEmail: 'test@example.com',
        customerPhone: undefined,
        message: 'お問い合わせです',
        inquiryType: 'email',
      });
    });
  });

  test('should submit successfully with phone number instead of email', async () => {
    mockSubmitInquiry.mockResolvedValue();

    render(<InquiryForm vehicleId={1} />);

    const nameInput = screen.getByLabelText(/お名前/);
    const phoneInput = screen.getByLabelText(/電話番号/);
    const messageInput = screen.getByLabelText(/お問い合わせ内容/);

    await userEvent.type(nameInput, '山田太郎');
    await userEvent.type(phoneInput, '090-1234-5678');
    await userEvent.type(messageInput, 'お問い合わせです');

    const submitButton = screen.getByText('送信する');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitInquiry).toHaveBeenCalledWith({
        vehicleId: 1,
        customerName: '山田太郎',
        customerEmail: undefined,
        customerPhone: '090-1234-5678',
        message: 'お問い合わせです',
        inquiryType: 'email',
      });
    });
  });
});
