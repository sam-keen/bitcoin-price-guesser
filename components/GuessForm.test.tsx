import { render, screen, fireEvent } from '@testing-library/react';
import { GuessForm } from './GuessForm';

describe('GuessForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders up and down buttons', () => {
    render(<GuessForm onSubmit={mockOnSubmit} disabled={false} isLoading={false} />);

    expect(screen.getByRole('button', { name: /going up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /going down/i })).toBeInTheDocument();
  });

  it('calls onSubmit with "up" when up button is clicked', () => {
    render(<GuessForm onSubmit={mockOnSubmit} disabled={false} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /going up/i }));
    expect(mockOnSubmit).toHaveBeenCalledWith('up');
  });

  it('calls onSubmit with "down" when down button is clicked', () => {
    render(<GuessForm onSubmit={mockOnSubmit} disabled={false} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /going down/i }));
    expect(mockOnSubmit).toHaveBeenCalledWith('down');
  });

  it('disables buttons when disabled prop is true', () => {
    render(<GuessForm onSubmit={mockOnSubmit} disabled={true} isLoading={false} />);

    expect(screen.getByRole('button', { name: /going up/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /going down/i })).toBeDisabled();
  });

  it('disables buttons when isLoading is true', () => {
    render(<GuessForm onSubmit={mockOnSubmit} disabled={false} isLoading={true} />);

    expect(screen.getByRole('button', { name: /going up/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /going down/i })).toBeDisabled();
  });

  it('shows "submitting..." on up button when submittingDirection is "up"', () => {
    render(
      <GuessForm
        onSubmit={mockOnSubmit}
        disabled={false}
        isLoading={true}
        submittingDirection="up"
      />
    );

    expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /going up/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /going down/i })).toBeInTheDocument();
  });

  it('shows "submitting..." on down button when submittingDirection is "down"', () => {
    render(
      <GuessForm
        onSubmit={mockOnSubmit}
        disabled={false}
        isLoading={true}
        submittingDirection="down"
      />
    );

    expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /going up/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /going down/i })).not.toBeInTheDocument();
  });

  it('does not call onSubmit when button is disabled', () => {
    render(<GuessForm onSubmit={mockOnSubmit} disabled={true} isLoading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /going up/i }));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
