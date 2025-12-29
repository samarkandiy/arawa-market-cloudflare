import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickContact from './QuickContact';

describe('QuickContact', () => {
  beforeEach(() => {
    // Mock window.open
    global.open = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders toggle button', () => {
    render(<QuickContact />);
    expect(screen.getByLabelText('お問い合わせ')).toBeInTheDocument();
  });

  it('expands menu when toggle is clicked', () => {
    render(<QuickContact />);
    
    const toggleButton = screen.getByLabelText('お問い合わせ');
    fireEvent.click(toggleButton);

    expect(screen.getByText('電話する')).toBeInTheDocument();
    expect(screen.getByText('0078-6042-4011')).toBeInTheDocument();
    expect(screen.getByText('LINEで相談')).toBeInTheDocument();
  });

  it('collapses menu when toggle is clicked again', () => {
    render(<QuickContact />);
    
    const toggleButton = screen.getByLabelText('お問い合わせ');
    
    // Expand
    fireEvent.click(toggleButton);
    expect(screen.getByText('電話する')).toBeInTheDocument();
    
    // Collapse
    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);
    expect(screen.queryByText('電話する')).not.toBeInTheDocument();
  });

  it('initiates phone call when phone button is clicked', () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as Location;

    render(<QuickContact />);
    
    const toggleButton = screen.getByLabelText('お問い合わせ');
    fireEvent.click(toggleButton);

    const phoneButton = screen.getByText('電話する').closest('button');
    if (phoneButton) {
      fireEvent.click(phoneButton);
      expect(window.location.href).toBe('tel:0078-6042-4011');
    }

    window.location = originalLocation;
  });

  it('opens LINE when LINE button is clicked', () => {
    render(<QuickContact />);
    
    const toggleButton = screen.getByLabelText('お問い合わせ');
    fireEvent.click(toggleButton);

    const lineButton = screen.getByText('LINEで相談').closest('button');
    if (lineButton) {
      fireEvent.click(lineButton);
      expect(global.open).toHaveBeenCalledWith(
        'https://line.me/ti/p/',
        '_blank',
        'noopener,noreferrer'
      );
    }
  });

  it('shows correct icon when expanded', () => {
    const { container } = render(<QuickContact />);
    
    const toggleButton = screen.getByLabelText('お問い合わせ');
    fireEvent.click(toggleButton);

    // Check for close icon (X)
    const closeIcon = container.querySelector('.quick-contact-toggle svg line');
    expect(closeIcon).toBeInTheDocument();
  });

  it('shows correct icon when collapsed', () => {
    const { container } = render(<QuickContact />);
    
    // Check for message icon
    const messageIcon = container.querySelector('.quick-contact-toggle svg path');
    expect(messageIcon).toBeInTheDocument();
  });
});
