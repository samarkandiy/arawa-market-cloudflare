import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareButton from './ShareButton';
import { ToastProvider } from '../context/ToastContext';

// Mock navigator.share
const mockShare = jest.fn();
const mockClipboard = {
  writeText: jest.fn()
};

describe('ShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      share: mockShare,
      clipboard: mockClipboard
    });
  });

  const defaultProps = {
    title: 'Test Vehicle',
    text: 'Check out this vehicle',
    url: 'https://example.com/vehicle/1'
  };

  it('renders share button with label', () => {
    render(
      <ToastProvider>
        <ShareButton {...defaultProps} showLabel={true} />
      </ToastProvider>
    );

    expect(screen.getByText('共有')).toBeInTheDocument();
  });

  it('renders share button without label', () => {
    render(
      <ToastProvider>
        <ShareButton {...defaultProps} showLabel={false} />
      </ToastProvider>
    );

    expect(screen.queryByText('共有')).not.toBeInTheDocument();
  });

  it('calls navigator.share when supported', async () => {
    mockShare.mockResolvedValue(undefined);

    render(
      <ToastProvider>
        <ShareButton {...defaultProps} />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: defaultProps.title,
        text: defaultProps.text,
        url: defaultProps.url
      });
    });
  });

  it('shows fallback menu when navigator.share is not supported', async () => {
    Object.assign(navigator, { share: undefined });

    render(
      <ToastProvider>
        <ShareButton {...defaultProps} />
      </ToastProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('共有する')).toBeInTheDocument();
      expect(screen.getByText('リンクをコピー')).toBeInTheDocument();
      expect(screen.getByText('LINE')).toBeInTheDocument();
      expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('メール')).toBeInTheDocument();
    });
  });

  it('copies link to clipboard', async () => {
    Object.assign(navigator, { share: undefined });
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(
      <ToastProvider>
        <ShareButton {...defaultProps} />
      </ToastProvider>
    );

    // Open fallback menu
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    // Click copy link
    const copyButton = screen.getByText('リンクをコピー');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
    });
  });

  it('closes fallback menu when overlay is clicked', async () => {
    Object.assign(navigator, { share: undefined });

    render(
      <ToastProvider>
        <ShareButton {...defaultProps} />
      </ToastProvider>
    );

    // Open fallback menu
    const shareButton = screen.getByRole('button');
    fireEvent.click(shareButton);

    expect(screen.getByText('共有する')).toBeInTheDocument();

    // Click overlay
    const overlay = document.querySelector('.share-overlay');
    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByText('共有する')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <ToastProvider>
        <ShareButton {...defaultProps} className="custom-class" />
      </ToastProvider>
    );

    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });
});
